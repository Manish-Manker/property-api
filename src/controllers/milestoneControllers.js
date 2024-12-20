import Milestone from "../models/milestoneModel.js";
import { validateMilestone } from '../utils/validation/milestoneValidation.js';

export const createMilestone = async (req, res) => {
    try {
        const userId = req.user?.id;
        const milestoneData = req.body;

        //valiadation
        const { error } = validateMilestone(milestoneData);
        if (error) {
            res.status(400).json({ status: "400", message: error, data: null });
            console.log(error);
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
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        console.log(error);
        return;
    }
}

export const getMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params?.id;
        if (!propertyId) {
            res.status(400).json({ status: "400", message: "Property id not found", data: null });
            return;
        }
        const result = await Milestone.find({ createdBy: userId, propertyId: propertyId });

        if (result !== [] && result.length > 0) {

            let paidMilestone = 0;
            let unpaidMilestone = 0;
            result.forEach(obj => {
                if (obj.status === 'paid') {
                    paidMilestone++;
                } else {
                    unpaidMilestone++
                }

            });
            res.status(200).json({ status: "200", message: "Milestone fetched successfully", data: result , paidMilestone , unpaidMilestone });
        } else {
            res.status(404).json({ status: "404", message: "Milestone not found for this Property ", data: [] });
            return;
        }
    } catch (error) {
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        console.log(error);
        return;
    }
}

export const updateMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestoneId = req.params?.id;

        if (!milestoneId) {
            res.status(400).json({ status: "400", message: "Milestone id not found", data: null });
            return;
        }
        const milestoneData = req.body;

        //valiadation
        const { error } = validateMilestone(milestoneData);
        if (error) {
            res.status(400).json({ status: "400", message: error, data: null });
            console.log(error);
            return;
        }

        const result = await Milestone.findOneAndUpdate({ _id: milestoneId, createdBy: userId }, milestoneData, { new: true });
        if (result) {
            res.status(200).json({ status: "200", message: "Milestone updated successfully", data: result });
        } else {
            res.status(400).json({ status: "400", message: "Milestone not updated", data: null });
            return
        }

    } catch (error) {
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        console.log(error);
        return
    }
}

export const deleteMilestone = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestoneId = req.params?.id;
        if (!milestoneId) {
            res.status(400).json({ status: "400", message: "Milestone id not found", data: null });
            return;
        }
        const result = await Milestone.findOneAndDelete({ _id: milestoneId, createdBy: userId });
        if (result) {
            res.status(200).json({ status: "200", message: "Milestone deleted successfully", data: result });
        } else {
            res.status(400).json({ status: "400", message: "Milestone not deleted", data: null });
            return;
        }

    } catch (error) {
        res.status(500).json({ status: "500", message: "Internal server error", data: null });
        console.log(error);
        return;
    }
}