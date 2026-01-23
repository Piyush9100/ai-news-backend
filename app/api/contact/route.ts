/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"AI News Contact" <${process.env.EMAIL_USER}>`,
      to: "aiwnews24.7@gmail.com", //receiving email
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>📩 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br/>
        <p>Sent via AI News Contact Form</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, info });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
