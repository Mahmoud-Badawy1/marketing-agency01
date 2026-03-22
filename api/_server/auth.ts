import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SENDER_NAME = "Marketer Pro Support";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      userAuth?: {
        id: string;
        role: string;
      };
    }
  }
}

export function generateToken(userId: string, role: string, sessionId?: string) {
  const payload: any = { id: userId, role };
  if (sessionId) payload.jti = sessionId;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function userAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح - الرجاء تسجيل الدخول" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check single-device enforcement if jti exists
    if (decoded.jti) {
      const user = await storage.getUserAccount(decoded.id);
      if (!user || user.activeSessionToken !== decoded.jti) {
        return res.status(401).json({ message: "تم تسجيل الدخول من جهاز آخر. الرجاء تسجيل الدخول مجدداً." });
      }
    }

    req.userAuth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "الجلسة منتهية أو غير صالحة" });
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function sendOtpEmail(email: string, code: string) {
  const settings = await Promise.all([
    storage.getSetting("SMTP_HOST"),
    storage.getSetting("SMTP_PORT"),
    storage.getSetting("SMTP_USER"),
    storage.getSetting("SMTP_PASS"),
    storage.getSetting("SENDER_EMAIL")
  ]);

  const [host, port, user, pass, sender] = settings.map(s => s?.value);

  const smtpHost = host || process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = parseInt(port || process.env.SMTP_PORT || "587");
  const smtpUser = user || process.env.SMTP_USER;
  const smtpPass = pass || process.env.SMTP_PASS;
  const senderEmail = sender || process.env.SENDER_EMAIL || "info@marketerpro.com";

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials not set. OTP code is:", code);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: `"${SENDER_NAME}" <${senderEmail}>`,
    to: email,
    subject: "رمز التحقق الخاص بك - ماركتير برو",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; direction: rtl;">
        <h2>مرحباً بك في ماركتير برو</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <h1 style="color: #0d9488; letter-spacing: 5px;">${code}</h1>
        <p>هذا الرمز صالح لمدة 10 دقائق.</p>
        <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
      </div>
    `
  };

  try {
    // Send mail using nodemailer
    await transporter.sendMail({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.htmlContent // Use 'html' instead of 'htmlContent' for nodemailer
    });
  } catch (error) {
    console.error("Error sending email OTP via SMTP:", error);
    throw error;
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
