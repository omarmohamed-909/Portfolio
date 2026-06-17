import mongoose from "mongoose";
const ContactMessageSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read", "replied"],
    default: "unread",
  },
}, { timestamps: true });
const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);
export default ContactMessage;
