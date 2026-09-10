import mongoose from "mongoose";

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "completed",
  "cancelled",
];

const tutoringRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
      index: true,
    },
    requestedDate: {
      type: Date,
      required: true,
      index: true,
    },
    requestedTime: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    // Pending requests expire at their requested date/time.
    // This field is removed as soon as a request is accepted or cancelled,
    // so those requests are not deleted by MongoDB's TTL cleanup.
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "requests",
  }
);

// MongoDB automatically removes documents after expiresAt passes.
// Accepted/cancelled requests have expiresAt removed, so they remain.
tutoringRequestSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const TutoringRequest = mongoose.model(
  "TutoringRequest",
  tutoringRequestSchema
);

export default TutoringRequest;
