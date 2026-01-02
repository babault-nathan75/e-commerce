import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    message: String,
    link: String,
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
