import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
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
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", conversationSchema);

export default Message;

