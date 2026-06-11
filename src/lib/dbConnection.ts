
// readyState is a Mongoose property that indicates the current connection status.
// 0 - disConnected
// 1 - connected
// 2 - connecting
// 3 - disconnected

import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error("Please define MONGODB_URL in .env.local");
}

let isConnected:boolean = false;

export default async function connectDB(){
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const db:any = await mongoose.connect(MONGODB_URL);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected Successfully");

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
};
