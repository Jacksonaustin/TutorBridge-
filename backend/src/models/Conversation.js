import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    
{ 
    participantIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    ], validate: {
        validator: function (v) {
            return v.length === 2;
        },
        message: "A conversation must have exactly two participants.",
    },
    
    lastMessage: { 
        type: String,
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