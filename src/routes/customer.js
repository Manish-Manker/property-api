import express from "express";
import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from "../controllers/customerControllers.js";

import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createCustomer);
router.get("/get", userAuth, getCustomers);
router.put("/update/:id", userAuth, updateCustomer);
router.delete("/delete/:id", userAuth, deleteCustomer);


export default router;
