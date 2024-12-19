import Property from '../models/propertyModel.js'
import Milestone from "../models/milestoneModel.js";
import { validateProperty } from '../utils/validation/propertyValidation.js'

export const setProperty = async (req, res) => {
    try {
        const userId = req.user._id;
        const propertyData = req.body;

        // joi validation
        const { error } = validateProperty(propertyData);
        if (error) {
            res.status(400).json({ status: 400, message: error, data: null });
            console.log(error);
            return;
        }

        propertyData.created_by = userId;
        const property = new Property(propertyData);

        property.save().then((property) => {
            res.status(201).json({ status: 201, message: "Property added successfully", data: property });
        }).catch((error) => {
            res.status(500).json({ status: 500, message: "Error in adding property", data: null });
            console.log(error);
            return;
        })
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        console.log(error);
        return;
    }
}

export const getProperty = async (req, res) => {
    try {
        const userId = req.user?._id;

        const limit = parseInt(req.body?.page_record) || 20;
        const toskip = limit * (parseInt(req.body?.page_no || 1) - 1);

        const properties = await Property.find({ created_by: userId })
            .populate('custumer_id', '_id name mobileNo address')
            .skip(toskip)
            .limit(limit);

        if (properties?.length > 0) {
            const data = await Promise.all(properties.map(async (prop) => {
                let propertyId = prop?._doc?._id;
                // console.log("propertyId - >", propertyId);

                const result = await Milestone.find({ propertyId: propertyId });
                // console.log("result->", result);

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

        if (!propertyId) {
            res.status(400).json({ status: 400, message: "Property id is required", data: null });
            return;
        }
        let property = await Property.findOne({ _id: propertyId });

        const { error } = validateProperty(propertyData);
        if (error) {
            res.status(400).json({ status: 400, message: error, data: null });
            console.log(error);
            return;
        }

        if (property) {
            property = await Property.findOneAndUpdate({ _id: propertyId }, { ...propertyData }, { new: true });
            res.status(200).json({ status: 200, message: "Property updated successfully", data: property });
        } else {
            res.status(404).json({ status: 404, message: "Property did not exist ", data: null });
            return;
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        console.log(error);
        return;
    }
}

export const deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params?.id;
        const userId = req.user?._id;

        const property = await Property.findOneAndDelete({ _id: propertyId, created_by: userId });
        // console.log(property);

        const result = await Milestone.deleteMany({ propertyId: propertyId, createdBy: userId });
        // console.log("->",result);


        if (property) {
            res.status(200).json({ status: 200, message: "Property deleted successfully", data: property });
        } else {
            res.status(404).json({ status: 404, message: "Property did not exist ", data: null });
            return;
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        console.log(error);
        return;
    }

}