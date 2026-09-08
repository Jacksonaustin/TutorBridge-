import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {

    //nessicary to link the message to a specific conversation, allowing you to retrieve all messages for a given conversation easily.
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,  
    },  
    text: {
        type: String,
        required: true, 
        trim: true,
        maxlength: 2000,
    },
    readAt  : { 
        type: Date,
        default: null,
        index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

