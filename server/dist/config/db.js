import mongoose from "mongoose";
export default async function connectDB() {
    try {
        console.log(process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected Successfully");
    }
    catch (err) {
        console.error("Database Connection Failed");
        console.error(err);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map