import Milestone from "../models/milestoneModel.js";
import Property from '../models/propertyModel.js';
import { validateMilestone } from '../utils/validation/milestoneValidation.js';
import { isValidObjectId } from "mongoose";

export const createMilestone = async (req, res) => {
    try {
        const userId = req.user?.id;
        const milestoneData = req.body;

        // Validation
        const { error } = validateMilestone(milestoneData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: "400", message: error, data: null });
            return;
        }

        const property = await Property.findOne({ _id: milestoneData.propertyId, created_by: userId });
        if (!property) {
            res.status(404).json({ status: "404", message: "Property not found", data: null });
            return;
        }

        // calculate total paid amount
        const milestones = await Milestone.find({ propertyId: milestoneData.propertyId, createdBy: userId });

        let totalPaidAmount = 0;
        milestones.forEach(milestone => {
            if (milestone.status === 'paid') {
                totalPaidAmount += parseInt(milestone.amount);
            }
        });
        const totalAmount = parseInt(property.total);
        const unpaidAmount = totalAmount - totalPaidAmount;

        // Check if total amount is already paid or not
        if (totalAmount === totalPaidAmount) {
            console.log("No milestone created, total amount is paid already");
            res.status(400).json({ status: "400", message: "No milestone created, total amount is paid already", data: null });
            return;
        }

        // Check if milestone amount exceeds unpaid amount
        if (parseInt(milestoneData.amount) > unpaidAmount) {
            res.status(400).json({ status: "400", message: "Milestone amount exceeds unpaid amount", data: null });
            return;
        }


        const milestone = new Milestone({ ...milestoneData, createdBy: userId });
        const result = await milestone.save();

        if (result) {
            res.status(201).json({ status: "201", message: "Milestone created successfully", data: result });
        } else {
            res.status(400).json({ status: "400", message: "Milestone not created", data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        return;
    }
}

export const getMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params?.id;

        const isIDValid = isValidObjectId(propertyId);
        if (!isIDValid) {
            res.status(400).json({ status: "400", message: "Property id is not valid", data: null });
            return;
        }

        const result = await Milestone.find({ createdBy: userId, propertyId: propertyId });
        const property = await Property.findOne({ _id: propertyId, created_by: userId });

        // calculate total paid amount and unpaid amount 
        let paidMilestone = 0;
        let unpaidMilestone = 0;
        let totalPaidAmount = 0;
        let totalUnpaidAmount = 0;

        let totalAmount = parseInt(property?.total) || 0;

        totalUnpaidAmount = parseInt(totalAmount) - parseInt(totalPaidAmount);

        if (result?.length > 0) {
            result.forEach(obj => {
                if (obj.status === 'paid') {
                    paidMilestone++;
                    totalPaidAmount += parseInt(obj.amount);
                } else {
                    unpaidMilestone++;
                }
            });
            totalUnpaidAmount = (parseInt(totalAmount) - parseInt(totalPaidAmount));
        } else {
            res.status(404).json({ status: "404", message: "Milestone not found for this Property ", data: null, totalAmount, paidMilestone, unpaidMilestone, totalPaidAmount, totalUnpaidAmount });
            return;
        }
        res.status(200).json({ status: "200", message: "Milestone fetched successfully", data: result, totalAmount, paidMilestone, unpaidMilestone, totalPaidAmount, totalUnpaidAmount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        return;
    }
}

export const updateMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestoneId = req.params?.id;

        // Check if milestone id is valid
        const isIDValid = isValidObjectId(milestoneId);
        if (!isIDValid) {
            res.status(400).json({ status: "400", message: "Milestone id is not valid", data: null });
            return;
        }

        const milestoneData = req.body;

        // joi valiadation 
        const { error } = validateMilestone(milestoneData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: "400", message: error, data: null });
            return;
        }

        const existingMilestone = await Milestone.findOne({ _id: milestoneId, createdBy: userId });

        // Check if milestone is already paid or not 
        if (existingMilestone && existingMilestone.status === 'unpaid') {
            const result = await Milestone.findOneAndUpdate({ _id: milestoneId, createdBy: userId }, milestoneData, { new: true });
            if (result) {
                res.status(200).json({ status: "200", message: "Milestone updated successfully", data: result });
            } else {
                res.status(400).json({ status: "400", message: "Milestone not updated", data: null });
                return;
            }
        } else {
            res.status(400).json({ status: "400", message: "Milestone cannot be updated as it is already paid", data: null });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        return;
    }
}

export const deleteMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestoneId = req.params?.id;

        // Check if milestone id is valid
        const isIDValid = isValidObjectId(milestoneId);
        if (!isIDValid) {
            res.status(400).json({ status: "400", message: "Milestone id is not valid", data: null });
            return;
        }

        // delete only unpaid milestone
        const result = await Milestone.findOneAndDelete({ _id: milestoneId, createdBy: userId, status: 'unpaid' });
        if (result) {
            res.status(200).json({ status: "200", message: "Milestone deleted successfully", data: result });
        } else {
            res.status(400).json({ status: "400", message: "Milestone can not be deleted as it is already paid", data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        return;
    }
}
