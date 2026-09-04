import mongoose from "mongoose";
import TutoringRequest, {
  REQUEST_STATUSES,
} from "../models/TutoringRequest.js";
import { validateTutoringRequest } from "../utils/requestValidation.js";

const EDITABLE_FIELDS = [
  "subject",
  "topic",
  "description",
  "requestedDate",
  "requestedTime",
];

const USER_FIELDS = "name major";

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function buildUpdates(body) {
  return Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [
        field,
        typeof body[field] === "string" ? body[field].trim() : body[field],
      ]
    )
  );
}

function populateUsers(query) {
  return query
    .populate("studentId", USER_FIELDS)
    .populate("tutorId", USER_FIELDS);
}

// POST /api/requests
// Creates a tutoring request owned by the currently signed-in student.
export async function createRequest(req, res, next) {
  try {
    const errors = validateTutoringRequest(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const request = await TutoringRequest.create({
      studentId: req.session.userId,
      subject: req.body.subject.trim(),
      topic: req.body.topic.trim(),
      description: req.body.description.trim(),
      requestedDate: req.body.requestedDate,
      requestedTime: req.body.requestedTime.trim(),
    });

    await request.populate("studentId", USER_FIELDS);

    return res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
}

// GET /api/requests
// Returns requests filtered by status (pending by default) and optional subject.
export async function listRequests(req, res, next) {
  try {
    const status = req.query.status || "pending";

    if (!REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid request status." });
    }

    const filter = { status };

    if (typeof req.query.subject === "string" && req.query.subject.trim()) {
      filter.subject = req.query.subject.trim();
    }

    const requests = await populateUsers(
      TutoringRequest.find(filter).sort({ requestedDate: 1, createdAt: -1 })
    );

    return res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/mine
// Returns requests where the current user is either the student or the tutor.
export async function listMyRequests(req, res, next) {
  try {
    const userId = req.session.userId;
    const requests = await populateUsers(
      TutoringRequest.find({
        $or: [{ studentId: userId }, { tutorId: userId }],
      }).sort({ createdAt: -1 })
    );

    return res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id
// Returns one tutoring request and basic student/tutor profile information.
export async function getRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await populateUsers(
      TutoringRequest.findById(req.params.id)
    );

    if (!request) {
      return res.status(404).json({ message: "Tutoring request not found." });
    }

    return res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/requests/:id
// Allows the owner to edit approved fields while their request is still pending.
export async function updateRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const errors = validateTutoringRequest(req.body, { partial: true });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updates = buildUpdates(req.body || {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No editable request fields were provided.",
      });
    }

    const request = await populateUsers(
      TutoringRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          studentId: req.session.userId,
          status: "pending",
        },
        { $set: updates },
        { new: true, runValidators: true }
      )
    );

    if (!request) {
      return res.status(404).json({
        message: "Pending tutoring request not found or not owned by you.",
      });
    }

    return res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
}

// POST /api/requests/:id/accept
// Assigns the current user as tutor if the request is still available.
export async function acceptRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await populateUsers(
      TutoringRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          studentId: { $ne: req.session.userId },
          tutorId: null,
          status: "pending",
        },
        {
          $set: {
            tutorId: req.session.userId,
            status: "accepted",
          },
        },
        { new: true, runValidators: true }
      )
    );

    if (!request) {
      return res.status(409).json({
        message: "This request is unavailable or cannot be accepted by you.",
      });
    }

    return res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
}

// POST /api/requests/:id/cancel
// Allows the student who created an active request to cancel it.
export async function cancelRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await populateUsers(
      TutoringRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          studentId: req.session.userId,
          status: { $in: ["pending", "accepted"] },
        },
        { $set: { status: "cancelled" } },
        { new: true, runValidators: true }
      )
    );

    if (!request) {
      return res.status(404).json({
        message: "Active tutoring request not found or not owned by you.",
      });
    }

    return res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
}

// POST /api/requests/:id/complete
// Allows the assigned student or tutor to mark an accepted request completed.
export async function completeRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const userId = req.session.userId;
    const request = await populateUsers(
      TutoringRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "accepted",
          $or: [{ studentId: userId }, { tutorId: userId }],
        },
        { $set: { status: "completed" } },
        { new: true, runValidators: true }
      )
    );

    if (!request) {
      return res.status(404).json({
        message: "Accepted tutoring request not found or not assigned to you.",
      });
    }

    return res.status(200).json({ request });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/requests/:id
// Permanently deletes a pending or cancelled request owned by the current user.
export async function deleteRequest(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await TutoringRequest.findOneAndDelete({
      _id: req.params.id,
      studentId: req.session.userId,
      status: { $in: ["pending", "cancelled"] },
    });

    if (!request) {
      return res.status(404).json({
        message: "Deletable tutoring request not found or not owned by you.",
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
