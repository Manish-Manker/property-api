import express from "express";
import { setProperty, getProperty, updateProperty, deleteProperty } from "../controllers/propertyControllers.js";
import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/set", userAuth, setProperty);
router.get("/get", userAuth, getProperty);
router.put("/update/:id", userAuth, updateProperty);
router.delete("/delete/:id", userAuth, deleteProperty);

export default router;
