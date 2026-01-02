import twilio from "twilio";
import fs from "fs";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp({
  to,
  message,
  mediaPath
}) {
  const mediaUrl = mediaPath
    ? `https://ton-domaine.com${mediaPath}`
    : undefined;

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    body: message,
    mediaUrl: mediaUrl ? [mediaUrl] : undefined
  });
}
