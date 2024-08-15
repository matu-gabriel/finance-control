import Transaction from "../models/TransactionSchema";

class TransactionService {
  static async createTransaction(data) {
    // console.log("Creating transaction with data:", data);
    try {
      const transaction = await Transaction.create(data);
      console.log("Transaction created:", transaction);
      return transaction;
    } catch (err) {
      console.error("Error creating transaction:", err);
      throw new Error("Error creating transaction");
    }
  }
}

export default TransactionService;
