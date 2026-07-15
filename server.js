import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// Debug mode
console.log("=== DEBUG MODE ENABLED ===");
console.log("CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);

// Visible endpoint
app.get("/visible", (req, res) => {
  res.send("Backend is visible!");
});

// Spotify login
app.get("/auth/spotify", (req, res) => {
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const scope = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read"
  ].join(" ");

  const authUrl =
    "https://accounts.spotify.com/authorize" +
    `?client_id=${process.env.SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});

// Spotify callback
app.get("/auth/spotify/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

  const tokenUrl = "https://accounts.spotify.com/api/token";

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
  params.append("client_id", process.env.SPOTIFY_CLIENT_ID);
  params.append("client_secret", process.env.SPOTIFY_CLIENT_SECRET);

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const data = await response.json();

    if (data.error) {
      console.log("Spotify error:", data);
      return res.status(400).send("Spotify token error");
    }

    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).send("Internal server error");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
