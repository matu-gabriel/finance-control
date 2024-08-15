import * as Yup from "yup";
import TransactionService from "../services/TransactionService";

class TransactionController {
  async store(req, res) {
    console.log("Request received in UserController");
    const schema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      amount: Yup.number().required("Amount is required"),
      type: Yup.string()
        .oneOf(["income", "expense"])
        .required("Type is required"),
      categoryId: Yup.string().required("Category is required"),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { title, amount, type, categoryId } = req.body;

    try {
      const transaction = await TransactionService.createTransaction({
        title,
        amount,
        type,
        category: categoryId,
        user: req.userId,
      });
      return res.status(201).json(transaction);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new TransactionController();
