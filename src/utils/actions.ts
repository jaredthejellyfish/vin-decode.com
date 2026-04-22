"use server";

import { redirect } from "next/navigation";

import formData from "form-data";
import Mailgun from "mailgun.js";

export async function resultsForVin(data: FormData) {
  const vin = data.get("vin");
  if (!vin) return;
  redirect(`/results/${vin}`);
}

export async function contactEmailSubmit(data: FormData) {
  try {
    const { email, name, subject, message } = Object.fromEntries(data);

    if (!email || !name || !subject || !message) {
      console.error("Missing required fields");
      redirect("/contact/error");
    }

    const mailgun = new Mailgun(formData);
    const client = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
    });

    const emailContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <h3>Message:</h3>
    <p>${message}</p>
    `;

    const messageData = {
      from: `contact@vin-decode.com`,
      to: ["ger.almenara@gmail.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: emailContent,
      text: emailContent.replace(/<[^>]+>/g, ""),
    };

    await client.messages.create(process.env.MAILGUN_DOMAIN || "", messageData);
  } catch (error) {
    console.error(error as Error);
    redirect("/contact/error");
  }
  redirect("/contact/success");
}
