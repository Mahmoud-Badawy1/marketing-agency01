import { Router } from "express";
import { storage } from "../storage.js";
import { generateOtp, sendOtpEmail, generateToken, userAuth, hashPassword, verifyPassword } from "../auth.js";
import crypto from "crypto";
import {
  adminAuth,
  getClientIp,
  isLoginRateLimited,
  safeCompare,
  ADMIN_PASSWORD,
  cleanupSessions,
  loginAttempts,
  generateSessionToken,
  sessions,
  SESSION_DURATION,
  recordFailedAttempt
} from "./common.js";

const router = Router();

// Client App Auth
router.post("/auth/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });

    const user = await storage.getUserAccountByEmail(email);
    if (!user) {
      return res.json({ exists: false, hasPassword: false });
    }
    
    return res.json({ 
      exists: true, 
      hasPassword: !!user.password 
    });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ" });
  }
});

router.post("/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes
    await storage.saveOtpCode({ email, code, expiresAt, attempts: 0 });

    await sendOtpEmail(email, code);
    res.json({ message: "تم إرسال رمز التحقق بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الرمز" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, code, name, phone } = req.body;
    const isValid = await storage.verifyOtpCode(email, code);
    if (!isValid) return res.status(400).json({ message: "الرمز غير صحيح أو منتهي الصلاحية" });

    let user = await storage.getUserAccountByEmail(email);
    const sessionId = crypto.randomBytes(16).toString("hex");
    if (!user) {
      if (!name) return res.status(400).json({ message: "الاسم مطلوب لتسجيل حساب جديد" });
      user = await storage.createUserAccount({ 
        email, 
        name, 
        phone: phone || "", 
        role: "client", 
        isActive: true 
      });
      // Need to re-fetch to get _id properly formatted and update token
      user = await storage.updateUserAccount(user._id, { activeSessionToken: sessionId, lastLogin: new Date() }) as any;
    } else {
      user = await storage.updateUserAccount(user._id, { activeSessionToken: sessionId, lastLogin: new Date() }) as any;
    }

    const token = generateToken(user!._id, user!.role, sessionId);
    res.json({ token, user, isNew: !user!.password });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء التحقق" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });

    const user = await storage.getUserAccountByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const sessionId = crypto.randomBytes(16).toString("hex");
    const updatedUser = await storage.updateUserAccount(user._id, { 
      activeSessionToken: sessionId, 
      lastLogin: new Date() 
    });

    const token = generateToken(user._id, user.role, sessionId);
    res.json({ token, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

// First-time password setup only (for accounts that don't have a password yet)
router.post("/auth/set-password", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const userId = (req as any).userAuth?.id;
    const user = await storage.getUserAccount(userId);
    
    // Only allow if user doesn't have a password yet
    if (user?.password) {
      return res.status(400).json({ message: "لديك كلمة مرور بالفعل. استخدم تغيير كلمة المرور بدلاً من ذلك." });
    }

    const hashedPassword = await hashPassword(password);
    await storage.updateUserAccount(userId, { password: hashedPassword });
    res.json({ message: "تم تعيين كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تعيين كلمة المرور" });
  }
});

// Change password (requires old password verification)
router.post("/auth/change-password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة وكلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    const userId = (req as any).userAuth?.id;
    const user = await storage.getUserAccount(userId);
    if (!user || !user.password) {
      return res.status(400).json({ message: "لا يوجد كلمة مرور حالية" });
    }

    const isValid = await verifyPassword(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserAccount(userId, { password: hashedPassword });
    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
});

router.post("/auth/logout", userAuth, async (req, res) => {
  try {
    const userId = (req as any).userAuth?.id;
    // Invalidate the session token in the database
    await storage.updateUserAccount(userId, { activeSessionToken: null });
    res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
  }
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password || password.length < 6) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة وكلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const isValid = await storage.verifyOtpCode(email, code);
    if (!isValid) return res.status(400).json({ message: "الرمز غير صحيح أو منتهي الصلاحية" });

    const user = await storage.getUserAccountByEmail(email);
    if (!user) return res.status(404).json({ message: "المستحدم غير موجود" });

    const hashedPassword = await hashPassword(password);
    // Also clear session on reset for security
    await storage.updateUserAccount(user._id, { 
      password: hashedPassword,
      activeSessionToken: null 
    });

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء إعادة تعيين كلمة المرور" });
  }
});

router.get("/auth/me", userAuth, async (req, res) => {
  try {
    const user = await storage.getUserAccount((req as any).userAuth?.id || "");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.put("/user/profile", userAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updated = await storage.updateUserAccount((req as any).userAuth?.id || "", { name, phone });
    if (!updated) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json({ message: "تم تحديث البيانات بنجاح", user: updated });
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديث البيانات" });
  }
});

// Admin Auth
router.post("/admin/login", (req, res) => {
  const ip = getClientIp(req);

  const rateLimitCheck = isLoginRateLimited(ip);
  if (rateLimitCheck.limited) {
    return res.status(429).json({
      message: `تم تجاوز عدد المحاولات. حاول بعد ${rateLimitCheck.retryAfter} ثانية`,
      retryAfter: rateLimitCheck.retryAfter,
    });
  }

  const { password } = req.body;
  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "كلمة المرور مطلوبة" });
  }

  if (safeCompare(password, ADMIN_PASSWORD)) {
    cleanupSessions();
    loginAttempts.delete(ip);

    const token = generateSessionToken();
    sessions.set(token, { createdAt: Date.now(), ip });

    res.json({ success: true, token, expiresIn: SESSION_DURATION });
  } else {
    const remaining = recordFailedAttempt(ip);
    res.status(401).json({
      message:
        remaining > 0
          ? `كلمة المرور غير صحيحة. متبقي ${remaining} محاولات`
          : "تم قفل الحساب مؤقتاً بسبب كثرة المحاولات الخاطئة",
    });
  }
});

router.get("/admin/verify", adminAuth, (_req, res) => {
  res.json({ valid: true });
});

router.post("/admin/logout", adminAuth, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) sessions.delete(token);
  res.json({ success: true });
});

export default router;
