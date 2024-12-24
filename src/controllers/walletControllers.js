import Wallet from '../models/wallet.js'
import Transaction from '../models/transaction.js'

export const getBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const walletData = await Wallet.find({ userId: userId });

        if (walletData == [] || walletData.length == 0) {
            let data = new Wallet({
                balance: 0,
                userId: userId
            });
            let result = await data.save();
            if (result) {
                res.status(201).json({ status: 200, message: "balance Found successfully", data: { balance: data.balance } });
                return;
            } else {
                res.status(400).json({ status: 400, message: "balance not Found", data: null });
                return;
            }
        }

        let balance = walletData[0]?.balance;
        res.status(200).json({ status: 200, message: "balance found successfully", data: balance });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal server Error", data: null });
        return;
    }
}

export const addBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        let newbalance = req?.body?.balance;

        if (!newbalance) {
            return res.status(400).json({ status: 400, message: "Balance is required", data: null });
        }

        const walletData = await Wallet.find({ userId: userId });

        if (walletData == [] || walletData.length == 0) {
            let data = new Wallet({
                balance: newbalance,
                userId: userId
            })
            let result = await data.save();
            if (result) {
                res.status(201).json({ status: 200, message: "balance added successfully", data: { balance: data.balance } })
                return;
            } else {
                res.status(400).json({ status: 400, message: "balance not updated", data: null })
                return;
            }
        }

        let oldBalance = walletData[0]?.balance;

        oldBalance = parseInt(oldBalance);
        newbalance = parseInt(newbalance);

        const data = await Wallet.findOneAndUpdate({ userId: userId }, { balance: oldBalance + newbalance }, { new: true });

        if (data) {
            res.status(201).json({ status: 200, message: "balance added successfully", data: { balance: data.balance } })
        } else {
            res.status(400).json({ status: 400, message: "balance not updated", data: null })
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 400, message: "Internal server error", data: null });
        return;
    }
}