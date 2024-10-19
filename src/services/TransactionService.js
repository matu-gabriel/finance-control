import mongoose from "mongoose";
import Category from "../models/CategorySchema";
import Transaction from "../models/TransactionSchema";
import { date } from "yup";

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

  // static async getTransactionByUser(userId) {
  //   try {
  //     const transactions = await Transaction.find({ user: userId })
  //       .populate("category", "title")
  //       .exec();
  //     return transactions;
  //   } catch (err) {
  //     throw new Error("Error fetching transactions");
  //   }
  // }

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

    const despesas = await Transaction.aggregate()
      .match({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .lookup({
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "totalDespesa",
      })
      .unwind({
        path: "$totalDespesa",
        preserveNullAndEmptyArrays: true,
      })
      .group({
        _id: "$totalDespesa._id",
        title: {
          $first: "$totalDespesa.title",
        },
        color: {
          $first: "$totalDespesa.color",
        },
        amount: {
          $sum: "$amount",
        },
      });

    const result = await Transaction.aggregate()
      .match({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .project({
        _id: 0,
        category: 1,
        receita: {
          $cond: [
            {
              $eq: ["$type", "receita"],
            },
            "$amount",
            0,
          ],
        },
        despesa: {
          $cond: [
            {
              $eq: ["$type", "despesa"],
            },
            "$amount",
            0,
          ],
        },
      })
      .group({
        _id: null,
        receita: {
          $sum: "$receita",
        },
        despesa: {
          $sum: "$despesa",
        },
      })
      .addFields({
        balanço: {
          $subtract: ["$receita", "$despesa"],
        },
      });

    if (result.length === 0) {
      return [
        {
          _id: null,
          receita: 0,
          despesa: 0,
          balanço: 0,
        },
      ];
    }

    return { result, despesas };

    // const transactions = await Transaction.find(query).populate(
    //   "category",
    //   "title color"
    // );

    // const report = transactions.reduce(
    //   (acc, transaction) => {
    //     if (transaction.type === "receita") {
    //       acc.receita += transaction.amount;
    //     } else if (transaction.type === "despesa") {
    //       acc.despesa += transaction.amount;
    //       acc.despesasList.push({
    //         _id: transaction._id,
    //         title: transaction.title,
    //         amount: transaction.amount,
    //         color: transaction.category.color, // Inclui a cor
    //       });
    //     }

    //     return acc;
    //   },
    //   { receita: 0, despesa: 0, despesasList: [] }
    // );

    // report.balanço = report.receita - report.despesa;

    // return {
    //   balanço: {
    //     _id: null,
    //     receita: report.receita,
    //     despesa: report.despesa,
    //     balanço: report.balanço,
    //   },
    //   despesa: report.despesasList,
    // };
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

  static async getReportByDate(startDate, endDate) {
    try {
      // Verifica se startDate e endDate estão definidos
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }

      // Ajustar o startDate e endDate para horário local
      const adjustedStartDate = new Date(startDate);
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setUTCHours(23, 59, 59, 999);

      // BUscar as transções no intervalo de datas
      const transactions = await Transaction.find({
        date: {
          $gte: adjustedStartDate,
          $lte: adjustedEndDate,
        },
      }).populate("category", "title");

      const formattedTransactions = transactions.map((transacion) => ({
        title: transacion.title,
        amount: transacion.amount,
        category: transacion.category.title,
        date: transacion.date.toISOString().split("T")[0],
      }));

      // Criação de um objeto para armazenar o resumo por categoria
      const summary = transactions.reduce((acc, transacion) => {
        const categoryName = transacion.category.title;
        if (!acc[categoryName]) {
          acc[categoryName] = { totalDespesa: 0, totalReceita: 0 };
        }

        // Atualiza o total baseado no tipo de transação
        if (transacion.type === "despesa") {
          acc[categoryName].totalDespesa += transacion.amount;
        } else if (transacion.type === "receita") {
          acc[categoryName].totalReceita += transacion.amount;
        }

        return acc;
      }, {});

      return {
        transactions: formattedTransactions,
        summary,
      };
    } catch (error) {
      throw new Error("Error fetching summary by category and date");
    }
  }
}

export default TransactionService;
