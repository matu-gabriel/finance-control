import * as Yup from "yup";
import UserService from "../services/UserService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string().min(6).required("Password is required"),
    });

    const emailOrPasswordInvalid = () => {
      res.status(401).json({ error: "Email ou senha inválidos" });
    };

    const isValid = schema.isValid(req.body);

    if (!isValid) {
      return emailOrPasswordInvalid();
    }

    const { email, password } = req.body;

    const user = await UserService.findUserByEmail(email);

    if (!user) {
      return emailOrPasswordInvalid();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return emailOrPasswordInvalid();
    }

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwt.sign({ id: user._id }, process.env.SECRET_JWT, {
        expiresIn: process.env.EXPIRES_IN,
      }),
    });
  }
}

export default new SessionController();
