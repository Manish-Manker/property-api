import express from "express";
import {
    registerUser,
    loginUser,
    updateUser,
} from "../controllers/userControllers.js";


import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", userAuth, updateUser);


export default router;
