import mongoose from "mongoose";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const USER_FIELDS = "name major";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_TEXT_LENGTH = 2000;

function isValidId(id) {
    return mongoose.isValidObjectId(id);
}

// Finds a conversation by its ID and checks if the user is a participant in that conversation.
// This function is useful for ensuring that users can only access conversations they are a part of.
async function findMembership(conversationId, userId) {
    if(!isValidId(conversationId)) return null; 
    return Conversation.findOne({ _id: conversationId, participantIds: userId });
}

//GET /api/conversations/:id/messages?before<ISODate>&limit=<number>
// Retrieves a list of messages for a specific conversation, with optional filtering by date and limit on the number of messages returned.
export async function listMessages(req, res, next) {
    try {


        const converstaion = await findMembership(req.params.conversationId, req.session.userId);

        if(!converstaion) {
            return res.status(404).json({ message: "Conversation not found." });
        }
        
        // Retrieves the limit for the number of messages to return from the query parameters.
        // With a default value and a maximum limit to prevent excessive data retrieval.
        const requested = Number.parseInt(req.query.limit, 10) || DEFAULT_LIMIT;
        const limit = Math.min(
            Number.isNaN(requested) || requested < 1 ? DEFAULT_LIMIT : requested, MAX_LIMIT
        );

        const filter = { conversationId: converstaion._id };

        // If a 'before' date is provided in the query parameters, it filters messages to only include those created before that date.
        if(req.query.before !== undefined) {
            const beforeDate = new Date(req.query.before);

            if(Number.isNaN(beforeDate.valueOf())) {
                return res.status(400).json({ message: "Invalid 'before' date." });
            }
            filter.createdAt = { $lt: beforeDate };
        }

        // Retrieves messages from the database based on the constructed filter, sorts them in descending order by creation date, limits the number of results, and populates the sender and receiver information with only the necessary fields.
        const page = await Message.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("senderId", USER_FIELDS)
            .populate("receiverId", USER_FIELDS);

        return res.status(200).json({ messages: page.reverse() }); // Reverses the order to return messages from oldest to newest.


    } catch (error) {
        next(error);
    }
}

// POST /api/conversations/:id/messages body: { text: string }
// Sends a new message in a specific conversation, ensuring that the user is a participant in that conversation.
// Also validates that the message text meets validation criteria.    
export async function sendMessage(req, res, next) {
    try{
        const userId = req.session.userId;
        const conversation = await findMembership(req.params.conversationId, userId);
        
        if(!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Validates the message text to ensure it is a non-empty string and does not exceed the maximum allowed length.
        const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

        if(text.length === 0 || text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ message: "Invalid message text." });
        } 


        const receiverId = conversation.participantIds.find((id) => String(id) !== String(userId));
         
        const message = new Message({
            conversationId: conversation._id,
            senderId: userId,
            receiverId: receiverId,
            text: text,
        });

        await message.save();

        const lastMessage = text;
        const lastMessageTimestamp = message.createdAt;
        await conversation.save();

        // Populates the sender and receiver fields of the message with user information, but only includes the name and major fields for each user.
        await message.populate("senderId", USER_FIELDS);
        await message.populate("receiverId", USER_FIELDS);

        return res.status(201).json({ message });
    }catch (error) {
        next(error);
    }
}


    // POST /api/conversations/:id/read 
    //marks all messages in a specific conversation as read for the current user, ensuring that the user is a participant in that conversation.
    async function markConversationRead(req, res, next) {
        try {
            const userId = req.session.userId;
            const conversation = await findMembership(req.params.conversationId, userId);

            if(!conversation) {
                return res.status(404).json({ message: "Conversation not found." });
            }


            const result = await Message.updateMany(
                { conversationId: conversation._id, receiverId: userId, readAt: null },
                { $set: { readAt: new Date() } }
            );

            return res.status(200).json({ updatedCount: result.modifiedCount });
        } catch (error) {
            next(error);
        }
}


