import Wallet from '../models/wallet.js'
import Transaction from '../models/transaction.js'


export const saveTransaction = async (req, res) => {
    try {
        const userId = req.user._id;
        let transactionData = req.body;

        // validation 

        let type = transactionData?.transaction_type;


        if (type == "addBalance" || "sell") {

            const walletData = await Wallet.find({ userId: userId });
            let oldBalance = walletData[0]?.balance;

            oldBalance = parseInt(oldBalance);
            let newbalance = parseInt(transactionData.amount);

            const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance + newbalance }, { new: true });

            if (!data) {
                res.status(400).json({ status: 400, message: "balance not updated in Wallet", data: null })
                return;
            }


        } else if (type == "subtractBalance" || "purchase") {

            const walletData = await Wallet.find({ userId: userId });
            let oldBalance = walletData[0]?.balance;

            oldBalance = parseInt(oldBalance);
            let newbalance = parseInt(transactionData.amount);

            if (oldBalance - newbalance < 0) {
                res.status(400).json({ status: 400, message: "You dont have sufficient amount to subtract", data: null })
                return;
            }

            const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance - newbalance }, { new: true });

            if (!data) {
                res.status(400).json({ status: 400, message: "balance not updated in Wallet", data: null })
                return;
            }

        }

        let transaction = new Transaction({ ...transactionData, userId: userId })

        let result = await transaction.save();

        if (result) {
            res.status(201).json({ status: 201, message: "transaction save succesful", data: result });
        } else {
            res.status(401).json({ status: 401, message: "transaction did not save", data: null })
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
        let data = await Transaction.find({ userId: userId });
        if (data !== []) {
            data = data.reverse();
            res.status(200).json({ status: 200, message: "transaction found", data });
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