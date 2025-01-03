import express from "express";
import { saveTransaction , getTransaction } from "../controllers/transactionControllers.js";

import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/save", userAuth, saveTransaction);
router.get("/get", userAuth, getTransaction);

export default router;