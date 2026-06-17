import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dbconnection from "./config/dbConnect.js";
import Admin from "./models/AdminSchema.js";
import mongoose from "mongoose";
dotenv.config();

const GUEST_USERNAME = "guest@omarombark.me";
const GUEST_PASSWORD = "guest123";

async function createGuest() {
  try {
    await dbconnection();

    const existingGuest = await Admin.findOne({ userName: GUEST_USERNAME });
    if (existingGuest) {
      console.log(`ℹ️ Guest account "${GUEST_USERNAME}" already exists.`);
      mongoose.connection.close();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(14);
    const hash = await bcrypt.hash(GUEST_PASSWORD, salt);

    const guest = new Admin({
      userName: GUEST_USERNAME,
      password: hash,
      role: "viewer",
    });

    const saved = await guest.save();
    if (!saved) {
      console.log("❌ Failed to create guest account");
    } else {
      console.log("✅ Guest account created successfully.");
      console.log(`   Username: ${GUEST_USERNAME}`);
      console.log(`   Password: ${GUEST_PASSWORD}`);
      console.log(`   Role: viewer`);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.log("❌ Something went wrong:", err);
    mongoose.connection.close();
    process.exit(1);
  }
}

createGuest();
