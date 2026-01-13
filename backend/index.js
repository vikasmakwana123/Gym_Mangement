import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import authRoutes from "./routes/auth.routes.js";

const app = express();
dotenv.config();
app.use(cors());

// ✅ Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique filename
  },
});
const upload = multer({ storage });

// Example route for image upload
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    file: req.file,
  });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Gym Management Backend is running");
});

// ✅ Your existing routes
app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
