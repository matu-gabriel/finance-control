import UserService from "../services/UserService.js";
import * as Yup from "yup";

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required("Name is required").min(2),
      email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
      password_hash: Yup.string().required("Password is required").min(6),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { email } = req.body;

    const userExist = await UserService.findUserByEmail(email);
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await UserService.createUser(req.body);

    return res.status(201).json({ message: "User created successfully", user });
  }
}

export default new UserController();
