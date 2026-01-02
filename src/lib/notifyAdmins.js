import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

export async function notifyAdmins({ title, message, link }) {
  const admins = await User.find({ isAdmin: true }).select("_id");

  if (!admins.length) return;

  await Notification.insertMany(
    admins.map((a) => ({
      userId: a._id,
      title,
      message,
      link
    }))
  );
}
