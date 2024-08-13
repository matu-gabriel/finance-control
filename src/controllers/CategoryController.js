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

    const categoryExist = await CategoryService.verifyCategory(title);

    if (categoryExist) {
      return res.status(400).json({ messege: "Category already exist" });
    }

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
}

export default new CategoryController();
