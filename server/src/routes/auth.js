import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Missing credential" });
  }

  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!email || !name) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const token = jwt.sign(
      { id: userId, email, name, picture },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Only false for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    });

    return res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Google JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid Google credential" });
  }
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;