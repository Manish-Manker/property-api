import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
    {
        transaction_type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        }
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model("transaction", transactionSchema);

export default Transaction;