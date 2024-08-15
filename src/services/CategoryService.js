import Category from "../models/CategorySchema";

class CategoryService {
  static async createCategory({ title, color, user }) {
    try {
      const existingCategory = await Category.findOne({ title, user });

      if (existingCategory) {
        throw new Error("Category already exists for this user");
      }

      const category = await Category.create({ title, color, user });
      return category;
    } catch (err) {
      throw new Error("Error creating category");
    }
  }

  static async getCategoriesByUser(user) {
    try {
      const categories = await Category.find({ user });
      return categories;
    } catch (err) {
      throw new Error("Error fetching categories");
    }
  }
}

export default CategoryService;
