import express from "express";
import { getBalance, addBalance } from "../controllers/walletControllers.js";

import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/getbalance", userAuth, getBalance);
router.post("/addbalance", userAuth, addBalance);




// router.post("/create", userAuth, createCustomer);
// router.put("/update/:id", userAuth, updateCustomer);
// router.delete("/delete/:id", userAuth, deleteCustomer);


export default router;
