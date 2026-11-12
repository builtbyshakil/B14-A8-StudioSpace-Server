import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const NEXT_STATUS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
};

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function findClash(db, { studioId, date, startTime, endTime, ignoreId }) {
  const query = {
    studioId,
    date,
    status: "Confirmed",
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (ignoreId) {
    query._id = { $ne: new ObjectId(ignoreId) };
  }

  return db.collection("bookings").findOne(query);
}

function clashMessage(clash) {
  return `This studio is already booked from ${clash.startTime} to ${clash.endTime} on ${clash.date}. Please choose a different time.`;
}

router.get("/mine", requireAuth, async (req, res) => {
  const db = await getDb();
  const bookings = await db
    .collection("bookings")
    .find({ userEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(bookings);
});

router.get("/requests", requireAuth, async (req, res) => {
  const db = await getDb();
  const bookings = await db
    .collection("bookings")
    .find({ ownerEmail: req.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(bookings);
});

router.get("/availability/:studioId", async (req, res) => {
  const { date } = req.query;

  if (!DATE_PATTERN.test(date || "")) {
    return res.status(400).json({ message: "Please provide a valid date" });
  }

  const db = await getDb();
  const slots = await db
    .collection("bookings")
    .find({ studioId: req.params.studioId, date, status: "Confirmed" })
    .project({ startTime: 1, endTime: 1 })
    .sort({ startTime: 1 })
    .toArray();

  res.json(slots);
});

router.post("/", requireAuth, async (req, res) => {
  const { studioId, date, startTime, endTime } = req.body;

  if (!ObjectId.isValid(studioId)) {
    return res.status(400).json({ message: "Invalid studio" });
  }

  if (
    !DATE_PATTERN.test(date || "") ||
    !TIME_PATTERN.test(startTime || "") ||
    !TIME_PATTERN.test(endTime || "")
  ) {
    return res.status(400).json({ message: "Please choose a valid date and time" });
  }

  if (endTime <= startTime) {
    return res.status(400).json({ message: "End time must be after start time" });
  }

  const db = await getDb();
  const studio = await db
    .collection("studios")
    .findOne({ _id: new ObjectId(studioId) });

  if (!studio) {
    return res.status(404).json({ message: "Studio not found" });
  }

  if (studio.ownerEmail === req.user.email) {
    return res.status(400).json({ message: "You cannot book your own studio" });
  }

  const clash = await findClash(db, { studioId, date, startTime, endTime });

  if (clash) {
    return res.status(409).json({ message: clashMessage(clash) });
  }

  const hours = (toMinutes(endTime) - toMinutes(startTime)) / 60;

  const booking = {
    studioId,
    studioTitle: studio.title,
    studioImage: studio.image,
    location: studio.location,
    ownerEmail: studio.ownerEmail,
    ownerName: studio.ownerName,
    userEmail: req.user.email,
    userName: req.user.name,
    date,
    startTime,
    endTime,
    hours,
    hourlyRate: studio.hourlyRate,
    securityDeposit: studio.securityDeposit,
    totalPrice: Math.round(hours * studio.hourlyRate * 100) / 100,
    status: "Pending",
    createdAt: new Date(),
  };

  const result = await db.collection("bookings").insertOne(booking);
  res.status(201).json({ _id: result.insertedId, ...booking });
});

router.patch("/:id/cancel", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const db = await getDb();
  const filter = { _id: new ObjectId(req.params.id) };
  const booking = await db.collection("bookings").findOne(filter);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.userEmail !== req.user.email) {
    return res.status(403).json({ message: "You can only cancel your own bookings" });
  }

  if (booking.status !== "Pending") {
    return res.status(400).json({ message: "Only pending bookings can be cancelled" });
  }

  await db.collection("bookings").updateOne(filter, { $set: { status: "Cancelled" } });
  res.json({ message: "Booking cancelled" });
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const db = await getDb();
  const filter = { _id: new ObjectId(req.params.id) };
  const booking = await db.collection("bookings").findOne(filter);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.ownerEmail !== req.user.email) {
    return res.status(403).json({ message: "Only the studio host can update this booking" });
  }

  const { status } = req.body;
  const allowed = NEXT_STATUS[booking.status] || [];

  if (!allowed.includes(status)) {
    return res
      .status(400)
      .json({ message: `A ${booking.status} booking cannot be changed to ${status}` });
  }

  if (status === "Confirmed") {
    const clash = await findClash(db, {
      studioId: booking.studioId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      ignoreId: req.params.id,
    });

    if (clash) {
      return res.status(409).json({ message: clashMessage(clash) });
    }
  }

  await db.collection("bookings").updateOne(filter, { $set: { status } });
  res.json({ message: `Booking marked as ${status}` });
});

export default router;
