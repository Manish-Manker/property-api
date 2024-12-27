import Property from '../models/propertyModel.js';
import Milestone from "../models/milestoneModel.js";
import Wallet from '../models/wallet.js'
import Transaction from '../models/transaction.js'
import { isValidObjectId } from "mongoose";
import { validateProperty, validateStatus } from '../utils/validation/propertyValidation.js'

export const setProperty = async (req, res) => {
    try {
        const userId = req.user._id;
        const propertyData = req.body;

        // joi validation
        const { error } = validateProperty(propertyData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: 400, message: error, data: null });
            return;
        }

        // check partner percentage should be 100
        let PartnerPercentage = checkPartnerPercentage(propertyData.partner);

        if (!PartnerPercentage) {
            console.log("Partner percentage should be 100");
            res.status(400).json({ status: 400, message: "Partner percentage should be 100", data: null });
            return;
        }

        propertyData.created_by = userId;

        // check property already exist or not
        const existingProperty = await Property.findOne({ property_name: propertyData.property_name, created_by: userId });
        if (existingProperty) {
            res.status(400).json({ status: 400, message: "Property already exist", data: null });
            return;
        }

        const property = new Property(propertyData);
        let saveProperty = await property.save();

        // check property saved or not 
        if (saveProperty.length === 0 || !saveProperty) {
            console.log(error);
            res.status(500).json({ status: 500, message: "Error in adding property", data: null });
            return;
        }

        // check property status is purchase or not if purchase then create milestone, transaction and update wallet
        if (saveProperty?.status === "purchase") {

            let milestoneData = await createMilestone(property, userId);
            let transactionData = await createTransaction(property, userId);
            let walletData = await updateWallet(property, userId);

            // check wallet balance
            if (!walletData) {
                res.status(400).json({ status: 400, message: "You don't have sufficient amount to purchase", data: null });
                return;
            }
            res.status(201).json({ status: 201, message: "Property added successfully", data: property });
            return;
        }
        res.status(201).json({ status: 201, message: "Property added successfully", data: property });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }
}

export const getProperty = async (req, res) => {
    try {
        const userId = req.user?._id;

        // check status to filter property data 
        const status = req.query?.status || req.body?.status;

        const limit = parseInt(req.body?.page_record) || 20;
        const toskip = limit * (parseInt(req.body?.page_no || 1) - 1);
        let properties;

        if (!status) {
            const dataprp = await Property.find({ created_by: userId })
                .populate('custumer_id', '_id name mobileNo address').sort({ $natural: -1 })
                .skip(toskip)
                .limit(limit);
            properties = dataprp;
        }
        else if (status) {

            // joi validation for status
            const { error } = validateStatus({ status });
            if (error) {
                res.status(400).json({ status: 400, message: error, data: null });
                console.log(error);
                return;
            }

            const dataprp = await Property.find({ created_by: userId, status })
                .populate('custumer_id', '_id name mobileNo address').sort({ $natural: -1 })
                .skip(toskip)
                .limit(limit);
            properties = dataprp;
        }

        // check property found or not
        if (properties?.length > 0) {
            const data = await Promise.all(properties.map(async (prop) => {
                let propertyId = prop?._doc?._id;

                // check milestone for property
                const result = await Milestone.find({ propertyId: propertyId });

                // calculate paid and unpaid milestone
                let paidMilestone = 0;
                let unpaidMilestone = 0;
                let totaldMilestone = result?.length || 0;

                if (result.length > 0) {
                    result.forEach(obj => {
                        if (obj.status === 'paid') {
                            paidMilestone++;
                        } else {
                            unpaidMilestone++;
                        }
                    });
                }
                return { ...prop._doc, totaldMilestone, paidMilestone, unpaidMilestone };
            }));
            res.status(200).json({ status: 200, message: "Properties fetched successfully", data });
        } else {
            res.status(404).json({ status: 404, message: "No properties found for this user", data: [] });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }
};

export const updateProperty = async (req, res) => {
    try {
        const propertyData = req.body;
        let propertyId = req.params?.id;

        // check property id is valid or not
        const isIDValid = isValidObjectId(propertyId);
        if (!isIDValid) {
            res.status(400).json({ status: "400", message: "Property id is not valid", data: null });
            return;
        }

        // joi validation
        const { error } = validateProperty(propertyData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: 400, message: error, data: null });
            return;
        }

        // check status is sold or purchase then check milestone paid or not
        if (propertyData.status === "sold" || propertyData.status === "purchase") {
            const result = await Milestone.find({ propertyId: propertyId });
            if (result.length === 0) {
                res.status(404).json({ status: 404, message: "Total Amount not Paid Yet, Milestone not found for this Property ", data: null });
                return;
            }

            let paidAmount = 0;
            let unpaidAmount = 0;
            let totalAmount = parseInt(propertyData.total);

            if (result.length > 0) {
                result.forEach(obj => {
                    if (obj.status === 'paid') {
                        paidAmount += parseInt(obj.amount);
                    } else {
                        unpaidAmount += parseInt(obj.amount);
                    }
                });
            }

            // check total amount paid or not
            if (paidAmount < totalAmount) {
                res.status(400).json({ status: 400, message: "Total Amount not Paid Yet, Can not change the Status", data: null });
                return;
            }
        }

        // exist property check
        let existproperty = await Property.findOne({ _id: { $ne: propertyId }, property_name: propertyData.property_name });

        // check partner percentage should be 100
        let PartnerPercentage = checkPartnerPercentage(propertyData.partner);
        if (!PartnerPercentage) {
            console.log("Partner percentage should be 100");
            res.status(400).json({ status: 400, message: "Partner percentage should be 100", data: null });
            return;
        }

        if (!existproperty) {
            // update property data only with status not equal to sold
            const updatedProperty = await Property.findOneAndUpdate({ _id: propertyId, status: { $ne: "sold" } }, { ...propertyData }, { new: true });
            if (updatedProperty) {
                res.status(200).json({ status: 200, message: "Property updated successfully", data: updatedProperty });
            } else {
                res.status(400).json({ status: 400, message: "Cannot update property with status 'sold'", data: null });
                return;
            }
        } else {
            res.status(404).json({ status: 404, message: "Property Already exist ", data: null });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }
}

