import express from "express";
import { oAuth2Client } from "../config/googleAuth.js"; // 👈 This now works!
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Login: Redirect to Google
router.get("/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(authUrl); // ✅ Now includes redirect_uri automatically!
});

// Callback: Handle Google response
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          picture,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    });

    res.redirect("http://localhost:5173");
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, picture: true },
    });

    if (!user) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, user });
  } catch (err) {
    console.error("JWT verify error:", err);
    res.json({ authenticated: false });
  }
});

export default router;