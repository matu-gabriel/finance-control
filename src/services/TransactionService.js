import mongoose from "mongoose";
import Category from "../models/CategorySchema";
import Transaction from "../models/TransactionSchema";

class TransactionService {
  static async createTransaction({ title, amount, type, categoryId, userId }) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        user: userId,
      });

      if (!category) {
        throw new Error("Category not found");
      }

      const transaction = await Transaction.create({
        title,
        amount,
        type,
        category: categoryId,
        user: userId,
      });

      return await Transaction.findById(transaction._id).populate(
        "category",
        "title"
      );
    } catch (err) {
      console.error("Error creating transaction:", err.message);
      throw err;
    }
  }

  static async getTransactionByUser(userId) {
    try {
      const transactions = await Transaction.find({ user: userId })
        .populate("category", "title")
        .exec();
      return transactions;
    } catch (err) {
      throw new Error("Error fetching transactions");
    }
  }

  static async getTransactions(userId, startDate, endDate, type, sortBy) {
    const query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (type) {
      query.type = type;
    }

    let sort = {};

    if (sortBy) {
      const [key, order] = sortBy.split(":");
      sort[key] = order === "desc" ? -1 : 1;
    }

    const transactions = await Transaction.find(query)
      .populate("category", "title")
      .sort(sort);

    return transactions;
  }

  static async generateReport(userId, startDate, endDate) {
    const query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(query);

    const report = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "receita") {
          acc.receita += transaction.amount;
        } else if (transaction.type === "despesa") {
          acc.despesa += transaction.amount;
        }

        return acc;
      },
      { receita: 0, despesa: 0 }
    );

    report.balanço = report.receita - report.despesa;

    return report;
  }

  static async updateTransaction(transactionId, user, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new Error("Invalid transaction Id");
      }

      const transaction = await Transaction.findOne({
        _id: transactionId,
        user,
      })
        .populate("category", "title")
        .exec();

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      transaction.title = data.title || transaction.title;
      transaction.amount = data.amount || transaction.amount;
      transaction.type = data.type || transaction.type;
      transaction.category = data.category || transaction.category;

      await transaction.save();

      return transaction;
    } catch (err) {
      console.error("Error updating transaction:", err.message);
      throw new Error("Error updating transaction");
    }
  }

  static async deleteTransaction(transactionId, user) {
    try {
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new Error("Invalid Transaction ID");
      }

      const transacion = await Transaction.findOne({
        _id: transactionId,
        user,
      });

      if (!transacion) {
        throw new Error("Transaction not found");
      }

      await transacion.deleteOne({ _id: transactionId, user });
    } catch (err) {
      console.error("Error deleting transacion:", err.message);
      throw new Error("Error deleting transacion");
    }
  }

  // static async getReport(user) {
  //   const transactions = await Transaction.find({ user });

  //   const despesa = transactions
  //     .filter((transaction) => transaction.type === "despesa")
  //     .reduce((total, transaction) => total + transaction.amount, 0);

  //   const receita = transactions
  //     .filter((transacion) => transacion.type === "receita")
  //     .reduce((total, transacion) => total + transacion.amount, 0);

  //   const balanço = despesa - receita;

  //   return {
  //     despesa,
  //     receita,
  //     balanço,
  //   };
  // }

  static async getSummaryByCategory(user) {
    try {
      // Buscar transações por usuário
      const transactions = await Transaction.find({ user }).populate(
        "category"
      );

      // Agrupamento por categoria e soma os valores
      const summary = transactions.reduce((acc, transaction) => {
        const categoryTitle = transaction.category.title;
        // Verifica se a categoria já está no objeto de resumo, se não, inicializa
        if (!acc[categoryTitle]) {
          acc[categoryTitle] = {
            totalDespesa: 0,
            totalReceita: 0,
          };
        }

        // Soma os valores dependendo se a transação é de despesa ou receita
        if (transaction.type === "despesa") {
          acc[categoryTitle].totalDespesa += transaction.amount;
        } else if (transaction.type === "receita") {
          acc[categoryTitle].totalReceita += transaction.amount;
        }

        return acc;
      }, {});

      return summary; // Retorna o resumo
    } catch (error) {
      throw new Error("Error fetching summary by category");
    }
  }
}

export default TransactionService;