export const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params?.id;
        const userId = req.user?._id;

        // check property id is valid or not
        const isIDValid = isValidObjectId(propertyId);
        if (!isIDValid) {
            res.status(400).json({ status: "400", message: "Property id is not valid", data: null });
            return;
        }

        // find property and delete with status added only 
        const property = await Property.findOneAndDelete({ _id: propertyId, created_by: userId, status: "added" });

        if (property) {
            // delete all milestone of property
            const result = await Milestone.deleteMany({ propertyId: propertyId, createdBy: userId });
            res.status(200).json({ status: 200, message: "Property deleted successfully", data: property });
        } else {
            res.status(404).json({ status: 404, message: "Can not delete Property with Status sold or deal_done or purchase ", data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }

}

const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

const checkPartnerPercentage = (partnerData) => {

    if (partnerData.length == 0 || partnerData === []) {
        return true;
    }
    let totalPercentage = 0;

    partnerData.forEach(obj => {
        totalPercentage += parseInt(obj.percentage);
    });

    if (totalPercentage === 100) {
        return true;
    } else {
        return false;
    }
}

const createMilestone = async (property, userId) => {
    const milestoneData = {
        amount: property.total,
        dueDate: formatDate(Date.now()),
        status: "paid",
        remark: "Direct purchase",
        propertyId: property._id,
        createdBy: userId,
    }
    const milestone = new Milestone(milestoneData);
    let data = await milestone.save();
    return data;
}

const createTransaction = async (property, userId) => {
    const transactionData = {
        transaction_type: "purchase",
        amount: property.total,
        remark: "Direct purchase",
        propertyId: property._id,
        userId: userId,
    }
    const transaction = new Transaction(transactionData);
    let data = await transaction.save();
    return data;
}

const updateWallet = async (property, userId) => {
    const walletData = await Wallet.find({ userId: userId });

    let oldBalance = parseInt(walletData[0]?.balance);
    if (oldBalance <= 0) {
        return false;
    }
    let newbalance = parseInt(property.total);

    if (oldBalance - newbalance <= 0) {
        return false;
    }
    const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance - newbalance }, { new: true });
    return data;
}