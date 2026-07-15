import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Storage file for linked Spotify accounts
const USERS_FILE = "users.json";

// Create file if missing
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "{}");
}

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
app.listen(3000, () => {
  console.log("Backend started on port 3000");
});
