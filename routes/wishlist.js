import { Router } from "express";
import { getDb } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/ids", requireAuth, async (req, res) => {
  const db = await getDb();
  const items = await db
    .collection("wishlist")
    .find({ userEmail: req.user.email })
    .toArray();

  res.json(items.map((item) => item.studioId));
});

router.post("/:studioId", requireAuth, async (req, res) => {
  const db = await getDb();
  const filter = { userEmail: req.user.email, studioId: req.params.studioId };
  const existing = await db.collection("wishlist").findOne(filter);

  if (existing) {
    await db.collection("wishlist").deleteOne(filter);
    return res.json({ saved: false });
  }

  await db.collection("wishlist").insertOne({ ...filter, createdAt: new Date() });
  res.json({ saved: true });
});

export default router;
