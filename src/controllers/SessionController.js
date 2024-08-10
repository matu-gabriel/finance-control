import * as Yup from "yup";
import UserService from "../services/UserService";
import bcrypt from "bcrypt";

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

    const userExist = await UserService.findUserByEmail(email);

    if (!userExist) {
      return emailOrPasswordInvalid();
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userExist.password_hash
    );

    if (!isPasswordValid) {
      return emailOrPasswordInvalid();
    }

    return res.status(201).json("ok");
  }
}

export default new SessionController();
