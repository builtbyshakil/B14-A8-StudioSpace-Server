import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.studio_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: please login to continue" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res
      .status(401)
      .json({ message: "Unauthorized: your session has expired, please login again" });
  }
}
