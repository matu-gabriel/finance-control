import app from "./app";
import connectDB from "./database";

const startServer = async () => {
  await connectDB();

  app.listen(3000, () => console.log("Server is running at port 3000"));
};

startServer();
