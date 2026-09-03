require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const Workout = require("./models/Workout");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/workouts";
const PORT = parseInt(process.env.PORT, 10) || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// POST /workouts — add a workout
app.post("/workouts", async (req, res) => {
  try {
    const { date, type, name, durationMinutes, notes } = req.body;
    if (!date || !name || durationMinutes == null) {
      return res.status(400).json({
        error: "Missing required fields: date, name, durationMinutes",
      });
    }
    const mins = Number(durationMinutes);
    if (!Number.isFinite(mins) || mins < 1) {
      return res
        .status(400)
        .json({ error: "durationMinutes must be a positive number" });
    }
    const doc = await Workout.create({
      date: String(date).slice(0, 10),
      type: type || "cardio",
      name: String(name).trim(),
      durationMinutes: mins,
      notes: notes ? String(notes).trim() : "",
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to add workout" });
  }
});

// GET /workouts?date=YYYY-MM-DD — get workouts for a day
app.get("/workouts", async (req, res) => {
  try {
    const date = req.query.date;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ error: "Query param 'date' (YYYY-MM-DD) is required" });
    }
    const workouts = await Workout.find({ date })
      .sort({ createdAt: -1 })
      .lean();
    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to load workouts" });
  }
});

// POST /meals/getNutritionInfo — get nutrition info using AI
app.post("/meals/getNutritionInfo", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY is not configured" });
    }

    const { foodName } = req.body;
    if (!foodName || !foodName.trim()) {
      return res.status(400).json({ error: "foodName is required" });
    }

    const message = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a nutrition expert. When given a food item, return ONLY a JSON object with 'calories' and 'protein' (in grams) as numbers. No other text.",
        },
        {
          role: "user",
          content: `What are the approximate calories and protein (in grams) for a typical serving of: ${foodName.trim()}? Return only valid JSON like {"calories": 150, "protein": 25}`,
        },
      ],
      temperature: 0.3,
    });

    const content = message.choices[0].message.content.trim();
    const nutritionData = JSON.parse(content);

    if (
      typeof nutritionData.calories !== "number" ||
      typeof nutritionData.protein !== "number"
    ) {
      throw new Error("Invalid nutrition data format");
    }

    res.json({
      calories: Math.round(nutritionData.calories),
      protein: Math.round(nutritionData.protein * 10) / 10,
    });
  } catch (err) {
    console.error("Nutrition lookup error:", err);
    res.status(500).json({
      error: err.message || "Failed to get nutrition info",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Workouts API listening on http://localhost:${PORT}`);
});
