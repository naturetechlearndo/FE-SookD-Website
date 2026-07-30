import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { getUsers, updateUser } from "./userService";

// in-memory token store: token → { userId, expiry }
const resetTokens = new Map<string, { userId: string; expiry: number }>();

const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function requestPasswordReset(email: string): Promise<void> {
  const users = await getUsers();
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("ไม่พบอีเมลนี้ในระบบ");

  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { userId: user.user_id, expiry: Date.now() + 3600_000 });

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const resetLink = `${frontendUrl}?reset_token=${token}`;

  await mailer.sendMail({
    from: `"SookD" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "รีเซ็ตรหัสผ่าน SookD",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d6a4f">รีเซ็ตรหัสผ่าน</h2>
        <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#2d6a4f;color:#fff;border-radius:8px;text-decoration:none;font-size:15px">
          ตั้งรหัสผ่านใหม่
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">
          หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้ละเว้นอีเมลนี้
        </p>
      </div>
    `,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const entry = resetTokens.get(token);
  if (!entry) throw new Error("ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว");
  if (Date.now() > entry.expiry) {
    resetTokens.delete(token);
    throw new Error("ลิงก์หมดอายุแล้ว กรุณาขอใหม่อีกครั้ง");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await updateUser(entry.userId, { password: hash });
  resetTokens.delete(token);
}

export async function login(

    email: string,
    password: string

) {

    const users =
        await getUsers();

    // หา email

    const user =
        users.find(

            u =>
                u.email === email

        );

    if (!user) {

        throw new Error(
            "Email ไม่ถูกต้อง"
        );

    }

    // เช็ครหัสผ่าน

    const match =
        await bcrypt.compare(

            password,

            user.password

        );

    if (!match) {

        throw new Error(
            "Password ไม่ถูกต้อง"
        );

    }


    // สร้าง JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
}

    const token =
        jwt.sign(

            {

                user_id:
                    user.user_id,

                user_type:
                    user.user_type

            },

            JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

    return {

        token,

        user

    };

}