import mongoose from "mongoose";
const adminSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin"],
    default: "admin",
  },
});
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
