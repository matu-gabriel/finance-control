import { Router } from "express";
import UserController from "../controllers/UserController";
import SessionController from "../controllers/SessionController";
import CategoryController from "../controllers/CategoryController";
import authMiddleware from "../middlewares/auth";
import TransactionController from "../controllers/TransactionController";

const router = new Router();

router.get("/", (req, res) => {
  res.status(200).json({ messege: "Hello world" });
});

router.post("/user", UserController.store);
router.post("/session", SessionController.store);

router.use(authMiddleware);

router.post("/category", CategoryController.store);
router.get("/category", CategoryController.index);

router.post("/transaction", TransactionController.store);
router.get("/transaction", TransactionController.index);

export default router;
