import mongoose from "mongoose";

// Connect to the database
export const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        return ("Connected to the database");
    } catch (error) {
        return (error);
    }
}