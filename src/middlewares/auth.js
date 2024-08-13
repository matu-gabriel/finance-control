import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token não provido" });
  }

  const token = authorization.split(" ").at(1);

  try {
    jwt.verify(token, process.env.SECRET_JWT, (error, decoded) => {
      if (error) {
        throw new Error();
      }
      req.userId = decoded.id;
    });
  } catch (err) {
    return res.status(401).json({ messege: "Token invalid" });
  }
  next();
};

export default authMiddleware;
