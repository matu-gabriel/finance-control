import User from "../models/UserSchema";

class UserService {
  static async createUser(data) {
    const { name, email, password_hash } = data;
    const user = new User({ name, email, password_hash });
    await user.save();
    return user;
  }

  static async findUserByEmail(email) {
    return User.findOne({ email });
  }
}

export default UserService;
