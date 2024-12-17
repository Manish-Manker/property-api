import Property from '../models/propertyModel.js'
import { validateProperty } from '../utils/validation/propertyValidation.js'

export const setProperty = async (req, res) => {
    try {
        const userId = req.user._id;
        const propertyData = req.body;

        // joi validation
        const { error } = validateProperty(propertyData);
        if (error) {
            console.log(error);
            return res.status(400).json({ status: 400, message: error, data: null });
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
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }
}

export const getProperty = async (req, res) => {
    try {
        const userId = req.user._id;

        const limit = parseInt(req.body?.page_record) || 20;

        const toskip = limit * (parseInt(req.body?.page_no || 1) - 1);

        const properties = await Property.find({ created_by: userId }).populate('custumer_id', '_id name mobileNo').skip(toskip).limit(limit);

        if (properties?.length > 0 && properties !== []) {

            const data = properties.map((property) => {
                return { ...property._doc }
            });

            res.status(200).json({ status: 200, message: "Properties fetched successfully", data });

        } else {
            res.status(404).json({ status: 404, message: "No properties found", data: [] });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return
    }
}

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
            console.log(error);
            return res.status(400).json({ status: 400, message: error, data: null });
        }

        if (property) {
            property = await Property.findOneAndUpdate({ _id: propertyId }, { ...propertyData }, { new: true });
            res.status(200).json({ status: 200, message: "Property updated successfully", data: property });
        } else {
            res.status(404).json({ status: 404, message: "Property did not exist ", data: null });
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
        
        const property = await Property.findOneAndDelete({ _id: propertyId });
        if (property) {
            res.status(200).json({ status: 200, message: "Property deleted successfully", data: property });
        } else {
            res.status(404).json({ status: 404, message: "Property did not exist ", data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error", data: null });
        return;
    }

}