import mongoose from "mongoose";
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

  static async updateCategory({ categoryId, user, title, color }) {
    try {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid transaction Id");
      }

      const category = await Category.findOne({
        _id: categoryId,
        user,
      });

      if (!category) {
        throw new Error(
          "Category not found or you not have permission to update this category"
        );
      }

      category.title = title || category.title;
      category.color = color || category.color;

      await category.save();

      return category;
    } catch (err) {
      console.error("Error updating category:", err.message);
      throw new Error("Error updating category");
    }
  }

  static async deleteCategory(categoryId, user) {
    try {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid Category ID");
      }

      const category = await Category.findOne({
        _id: categoryId,
        user,
      });

      if (!category) {
        throw new Error("Category not found");
      }

      await category.deleteOne({ _id: categoryId, user });

      return { message: "Category deleted successfully" };
    } catch (err) {
      console.error("Error deleting category:", err.message);
      throw new Error("Error deleting category");
    }
  }
}

export default CategoryService;
