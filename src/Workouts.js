import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Workouts.css";

const STORAGE_KEY = "workout_logs";

function getStoredWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function Workouts() {
  const [workouts, setWorkouts] = useState(getStoredWorkouts());

  const [workoutType, setWorkoutType] = useState("cardio");
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const [dateInput, setDateInput] = useState("");
  const [viewDate, setViewDate] = useState(null);
  const [dailyWorkouts, setDailyWorkouts] = useState([]);

  const todayLocalYYYYMMDD = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    setWorkouts(getStoredWorkouts());
  }, []);

  useEffect(() => {
    setStoredWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    const today = todayLocalYYYYMMDD();
    setDateInput(today);
    setViewDate(today);
  }, []);

  useEffect(() => {
    if (!viewDate) {
      setDailyWorkouts([]);
      return;
    }
    const filtered = workouts.filter(
      (w) => String(w.date).slice(0, 10) === viewDate
    );
    setDailyWorkouts(filtered);
  }, [workouts, viewDate]);

  const isValidYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    const mins = Number(duration);
    if (!workoutName.trim()) {
      setAddError("Please enter a workout name.");
      return;
    }
    if (!Number.isFinite(mins) || mins <= 0) {
      setAddError("Please enter a valid duration (minutes).");
      return;
    }
    setAddLoading(true);
    setAddError("");
    const newWorkout = {
      id: Date.now(),
      date: todayLocalYYYYMMDD(),
      type: workoutType,
      name: workoutName.trim(),
      durationMinutes: mins,
      notes: notes.trim() || undefined,
    };
    setWorkouts((prev) => [newWorkout, ...prev]);
    setWorkoutName("");
    setDuration("");
    setNotes("");
    setAddLoading(false);
  };

  const handleViewDateSubmit = (e) => {
    e.preventDefault();
    const dateStr = dateInput.trim();
    if (!isValidYYYYMMDD(dateStr)) {
      setAddError("Please enter a date in YYYY-MM-DD format.");
      return;
    }
    setViewDate(dateStr);
    setAddError("");
  };

  const totalMinutes = dailyWorkouts.reduce(
    (sum, w) => sum + (Number(w.durationMinutes) || 0),
    0
  );

  return (
    <div className="Forms">
      <nav className="workouts-nav">
        <Link to="/meals">Meals</Link>
        <span className="nav-sep">|</span>
        <Link to="/workouts">Workouts</Link>
      </nav>

      <h2 className="workouts-page-title">Workout Tracking</h2>

      <form onSubmit={handleAddWorkout} className="workout-add-form">
        <h3 style={{ margin: "0 0 10px" }}>Log a Workout</h3>
        <div className="flex-item">
          <label>
            <strong>Type</strong>
          </label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex-item">
          <label>
            <strong>Workout name</strong>
          </label>
          <input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Morning run"
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 6,
            }}
          />
        </div>
        <div className="flex-item">
          <label>
            <strong>Duration (minutes)</strong>
          </label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30"
            inputMode="numeric"
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 6,
            }}
          />
        </div>
        <div className="flex-item">
          <label>
            <strong>Notes (optional)</strong>
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., 5K, felt good"
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 6,
            }}
          />
        </div>
        <div className="flex-item">
          <button
            type="submit"
            disabled={addLoading}
            style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
          >
            {addLoading ? "Adding..." : "Add Workout for Today"}
          </button>
        </div>
      </form>
      {addError && (
        <div style={{ marginTop: 10, color: "red" }}>Error: {addError}</div>
      )}

      <h3 style={{ margin: "24px 0 10px" }}>View Workouts for a Day</h3>
      <form onSubmit={handleViewDateSubmit}>
        <label htmlFor="workout-date">
          <strong>Date (YYYY-MM-DD):</strong>
        </label>
        <input
          id="workout-date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="2026-02-04"
          style={{
            display: "block",
            width: "100%",
            padding: 8,
            marginTop: 6,
          }}
        />
        <button
          type="submit"
          style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
        >
          Load workouts for date
        </button>
      </form>

      <div className="flex-item">
        {dailyWorkouts.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                      padding: 8,
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                      padding: 8,
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      borderBottom: "1px solid #ddd",
                      padding: 8,
                    }}
                  >
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyWorkouts.map((w) => (
                  <tr key={w.id}>
                    <td
                      style={{ borderBottom: "1px solid #eee", padding: 8 }}
                    >
                      {w.type}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {w.name}
                      {w.notes && (
                        <span style={{ color: "#666", fontSize: "0.9em" }}>
                          {" "}
                          — {w.notes}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: 8,
                        textAlign: "right",
                      }}
                    >
                      {w.durationMinutes} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{ marginTop: 10, background: "#f6f6f6", padding: 10 }}
            >
              <strong>Total: </strong>
              {totalMinutes} min
              {totalMinutes >= 60
                ? ` (${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m)`
                : ""}
            </div>
          </div>
        ) : viewDate ? (
          <div style={{ marginTop: 12 }}>No workouts for this date.</div>
        ) : null}
      </div>
    </div>
  );
}

export default Workouts;
