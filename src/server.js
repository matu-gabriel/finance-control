import app from "./app.js";
import connectDB from "./database/index.js";

const startServer = async () => {
  await connectDB();

  app.listen(3000, () => console.log("Server is running at port 3000"));
};

startServer();
