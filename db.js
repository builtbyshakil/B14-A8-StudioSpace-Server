import { MongoClient } from "mongodb";

let dbPromise;

export function getDb() {
  if (!dbPromise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    dbPromise = client
      .connect()
      .then(() => client.db(process.env.DB_NAME || "studiospace"));
  }
  return dbPromise;
}
