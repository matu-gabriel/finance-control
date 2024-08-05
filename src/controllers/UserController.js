import UserSchema from "../models/UserSchema";
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

    const { name, email, password_hash } = req.body;

    const userExist = await UserSchema.findOne({ email });
    if (userExist) {
      return res.status(400).json({ messege: "User already exist" });
    }

    const newUser = await UserSchema.create({
      name,
      email,
      password_hash,
    });

    return res
      .status(201)
      .json({ messege: "User created successfully", user: newUser });
  }
}

export default new UserController();
