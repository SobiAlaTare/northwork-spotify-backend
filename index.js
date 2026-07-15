import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ENV
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Debug mode
console.log("=== DEBUG MODE ENABLED ===");
console.log("REPL_SLUG:", process.env.REPL_SLUG);
console.log("REPL_OWNER:", process.env.REPL_OWNER);
console.log("CLIENT_ID:", CLIENT_ID);
console.log("REDIRECT_URI:", REDIRECT_URI);

// 1. Start OAuth
app.get("/auth/spotify", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";

  const url =
    "https://accounts.spotify.com/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}`;

  console.log("OAuth start URL:", url);
  res.redirect(url);
});

// 2. Callback
app.get("/auth/spotify/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Callback code:", code);

  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const accessToken = tokenRes.data.access_token;
    const refreshToken = tokenRes.data.refresh_token;

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    res.send(`
      <h1>Spotify Linked!</h1>
      <p>Access Token: ${accessToken}</p>
      <p>Refresh Token: ${refreshToken}</p>
    `);
  } catch (err) {
    console.error("Error:", err.response?.data || err);
    res.send("Error linking Spotify");
  }
});

// Visible test route
app.get("/visible", (req, res) => {
  console.log("Visible route hit!");
  res.send("<h1>Backend is visible!</h1>");
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server + print public URL
app.listen(3000, () => {
  const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  console.log("Server running on port 3000");
  console.log("Public URL:", url);
  console.log("Redirect URI:", REDIRECT_URI);
});
