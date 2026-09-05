import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

let connectionPromise;

async function dbconnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.Mongo_URL, {
        family: 4,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        heartbeatFrequencyMS: 15000,
      })
      .then(() => {
        console.log("MongoDB CONNECTED successfully");
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        console.error(`MongoDB connection failed: ${error.message}`);
        throw new Error("Database connection failed");
      });
  }

  return connectionPromise;
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Mongoose will auto-reconnect.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully.");
});

export default dbconnection;
