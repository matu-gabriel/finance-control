import * as Yup from "yup";
import UserService from "../services/UserService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      token: jwt.sign(
        { id: user._id, name: user.name },
        process.env.SECRET_JWT,
        {
          expiresIn: process.env.EXPIRES_IN,
        }
      ),
    });
  }

  async googleLogin(req, res) {
    const { token } = req.body;

    try {
      // Verifica o token recebido pelo google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const { email, name, sub: googleId } = payload; // Extrai informações do payload

      let user = await UserService.findUserByEmail(email);

      if (!user) {
        // Caso usuário não exista
        user = await UserService.createUser({
          email,
          name,
        });
      }

      const tokenJWT = jwt.sign(
        {
          id: user._id,
          name: user.name,
        },
        process.env.SECRET_JWT,
        {
          expiresIn: process.env.EXPIRES_IN,
        }
      );

      return res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        token: tokenJWT,
      });
    } catch (error) {
      console.error("Erro ao fazer login com o Google:", error);
      return res.status(401).json({ error: "Token Google inválido" });
    }
  }
}

export default new SessionController();
