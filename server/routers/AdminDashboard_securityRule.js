import express from "express";
const Router = express.Router();
import { isAdminOrViewer } from "../middlewares/isAdminOnly.js";

Router.get("/verify/jwt", isAdminOrViewer, (req, res) => {
  const access = true;
  return res.status(200).json({
    message: "Valid Token - Access Granted",
    access,
    role: req.user.role,
  });
});
export default Router;

