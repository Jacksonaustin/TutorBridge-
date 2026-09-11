import { describe, it, expect } from "vitest";
import {
  validateTutoringRequest,
  createRequestedDateTime,
} from "./requestValidation.js";

describe("validateTutoringRequest", () => {
  it("returns no errors for a fully valid request", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "Need help with quadratics",
      requestedDate: "2099-01-01",
      requestedTime: "15:30",
    });
    expect(errors).toEqual([]);
  });

  it("requires subject, topic, description, date, and time", () => {
    const errors = validateTutoringRequest({});
    expect(errors).toContain("subject is required.");
    expect(errors).toContain("topic is required.");
    expect(errors).toContain("description is required.");
    expect(errors).toContain("requestedDate is required.");
    expect(errors).toContain("requestedTime is required.");
  });

  it("rejects a field that exceeds its length limit", () => {
    const errors = validateTutoringRequest({
      subject: "a".repeat(101),
      topic: "Algebra",
      description: "help",
      requestedDate: "2099-01-01",
      requestedTime: "15:30",
    });
    expect(errors).toContain(
      "subject must contain no more than 100 characters."
    );
  });

  it("rejects an unparseable date", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "help",
      requestedDate: "not-a-date",
      requestedTime: "15:30",
    });
    expect(errors).toContain("requestedDate must be a valid date.");
  });

  it("rejects a malformed time", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "help",
      requestedDate: "2099-01-01",
      requestedTime: "25:99",
    });
    expect(errors).toContain(
      "requestedTime must use a format such as 15:30 or 3:30 PM."
    );
  });

  it("accepts a 12-hour time format", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "help",
      requestedDate: "2099-01-01",
      requestedTime: "3:30 PM",
    });
    expect(errors).toEqual([]);
  });

  it("rejects a requestedDate/requestedTime combination in the past", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "help",
      requestedDate: "2000-01-01",
      requestedTime: "10:00",
    });
    expect(errors).toContain(
      "Requested date and time must be in the future."
    );
  });

  it("rejects an explicit requestedDateTime in the past", () => {
    const errors = validateTutoringRequest({
      subject: "Math",
      topic: "Algebra",
      description: "help",
      requestedDate: "2099-01-01",
      requestedTime: "15:30",
      requestedDateTime: "2000-01-01T10:00:00.000Z",
    });
    expect(errors).toContain(
      "Requested date and time must be in the future."
    );
  });

  it("allows partial updates to validate only supplied fields", () => {
    const errors = validateTutoringRequest(
      { subject: "Updated subject" },
      { partial: true }
    );
    expect(errors).toEqual([]);
  });

  it("rejects a non-object body", () => {
    const errors = validateTutoringRequest("not an object");
    expect(errors).toEqual(["Request body must be a JSON object."]);
  });
});

describe("createRequestedDateTime", () => {
  it("builds a Date from a YYYY-MM-DD date and 24-hour time", () => {
    const date = createRequestedDateTime("2099-06-15", "15:30");
    expect(date.getFullYear()).toBe(2099);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(15);
    expect(date.getMinutes()).toBe(30);
  });

  it("builds a Date from a 12-hour time", () => {
    const date = createRequestedDateTime("2099-06-15", "3:30 PM");
    expect(date.getHours()).toBe(15);
    expect(date.getMinutes()).toBe(30);
  });

  it("returns null for an invalid calendar date such as February 31", () => {
    const date = createRequestedDateTime("2099-02-31", "10:00");
    expect(date).toBeNull();
  });

  it("returns null when the date or time is missing", () => {
    expect(createRequestedDateTime(undefined, "10:00")).toBeNull();
    expect(createRequestedDateTime("2099-01-01", undefined)).toBeNull();
  });
});
