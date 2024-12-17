import express from "express";
import { createMilestone, getMilestone, updateMilestone, deleteMilestone } from "../controllers/milestoneControllers.js";

import { userAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/create", userAuth, createMilestone);
router.get("/get/:id", userAuth, getMilestone);
router.put("/update/:id", userAuth, updateMilestone);
router.delete("/delete/:id", userAuth, deleteMilestone);

export default router;
