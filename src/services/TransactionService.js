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
        category,
        user: userId,
      });

      return await Transaction.findById(transaction._id).populate(
        "category",
        "title color"
      );
    } catch (err) {
      console.error("Error creating transaction:", err.message);
      throw err;
    }
  }

  static async getTransactions(userId, startDate, endDate, title, categoryId) {
    const query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filtro por título (usando regex para busca parcial)
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Filtra por título, sem diferenciar maiúsculas/minúsculas
    }

    // Filtro por categoria
    if (categoryId) {
      query.category = categoryId; // Filtra por ID de categoria
    }

    const transactions = await Transaction.find(query).populate(
      "category",
      "title color"
    );

    return transactions;
  }

  static async generateReport(userId, startDate, endDate) {
    const query = { user: userId };

    if (startDate || endDate) {
      query.date = {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) }),
      };
    }

    const transactions = await Transaction.find(query).populate(
      "category",
      "title color"
    );

    const report = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "receita") {
          acc.receita += transaction.amount;
        } else if (transaction.type === "despesa") {
          acc.despesa += transaction.amount;
          acc.despesasList.push({
            _id: transaction.category._id,
            title: transaction.title,
            amount: transaction.amount,
            color: transaction.category.color, // Inclui a cor
          });
        }

        return acc;
      },
      { receita: 0, despesa: 0, despesasList: [] }
    );

    report.balanço = report.receita - report.despesa;

    return {
      balanço: {
        _id: null,
        receita: report.receita,
        despesa: report.despesa,
        balanço: report.balanço,
      },
      despesa: report.despesasList,
    };
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

  static async getSummaryByCategory(user) {
    try {
      // Buscar transações por usuário
      const transactions = await Transaction.find({ user }).populate(
        "category"
      );

      // Agrupamento por categoria e soma os valores
      const summary = transactions.reduce((acc, transaction) => {
        const categoryId = transaction.category._id;
        // Verifica se a categoria já está no objeto de resumo, se não, inicializa
        if (!acc[categoryId]) {
          acc[categoryId] = {
            _id: categoryId,
            title: transaction.category.title,
            color: transaction.category.color,
            totalDespesa: 0,
            totalReceita: 0,
          };
        }

        // Soma os valores dependendo se a transação é de despesa ou receita
        if (transaction.type === "despesa") {
          acc[categoryId].totalDespesa += transaction.amount;
        } else if (transaction.type === "receita") {
          acc[categoryId].totalReceita += transaction.amount;
        }

        return acc;
      }, {});

      return Object.values(summary); // Retorna o resumo
    } catch (err) {
      throw new Error(err.message);
    }
  }

  static async getFinanceEvolution(userId, year) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const query = {
      user: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    };

    const financeEvolution = await Transaction.aggregate()
      .match(query)
      .project({
        year: { $year: "$date" },
        month: { $month: "$date" },
        receita: {
          $cond: [{ $eq: ["$type", "receita"] }, "$amount", 0],
        },
        despesa: {
          $cond: [{ $eq: ["$type", "despesa"] }, "$amount", 0],
        },
      })
      .group({
        _id: ["$year", "$month"],
        receita: { $sum: "$receita" },
        despesa: { $sum: "$despesa" },
      })
      .addFields({
        balanço: { $subtract: ["$receita", "$despesa"] },
      })
      .sort({ "_id.0": 1, "_id.1": 1 });

    console.log(financeEvolution);

    return financeEvolution;
  }
}

export default TransactionService;
