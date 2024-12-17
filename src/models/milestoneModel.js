import mongoose from "mongoose";

const milestoneSchema = mongoose.Schema(
    {
        amount: {
            type: String,
            required: true,
        },
        dueDate: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const milestone = mongoose.model("milestone", milestoneSchema);

export default milestone;   
