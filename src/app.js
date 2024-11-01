import express from "express";
import router from "./routes/index.js";
import cors from "cors";

class App {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.middleware();
    this.routes();
  }

  middleware() {
    this.app.use(express.json());
  }

  routes() {
    this.app.use(router);
  }
}

export default new App().app;
