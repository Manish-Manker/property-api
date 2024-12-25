import Wallet from '../models/wallet.js'
import Transaction from '../models/transaction.js'
import Property from '../models/propertyModel.js'
import { validateTransaction } from '../utils/validation/transactionValidation.js';


export const saveTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        let transactionData = req.body;
        let propertyId = req.body?.propertyId;


        // validation 
        const { error } = validateTransaction(transactionData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: 400, message: error, data: null });
            return;
        }

        let type = transactionData?.transaction_type;

        if (type === "addBalance" || type === "sell") {
            console.log("add");

            const walletData = await Wallet.find({ userId: userId });
            // console.log("walletData",walletData);

            let oldBalance = walletData[0]?.balance;

            oldBalance = parseInt(oldBalance);
            let newbalance = parseInt(transactionData.amount);

            const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance + newbalance }, { new: true });
            // console.log(data);

            if (!data) {
                res.status(400).json({ status: 400, message: "balance not updated in Wallet", data: null });
                return;
            }

        } else if (type == "subtractBalance" || type == "purchase") {
            console.log("sub");

            const walletData = await Wallet.find({ userId: userId });
            let oldBalance = walletData[0]?.balance;

            oldBalance = parseInt(oldBalance);
            let newbalance = parseInt(transactionData.amount);

            if (oldBalance - newbalance < 0) {
                console.log("You don't have sufficient amount to subtract");
                res.status(400).json({ status: 400, message: "You don't have sufficient amount to subtract", data: null });
                return;
            }

            const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance - newbalance }, { new: true });

            if (!data) {
                console.log("balance not updated in Wallet");
                res.status(400).json({ status: 400, message: "balance not updated in Wallet", data: null });
                return;
            }
        }

        if (propertyId) {
            let status;
            if (type === "purchase") status = "purchase";
            if (type === "sell") status = "sold";

            let propertyData = await Property.findOneAndUpdate({ _id: propertyId }, { status }, { new: true });

            if (!propertyData) {
                console.log("property status not updated");
                res.status(400).json({ status: 400, message: "property status not updated", data: null });
                return;
            }
        }

        let transaction = new Transaction({ ...transactionData, userId: userId });
        let result = await transaction.save();

        if (result) {
            res.status(201).json({ status: 201, message: "Transaction save successfully", data: result });
        } else {
            res.status(401).json({ status: 401, message: "Transaction did not save", data: null });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server Error", data: null });
        return;
    }
}

export const getTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        let data = await Transaction.find({ userId: userId }).sort({ $natural: -1 });
        if (data !== []) {
            res.status(200).json({ status: 200, message: "transaction found successfully", data });
        } else {
            res.status(404).json({ status: "transaction not found", data });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error", data: null });
        return;
    }
}