const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, required: true, default: "cardio" },
    name: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
