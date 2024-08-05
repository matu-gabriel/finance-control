import UserSchema from "../models/UserSchema";

class UserController {
  async store(req, res) {
    const { name, email, password_hash } = req.body;
    try {
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
    } catch (err) {
      res.status(500).json({ messege: "Error when creating user: ", err });
    }
  }
}

export default new UserController();
