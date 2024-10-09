import User from "../models/UserSchema";

class UserService {
  static async createUser(data) {
    const { name, email, password_hash, picture } = data;

    const userData = { name, email, picture };
    if (password_hash) {
      userData.password_hash = password_hash;
    }

    const user = new User(userData);
    await user.save();
    return user;
  }

  static async findUserByEmail(email) {
    return User.findOne({ email });
  }
}

export default UserService;
