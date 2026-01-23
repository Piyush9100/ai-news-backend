"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
/* eslint-disable @typescript-eslint/no-explicit-any */
const nodemailer_1 = __importDefault(require("nodemailer"));
const server_1 = require("next/server");
async function POST(req) {
    try {
        const { name, email, message } = await req.json();
        const transporter = nodemailer_1.default.createTransport({
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
        return server_1.NextResponse.json({ success: true, info });
    }
    catch (error) {
        console.error("Email error:", error);
        return server_1.NextResponse.json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=route.js.map