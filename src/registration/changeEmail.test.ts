import { changeEmail } from "./changeEmail";
import { RegistrationError } from "./errors";
import { userRepository } from "../users/userRepository";

function catchError(fn: () => unknown): RegistrationError {
  try {
    fn();
  } catch (error) {
    if (error instanceof RegistrationError) return error;
    throw error;
  }
  throw new Error("Expected RegistrationError to be thrown");
}

beforeEach(() => {
  userRepository.reset();
});

describe("changeEmail", () => {
  it("AC1: changes the email and normalizes it", () => {
    const user = changeEmail(2, "  Olena.New@Example.com  ");

    expect(user).toMatchObject({ id: 2, email: "olena.new@example.com" });
    expect(userRepository.findByEmail("olena.new@example.com")?.id).toBe(2);
    expect(userRepository.findByEmail("olena@example.com")).toBeUndefined();
  });

  it("AC2: rejects an invalid email and keeps the current one", () => {
    const error = catchError(() => changeEmail(2, "not-an-email"));

    expect(error.code).toBe("INVALID_INPUT");
    expect(error.message).toBe("Please check the highlighted fields");
    expect(error.fields).toEqual({ email: ["must be a valid email"] });
    expect(userRepository.findById(2)?.email).toBe("olena@example.com");
  });

  it("AC3: rejects an email that belongs to another user", () => {
    const before = userRepository.findAll();

    const error = catchError(() => changeEmail(2, " JOHN@example.com "));

    expect(error.code).toBe("EMAIL_TAKEN");
    expect(error.message).toBe("Email already registered");
    expect(userRepository.findAll()).toEqual(before);
  });

  it("AC4: returns the user unchanged when the new email equals the current one", () => {
    const before = userRepository.findAll();

    const user = changeEmail(1, " John@Example.com ");

    expect(user).toEqual({ id: 1, email: "john@example.com", username: "John_Doe" });
    expect(userRepository.findAll()).toEqual(before);
  });

  it("AC5: rejects a non-existent user", () => {
    const before = userRepository.findAll();

    const error = catchError(() => changeEmail(999, "new@example.com"));

    expect(error.code).toBe("USER_NOT_FOUND");
    expect(error.message).toBe("User not found");
    expect(userRepository.findAll()).toEqual(before);
  });

  it("checks user existence before email validation", () => {
    const error = catchError(() => changeEmail(999, "not-an-email"));

    expect(error.code).toBe("USER_NOT_FOUND");
  });
});
