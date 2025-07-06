import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ success: false, message: "Please Login First", data: null });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: token_decode.id };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token", data: null });
  }
};

const protect = (req, res, next) => {
  const userId = req.headers["user-id"];
  const isAdmin = req.headers["is-admin"] === "true";
  if (!userId) {
    return res.status(401).json({ message: "Not authorized, no user ID provided" });
  }
  req.user = { _id: userId, isAdmin };
  next();
};

const protectUser = async (req, res, next) => {
  const { token, "user-id": userId, "is-user": isUser } = req.headers;
  if (!userId || !token) {
    return res.status(401).json({ message: "Not authorized, missing user ID or token" });
  }
  if (isUser !== "true") {
    return res.status(403).json({ message: "Not authorized, user access required" });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode.id !== userId) {
      return res.status(403).json({ message: "Token does not match user ID" });
    }
    req.user = { _id: userId, isAdmin: false };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", data: null });
  }
};

export { authMiddleware, protect, protectUser };