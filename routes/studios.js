import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { CATEGORIES, SORTS } from "../constants.js";

const router = Router();

function cleanStudio(body) {
  const image = String(body.image || "").trim();
  const extraImages = Array.isArray(body.gallery)
    ? body.gallery.map((url) => String(url).trim()).filter(Boolean)
    : [];

  return {
    title: String(body.title || "").trim(),
    category: body.category,
    hourlyRate: Number(body.hourlyRate),
    securityDeposit: Number(body.securityDeposit),
    maxCapacity: Number(body.maxCapacity),
    location: String(body.location || "").trim(),
    image,
    gallery: [image, ...extraImages.filter((url) => url !== image)],
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    overview: String(body.overview || "").trim(),
  };
}

function findProblem(studio) {
  if (!studio.title) return "Studio title is required";
  if (!CATEGORIES.includes(studio.category)) return "Please choose a valid category";
  if (!(studio.hourlyRate > 0)) return "Hourly rate must be more than 0";
  if (!(studio.securityDeposit >= 0)) return "Security deposit cannot be negative";
  if (!(studio.maxCapacity > 0)) return "Max capacity must be more than 0";
  if (!studio.location) return "Location is required";
  if (!studio.image) return "Studio image is required";
  if (!studio.overview) return "Please write a detailed overview";
  return null;
}

router.get("/", async (req, res) => {
  const db = await getDb();
  const { category, search, sort } = req.query;
  const filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (search) {
    const safeText = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safeText, $options: "i" } },
      { location: { $regex: safeText, $options: "i" } },
    ];
  }

  const studios = await db
    .collection("studios")
    .find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .toArray();

  res.json(studios);
});

router.get("/featured", async (req, res) => {
  const db = await getDb();
  const studios = await db
    .collection("studios")
    .find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(6)
    .toArray();

  res.json(studios);
});

router.get("/mine", requireAuth, async (req, res) => {
  const db = await getDb();
  const studios = await db
    .collection("studios")
    .find({ ownerEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(studios);
});

router.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Studio not found" });
  }

  const db = await getDb();
  const studio = await db
    .collection("studios")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!studio) {
    return res.status(404).json({ message: "Studio not found" });
  }

  res.json(studio);
});

router.post("/", requireAuth, async (req, res) => {
  const studio = cleanStudio(req.body);
  const problem = findProblem(studio);

  if (problem) {
    return res.status(400).json({ message: problem });
  }

  const db = await getDb();
  const newStudio = {
    ...studio,
    ownerEmail: req.user.email,
    ownerName: req.user.name,
    ownerImage: req.user.image || "",
    rating: 0,
    reviews: [],
    createdAt: new Date(),
  };

  const result = await db.collection("studios").insertOne(newStudio);
  res.status(201).json({ _id: result.insertedId, ...newStudio });
});

router.put("/:id", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Studio not found" });
  }

  const db = await getDb();
  const filter = { _id: new ObjectId(req.params.id) };
  const existing = await db.collection("studios").findOne(filter);

  if (!existing) {
    return res.status(404).json({ message: "Studio not found" });
  }

  if (existing.ownerEmail !== req.user.email) {
    return res.status(403).json({ message: "You can only edit your own studios" });
  }

  const studio = cleanStudio(req.body);
  const problem = findProblem(studio);

  if (problem) {
    return res.status(400).json({ message: problem });
  }

  await db
    .collection("studios")
    .updateOne(filter, { $set: { ...studio, updatedAt: new Date() } });

  res.json({ message: "Studio updated successfully" });
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Studio not found" });
  }

  const db = await getDb();
  const filter = { _id: new ObjectId(req.params.id) };
  const existing = await db.collection("studios").findOne(filter);

  if (!existing) {
    return res.status(404).json({ message: "Studio not found" });
  }

  if (existing.ownerEmail !== req.user.email) {
    return res.status(403).json({ message: "You can only delete your own studios" });
  }

  await db.collection("studios").deleteOne(filter);
  await db.collection("wishlist").deleteMany({ studioId: req.params.id });

  res.json({ message: "Studio deleted successfully" });
});

export default router;
