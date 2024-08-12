import Category from "../models/CategorySchema";

class CategoryService {
  static async createCategory({ title, color, user }) {
    try {
      const category = await Category.create({ title, color, user });
      return category;
    } catch (err) {
      throw new Error("Error creating category");
    }
  }

  static async verifyCategory(title) {
    return Category.findOne({ title });
  }
}

export default CategoryService;
