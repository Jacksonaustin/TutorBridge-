import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

const User_Fields = "name major";

function isValidId(id) {
    return mongoose.isValidObjectId(id);
}

//** possible race condition ** */
// If two users try to create a conversation with each other at the same time, it's possible that two conversations could be created.
// To prevent this, you could use a unique index on the participantIds field in the Conversation model.
// Or implement a locking mechanism to ensure that only one conversation can be created between two users at a time.
// Could be implemented if we have time, but for now, we will just check if a conversation already exists before creating a new one.



// Prepares a conversation object for sending to the client, including only the necessary fields and formatting the data as needed.
// Participants are filtered to exclude the current user, and only the other participant's information is included in the response.
function prepareConversation(conversation, currentUserId) { 

    const getOtherParticipant = (participants) => {
        // Filters the participants to exclude the current user, returning only the other participant's information.
        return participants.find((participant) => String(participant._id ?? participant) !== String(currentUserId));
    };

    // Retrieves the other participant's information from the conversation's participantIds array.
    const otherParticipant = getOtherParticipant(conversation.participantIds);

    return {
        _id: conversation._id,
        participantIds: otherParticipant && otherParticipant._id ? otherParticipant._id : null,
        lastMessage: conversation.lastMessage,
        lastMessageTimestamp: conversation.lastMessageTimestamp,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
    };
}


// GET /api/conversations
// List current user's conversations, and sorts them by the last message timestamp in descending order.
export async function listConversations(req, res, next) {

    try {
        const userId = req.session.userId;
        
        const conversations = await Conversation.find({
            participantIds: userId
        })
        //
        .sort({ lastMessageTimestamp: -1, updatedAt: -1 })

        // Populates the participantIds field with user information, but only includes the name and major fields for each participant.
        .populate("participantIds", User_Fields);


        // Prepares the conversations for sending to the client, including only the necessary fields and formatting the data as needed.
        return res.status(200).json({ conversations: conversations.map((conversation) => prepareConversation(conversation, userId)) });
    }
    catch (error) {
        next(error);
    }

}

// POST /api/conversations
// Creates a new conversation between the current user and another user, if it doesn't already exist.
export async function createConversation(req, res, next) {

    try {
        const userId = req.session.userId;
        const { participantId } = req.body || {};

        if (!isValidId(participantId)) {
            return res.status(400).json({ message: "Invalid participantId." });
        }

        if(String(userId) === String(participantId)) {
            return res.status(400).json({ message: "Cannot create a conversation with yourself." });
        }

        const recipient = await User.findById(participantId).select("_id");

        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }
 
        const pair = [userId, participantId].sort(); // Sorts the IDs to ensure consistent ordering.
        
        // Checks if a conversation between the two users already exists.
        let conversation = await Conversation.findOne({ participantIds: { $all: pair, $size: 2 } });

        let created = false; 

        if (!conversation) {
            // Creates a new conversation if one doesn't already exist.
            conversation = new Conversation({ participantIds: pair });
            await conversation.save();
            created = true;
        }

        // Populates the participantIds field with user information, but only includes the name and major fields for each participant.
        await conversation.populate("participantIds", User_Fields);
        
        // Prepares the conversation for sending to the client, including only the necessary fields and formatting the data as needed.
        return res
        .status(created ? 201 : 200)
        .json({ conversation: prepareConversation(conversation, userId), created });
    } catch (error) {
        next(error);
    }
}

// GET /api/conversations/:id
// Retrieves a specific conversation by its ID, ensuring that the current user is a participant in the conversation.

export async function getConversation(req, res, next) {

    try {
        
        if(!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid conversationId." });
        }

        // Finds the conversation by ID and ensures that the current user is a participant in the conversation.
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participantIds: req.session.userId
        })
        .populate("participantIds", User_Fields);

        if(!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Prepares the conversation for sending to the client, including only the necessary fields and formatting the data as needed.
        return res.status(200).json({ conversation: prepareConversation(conversation, req.session.userId) });
    } catch (error) {
        next(error);
    }
}




