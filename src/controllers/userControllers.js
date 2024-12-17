import User from "../models/userModel.js";
import { generateToken } from "../utils/generateJWTToken.js";
import { validateUser, validateLoginUser } from "../utils/validation/userValidation.js";


export const registerUser = async (req, res) => {

    try {
        const { name, password, mobileNo } = req.body;
        let { error } = await validateUser({ name, password, mobileNo });
        if (error) {
            res.status(400).json({ status: 400, message: error, data: null });
            console.log(error);
            return;
        }
        const userExixt = await User.find({ mobileNo });

        if (userExixt.lenght !== [] && userExixt.length > 0) {
            res.status(400).json({ status: 400, message: "user Already Exist", data: null });
            return new Error("User Already Exist");
        }
        const newUser = await User.create({
            name,
            password,
            mobileNo
        });
        if (newUser) {
            res.status(201).json({
                status: 201,
                message: "User registerd Successfully",
                data: {
                    id: newUser._id,
                    name: newUser.name,
                    mobileNo: newUser.mobileNo,
                    token: generateToken(newUser._id),
                }
            });
        } else {
            res.status(400).json({ status: 400, message: "User not Created in DB", data: null });
            return new Error("Invalid User Data");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error", data: null });
        return new Error("Internal Server Error");
    }
};

export const loginUser = async (req, res) => {

    try {
        const { mobileNo, password } = req.body;
        // validation joi

        let { error } = await validateLoginUser({ mobileNo, password });
        if (error) {
            res.status(400).json({ status: 400, message: error, data: null });
            console.log(error);
            return;
        }

        const user = await User.findOne({ mobileNo });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                status: 200,
                message: "Login Successfully",
                data: {
                    id: user._id,
                    name: user.name,
                    mobileNo: user.mobileNo,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(404).json({ status: 404, message: "Invalid Mobile Number or password", data: null });
            return new Error("Invalid Mobile Number or password");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error", data: null });
        return new Error("Internal Server Error");
    }
};

export const updateUser = async (req, res) => {
    try {
        const userExixt = await User.findById(req.user._id);
        const { name, password, mobileNo } = req.body;
        let { error } = await validateUser({ name, password, mobileNo });
        if (error) {
            res.status(400).json({ status: 400, message: error, data: null });
            console.log(error);
            return;
        }
        if (userExixt) {
            userExixt.name = name;
            userExixt.mobileNo = mobileNo;
            userExixt.password = password;
            const updateData = await userExixt.save();
            const data = updateData.toObject();
            const token = generateToken(data._id);

            delete data.password;
            data.token = token;
            return res.status(200).json({ status: 200, message: "User Updated Successfully", data: data });
        } else {
            res.status(404).json({ status: 404, message: "No user data found", data: null });
            return new Error("No user data found");
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error", data: null });
    }
};
