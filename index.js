import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// 1. Start OAuth
app.get("/auth/spotify", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private";

  const url =
    "https://accounts.spotify.com/authorize" +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(url);
});

// 2. Callback
app.get("/auth/spotify/callback", async (req, res) => {
  const code = req.query.code;

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

    res.send(`
      <h1>Spotify Linked!</h1>
      <p>Access Token: ${accessToken}</p>
      <p>Refresh Token: ${refreshToken}</p>
    `);
  } catch (err) {
    console.error(err.response?.data || err);
    res.send("Error linking Spotify");
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
