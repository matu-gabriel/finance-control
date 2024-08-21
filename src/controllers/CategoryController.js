import Category from "../models/CategorySchema";
import CategoryService from "../services/CategoryService";
import * as Yup from "yup";

class CategoryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      color: Yup.string()
        .required("Color is required")
        .matches(/^#[0-9A-F]{6}$/i, "Invalid color format"),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { title, color } = req.body;

    try {
      const category = await CategoryService.createCategory({
        title,
        color,
        user: req.userId,
      });

      return res.status(201).json(category);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async index(req, res) {
    try {
      const categories = await CategoryService.getCategoriesByUser(req.userId);
      return res.status(200).json(categories);
    } catch (err) {
      return res.status(400).json({ error: err.messege });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().optional(),
      color: Yup.string().optional(),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { title, color } = req.body;
    const categoryId = req.params.id;

    try {
      const updateCategory = await CategoryService.updateCategory({
        categoryId,
        user: req.userId,
        title,
        color,
      });
      return res.status(201).json(updateCategory);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { categoryId } = req.params;
    const userId = req.userId;
    try {
      const result = await CategoryService.deleteCategory(categoryId, userId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new CategoryController();
