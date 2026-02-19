import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.SMTP_HOST) {
    console.log("SMTP not configured in MVP, fallback console", { to, subject, html });
  }
  console.log("DEV_EMAIL", { to, subject, html });
}
