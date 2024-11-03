import app from "./app.js";
import connectDB from "./database/index.js";
const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => console.log(`Server is running at port ${port}`));
};

startServer();
