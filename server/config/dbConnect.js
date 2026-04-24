import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config();

// Force Node.js to resolve DNS using IPv4 first.
// This fixes "getaddrinfo ENOTFOUND" errors caused by broken IPv6
// lookups on certain ISPs/networks.
dns.setDefaultResultOrder("ipv4first");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function dbconnection(retryCount = 0) {
  try {
    await mongoose.connect(process.env.Mongo_URL, {
      // ── DNS / Network fixes ──────────────────────────────────
      family: 4,                        // Force IPv4 sockets (bypasses broken IPv6)

      // ── Timeouts ─────────────────────────────────────────────
      serverSelectionTimeoutMS: 30000,   // Wait up to 30s to find a suitable server
      connectTimeoutMS: 30000,           // TCP connection timeout
      socketTimeoutMS: 45000,            // How long a socket can be idle before closing

      // ── Reliability ──────────────────────────────────────────
      retryWrites: true,                 // Auto-retry failed writes
      retryReads: true,                  // Auto-retry failed reads
      maxPoolSize: 10,                   // Connection pool size
      minPoolSize: 2,                    // Keep at least 2 connections warm

      // ── Heartbeat ────────────────────────────────────────────
      heartbeatFrequencyMS: 15000,       // Check server health every 15s
    });

    console.log("✅ MongoDB CONNECTED successfully");
  } catch (err) {
    console.error(`❌ MongoDB connection attempt ${retryCount + 1} failed: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s... (${MAX_RETRIES - retryCount - 1} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return dbconnection(retryCount + 1);
    } else {
      console.error("🚫 All MongoDB connection attempts exhausted. Exiting.");
      process.exit(1);
    }
  }
}

// Handle connection events for monitoring
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Mongoose will auto-reconnect.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected successfully.");
});

export default dbconnection;
