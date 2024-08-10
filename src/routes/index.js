import { Router } from "express";
import UserController from "../controllers/UserController";
import SessionController from "../controllers/SessionController";

const router = new Router();

router.get("/", (req, res) => {
  res.status(200).json({ messege: "Hello world" });
});

router.post("/user", UserController.store);
router.post("/session", SessionController.store);

export default router;
