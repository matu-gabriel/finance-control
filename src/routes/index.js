import { Router } from "express";
import UserController from "../controllers/UserController";
import SessionController from "../controllers/SessionController";
import CategoryController from "../controllers/CategoryController";
import authMiddleware from "../middlewares/auth";
import TransactionController from "../controllers/TransactionController";

const router = new Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

router.post("/user", UserController.store);
router.post("/session", SessionController.store);
router.post("/session-google", SessionController.googleLogin);

router.use(authMiddleware);

router.post("/category", CategoryController.store);
router.get("/categories", CategoryController.index);
router.put("/category/:id", CategoryController.update);
router.delete("/category/:categoryId", CategoryController.delete);

router.post("/transaction", TransactionController.store);
router.get("/transaction", TransactionController.index);
router.get("/transaction/report", TransactionController.getReport);
router.get(
  "/transaction/summary/category",
  TransactionController.getCategorySummary
);
router.get("/transaction/summary/date", TransactionController.getReportByDate);
router.put("/transaction/:transactionId", TransactionController.update);
router.delete("/transaction/:transactionId", TransactionController.delete);

export default router;
