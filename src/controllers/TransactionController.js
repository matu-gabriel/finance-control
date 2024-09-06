import * as Yup from "yup";
import TransactionService from "../services/TransactionService";

class TransactionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      amount: Yup.number().required("Amount is required"),
      type: Yup.string()
        .oneOf(["receita", "despesa"])
        .required("Type is required"),
      categoryId: Yup.string().required("Category is required"),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { title, amount, type, categoryId } = req.body;
    const userId = req.userId;

    try {
      const transaction = await TransactionService.createTransaction({
        title,
        amount,
        type,
        categoryId,
        userId,
      });
      return res.status(201).json(transaction);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async index(req, res) {
    const { startDate, endDate, type, sortBy } = req.query;

    try {
      const transactions = await TransactionService.getTransactions(
        req.userId,
        startDate,
        endDate,
        type,
        sortBy
      );
      return res.status(200).json(transactions);
    } catch (err) {
      return res.status(400).json({ error: err.messege });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().optional(),
      amount: Yup.number().optional(),
      type: Yup.string().oneOf(["receita", "despesa"]).optional(),
      categoryTitle: Yup.string().optional(),
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ errors: err.errors });
    }

    const { transactionId } = req.params;
    const userId = req.userId;
    const { title, amount, type, categoryTitle } = req.body;

    try {
      const updatedTransaction = await TransactionService.updateTransaction(
        transactionId,
        userId,
        { title, amount, type, categoryTitle }
      );

      return res.status(200).json({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getReport(req, res) {
    const { startDate, endDate } = req.query;

    try {
      const report = await TransactionService.generateReport(
        req.userId,
        startDate,
        endDate
      );

      return res.json(report);
    } catch (err) {
      return res.status(500).json({ error: "Error generating report" });
    }
  }

  async delete(req, res) {
    const { transactionId } = req.params;
    const userId = req.userId;
    try {
      const result = await TransactionService.deleteTransaction(
        transactionId,
        userId
      );
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new TransactionController();
