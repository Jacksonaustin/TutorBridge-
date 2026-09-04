import express from "express";
import {
  acceptRequest,
  cancelRequest,
  completeRequest,
  createRequest,
  deleteRequest,
  getRequest,
  listMyRequests,
  listRequests,
  updateRequest,
} from "../controllers/requestController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createRequest);
router.get("/", listRequests);
router.get("/mine", listMyRequests);
router.get("/:id", getRequest);
router.patch("/:id", updateRequest);
router.post("/:id/accept", acceptRequest);
router.post("/:id/cancel", cancelRequest);
router.post("/:id/complete", completeRequest);
router.delete("/:id", deleteRequest);

export default router;
