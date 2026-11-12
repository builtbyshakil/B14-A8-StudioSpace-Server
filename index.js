import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import studiosRouter from "./routes/studios.js";
import bookingsRouter from "./routes/bookings.js";
import wishlistRouter from "./routes/wishlist.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "StudioSpace server is running" });
});

app.use("/api/studios", studiosRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/wishlist", wishlistRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server" });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`StudioSpace server running on port ${port}`);
  });
}

export default app;
