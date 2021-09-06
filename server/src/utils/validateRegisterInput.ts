import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@"))
    return {
      message: "Invalid email",
      errors: [{ field: "email", message: "email must include @" }],
    };

  if (registerInput.username.length <= 3)
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "username length must be greater than 3",
        },
      ],
    };
  if (registerInput.username.includes("@"))
    return {
      message: "Invalid username",
      errors: [{ field: "username", message: "username cannot include @" }],
    };

  if (registerInput.password.length <= 3)
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "password length must be greater than 3",
        },
      ],
    };
  return null;
};
