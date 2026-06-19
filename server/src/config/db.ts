import mongoose from "mongoose";

export default async function connectDB(){
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("Database Connected Successfully");
  } catch (err) {
    console.error("Database Connection Failed");
    console.error(err);
    process.exit(1);
  }
}
