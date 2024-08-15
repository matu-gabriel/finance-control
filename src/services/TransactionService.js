import Category from "../models/CategorySchema";
import Transaction from "../models/TransactionSchema";

class TransactionService {
  static async createTransaction({ title, amount, type, categoryTitle, user }) {
    try {
      console.log("Searching for category with title:", categoryTitle);

      const category = await Category.findOne({ title: categoryTitle });

      if (!category) {
        throw new Error("Category not found");
      }

      const transaction = await Transaction.create({
        title,
        amount,
        type,
        category: category._id,
        user,
      });

      return await Transaction.findById(transaction._id).populate("category");
    } catch (err) {
      console.error("Error creating transaction:", err.message);
      throw err;
    }
  }

  static async getTransactionByUser(userId) {
    try {
      const transactions = await Transaction.find({ user: userId });
      return transactions;
    } catch (err) {
      throw new Error("Error fetching transactions");
    }
  }
}

export default TransactionService;
