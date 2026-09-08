import express from "express";
import {
    createConversation,
    getConversation,
    listConversations,
} from "../controllers/conversationController.js";
import {
    listMessages,
    sendMessage,
    markConversationAsRead,
} from "../controllers/messageController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listConversations);
router.post("/", createConversation);
router.get("/:conversationId", getConversation);
router.get("/:conversationId/messages", listMessages);
router.post("/:conversationId/messages", sendMessage);
router.post("/:conversationId/read", markConversationAsRead);

export default router;  