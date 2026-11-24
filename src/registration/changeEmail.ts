import { RegistrationError } from "./errors";
import { userRepository, User } from "../users/userRepository";
import { validate } from "../validation/rules";
import { EMAIL_RULES, normalizeEmail } from "../validation/email";

// Check order: user exists → validation → same email → uniqueness.
// The store is written only after all checks pass.
export function changeEmail(userId: number, newEmail: string): User {
  const user = userRepository.findById(userId);
  if (!user) throw new RegistrationError("USER_NOT_FOUND");

  const email = normalizeEmail(newEmail);
  const emailErrors = validate(email, EMAIL_RULES);
  if (emailErrors.length) throw new RegistrationError("INVALID_INPUT", { email: emailErrors });

  // No-op; also prevents EMAIL_TAKEN against the user's own address.
  if (email === user.email) return user;

  if (userRepository.findByEmail(email)) throw new RegistrationError("EMAIL_TAKEN");

  // Non-null: existence checked above and the store is synchronous.
  return userRepository.updateEmail(userId, email)!;
}
