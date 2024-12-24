import express from "express";
import { getBalance, addBalance } from "../controllers/walletControllers.js";

import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/getbalance", userAuth, getBalance);
router.post("/addbalance", userAuth, addBalance);

export default router;
