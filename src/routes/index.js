import { Router } from "express";
import UserController from "../controllers/UserController";

const router = new Router();

router.get("/", (req, res) => {
  res.status(200).json({ messege: "Hello world" });
});

router.post("/user", UserController.store);

export default router;
