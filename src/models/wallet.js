import mongoose from "mongoose";

const walletSchema = mongoose.Schema(
    {
        balance: {
            type: Number,
            required: true,
            default:0
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Wallet = mongoose.model("wallet", walletSchema);

export default Wallet;