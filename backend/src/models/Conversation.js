import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    
{ 

    //allows up to two participants in a conversation, which is suitable for a one-on-one chat application.
    // If you want to support group chats, you can remove the validation that restricts the number of participants to two.
    participantIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

    ], validate: {
        validator: (value) => value.length === 2 && Array.isArray(value),
        message: "A conversation must have exactly two participants.",
    },

    // The last message sent in the conversation, along with its sender and timestamp. 
    // This allows you to quickly display the most recent message, and senderId for visual cues in the UI, without having to query the entire messages collection.
    lastMessage: { 
        type: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        default: "",
        trim: true,
        maxlength: 2000,
    },
    lastMessageTimestamp: {
        type: Date,
        default: null,
        index: true,
    },

},
{
    timestamps: true,
}
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;