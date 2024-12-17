import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


export const userAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res
                    .status(401)
                    .json({ status: 401, message: "User not found, unauthorized", data: null });
            }
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ status: 401, message: "User not found, unauthorized, token failed", data: null });
        }
    } else {
        return res.status(401).json({ status: 401, message: "Not authorized, no token", data: null });
    }
};
