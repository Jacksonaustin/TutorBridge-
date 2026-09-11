import { describe, it, expect } from "vitest";
import { validateSignup, validateLogin } from "./validation.js";

describe("validateSignup", () => {
  const validBody = {
    name: "Jamie Smith",
    email: "jamie@example.com",
    password: "supersecret",
    major: "Computer Science",
  };

  it("returns no errors for a fully valid signup", () => {
    expect(validateSignup(validBody)).toEqual([]);
  });

  it("rejects a non-object body", () => {
    expect(validateSignup("not an object")).toEqual([
      "Request body must be a JSON object.",
    ]);
  });

  it("rejects a name that is too short", () => {
    const errors = validateSignup({ ...validBody, name: "J" });
    expect(errors).toContain("Name must contain at least 2 characters.");
  });

  it("rejects a name that is too long", () => {
    const errors = validateSignup({ ...validBody, name: "a".repeat(81) });
    expect(errors).toContain("Name must contain no more than 80 characters.");
  });

  it("rejects a malformed email", () => {
    const errors = validateSignup({ ...validBody, email: "not-an-email" });
    expect(errors).toContain("A valid email is required.");
  });

  it("rejects an email that is too long", () => {
    const longEmail = `${"a".repeat(250)}@a.com`;
    const errors = validateSignup({ ...validBody, email: longEmail });
    expect(errors).toContain(
      "Email must contain no more than 254 characters."
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    const errors = validateSignup({ ...validBody, password: "short1" });
    expect(errors).toContain("Password must contain at least 8 characters.");
  });

  it("rejects a password over 72 bytes", () => {
    const errors = validateSignup({ ...validBody, password: "a".repeat(73) });
    expect(errors).toContain("Password is too long.");
  });

  it("allows a missing major, since it is optional", () => {
    const { major, ...withoutMajor } = validBody;
    expect(validateSignup(withoutMajor)).toEqual([]);
  });

  it("rejects a non-string major", () => {
    const errors = validateSignup({ ...validBody, major: 123 });
    expect(errors).toContain("Major must be text.");
  });

  it("rejects a major that is too long", () => {
    const errors = validateSignup({ ...validBody, major: "a".repeat(101) });
    expect(errors).toContain(
      "Major must contain no more than 100 characters."
    );
  });
});

describe("validateLogin", () => {
  it("returns no errors for valid credentials", () => {
    expect(
      validateLogin({ email: "jamie@example.com", password: "anything" })
    ).toEqual([]);
  });

  it("rejects a non-object body", () => {
    expect(validateLogin("not an object")).toEqual([
      "Request body must be a JSON object.",
    ]);
  });

  it("rejects a malformed email", () => {
    const errors = validateLogin({ email: "nope", password: "anything" });
    expect(errors).toContain("A valid email is required.");
  });

  it("rejects an empty password", () => {
    const errors = validateLogin({
      email: "jamie@example.com",
      password: "",
    });
    expect(errors).toContain("Password is required.");
  });

  it("rejects a missing password", () => {
    const errors = validateLogin({ email: "jamie@example.com" });
    expect(errors).toContain("Password is required.");
  });
});
