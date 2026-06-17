import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete"],
    },
    resource: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
    adminId: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", ActivityLogSchema);
