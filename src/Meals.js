import React, { useEffect, useMemo, useState } from "react";
import "./Meals.css";
function Meals() {
  // Generic meals (dropdown list)
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");

  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");

  // Send-to-meals
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendResult, setSendResult] = useState(null);

  // Daily meals by date
  const [dateInput, setDateInput] = useState(""); // YYYY-MM-DD
  const [dailyMeals, setDailyMeals] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState("");

  // Custom meal (NEW)
  const CUSTOM_OPTION_VALUE = "__CUSTOM__";
  const isCustomSelected = selectedItemId === CUSTOM_OPTION_VALUE;

  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");

  const DAILY_MEALS_ENDPOINT = "http://localhost:8080/meals/getMealsForDay";

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoadingItems(true);
        setItemsError("");

        const res = await fetch("http://localhost:8080/generic_meals/get_all");
        if (!res.ok)
          throw new Error(`Failed to load items (HTTP ${res.status})`);

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setItemsError(e?.message || "Failed to load items");
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, []);

  // When switching away from Custom, clear custom form + previous send result/errors
  useEffect(() => {
    setSendError("");
    setSendResult(null);

    if (!isCustomSelected) {
      setCustomName("");
      setCustomCalories("");
      setCustomProtein("");
    }
  }, [isCustomSelected]);

  const selectedItem = useMemo(
    () => items.find((m) => String(m.id) === String(selectedItemId)),
    [items, selectedItemId]
  );

  // Helper: local YYYY-MM-DD (avoids UTC date edge case near midnight)
  const todayLocalYYYYMMDD = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const handleAddToGrocery = async () => {
    // Build payload either from selected generic item OR custom form
    let payload;

    if (isCustomSelected) {
      const name = customName.trim();
      const calories = Number(customCalories);
      const protein = Number(customProtein);

      if (!name) {
        setSendError("Please enter a meal name.");
        return;
      }
      if (!Number.isFinite(calories) || calories < 0) {
        setSendError("Please enter a valid calories number.");
        return;
      }
      if (!Number.isFinite(protein) || protein < 0) {
        setSendError("Please enter a valid protein number.");
        return;
      }

      payload = {
        name,
        calories,
        protein,
        date: todayLocalYYYYMMDD(),
      };
    } else {
      if (!selectedItem) return;

      payload = {
        name: selectedItem.name,
        calories: Number(selectedItem.calories) || 0,
        protein: Number(selectedItem.protein) || 0,
        date: todayLocalYYYYMMDD(),
      };
    }

    try {
      setSendLoading(true);
      setSendError("");
      setSendResult(null);

      const res = await fetch("http://localhost:8080/meals/addMeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to add meal (HTTP ${res.status})${text ? `: ${text}` : ""}`
        );
      }

      const result = await res.json().catch(() => ({ ok: true }));
      setSendResult(result);

      // Optional: after adding a custom meal, clear the form
      if (isCustomSelected) {
        setCustomName("");
        setCustomCalories("");
        setCustomProtein("");
      }
    } catch (e) {
      setSendError(e?.message || "Failed to add meal");
    } finally {
      setSendLoading(false);
    }
  };

  const isValidYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const fetchMealsForDate = async (dateStr) => {
    try {
      setDailyLoading(true);
      setDailyError("");
      setDailyMeals([]);

      if (!isValidYYYYMMDD(dateStr)) {
        throw new Error("Please enter a date in YYYY-MM-DD format.");
      }

      const url = `${DAILY_MEALS_ENDPOINT}?date=${encodeURIComponent(dateStr)}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to load meals for ${dateStr} (HTTP ${res.status})${
            text ? `: ${text}` : ""
          }`
        );
      }

      const data = await res.json();
      setDailyMeals(Array.isArray(data) ? data : []);
    } catch (e) {
      setDailyError(e?.message || "Failed to load meals for that date");
    } finally {
      setDailyLoading(false);
    }
  };
  // Auto-load today's meals on first page load
  useEffect(() => {
    const today = todayLocalYYYYMMDD();
    setDateInput(today); // shows today's date in the input
    fetchMealsForDate(today); // loads meals for today
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDailyMealsSubmit = async (e) => {
    e.preventDefault();
    await fetchMealsForDate(dateInput.trim());
  };

  if (loadingItems) return <div>Loading items...</div>;
  if (itemsError)
    return <div style={{ color: "red" }}>Error: {itemsError}</div>;

  const totalCalories = dailyMeals.reduce(
    (sum, m) => sum + (Number(m.calories) || 0),
    0
  );

  const totalProtein = dailyMeals.reduce(
    (sum, m) => sum + (Number(m.protein) || 0),
    0
  );

  const remainingCalories = 2000 - totalCalories;
  const remainingProtein = 220 - totalProtein;
  return (
    <div className="Forms">
      <img
        src="/thickporg_1.png"
        alt="Meal"
        style={{
          width: "100%",
          maxWidth: 320,
          display: "block",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      <label htmlFor="item"></label>
      <select
        id="item"
        value={selectedItemId}
        onChange={(e) => setSelectedItemId(e.target.value)}
        style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
      >
        <option value="">-- Select an item --</option>

        {/* NEW: Custom option */}
        <option value={CUSTOM_OPTION_VALUE}>Custom...</option>

        {/* Existing generic meals */}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {/* NEW: Custom meal form */}
      {isCustomSelected && (
        <div style={{ marginTop: 12, padding: 12, background: "#f6f6f6" }}>
          <div style={{ marginBottom: 8 }}>
            <label>
              <strong>Name</strong>
            </label>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Chicken stir-fry"
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                marginTop: 6,
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label>
                <strong>Calories</strong>
              </label>
              <input
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="e.g., 650"
                inputMode="numeric"
                style={{
                  display: "block",
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>
                <strong>Protein (g)</strong>
              </label>
              <input
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                placeholder="e.g., 55"
                inputMode="numeric"
                style={{
                  display: "block",
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Existing selected item display */}
      {!isCustomSelected && selectedItem ? (
        <div style={{ marginTop: 12 }}>
          <div>
            <strong>Selected:</strong> {selectedItem.name}
          </div>
          <div>
            <strong>Calories:</strong> {selectedItem.calories}
          </div>
          <div>
            <strong>Protein:</strong> {selectedItem.protein}
          </div>
        </div>
      ) : null}

      {/* Add button works for both generic + custom */}
      <button
        type="button"
        onClick={handleAddToGrocery}
        disabled={
          sendLoading ||
          (!isCustomSelected && !selectedItem) ||
          (isCustomSelected && !customName.trim())
        }
        style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
      >
        {sendLoading ? "Adding..." : "Add Meal For Today"}
      </button>

      {sendError && (
        <div style={{ marginTop: 10, color: "red" }}>Error: {sendError}</div>
      )}

      {sendResult && (
        <pre style={{ marginTop: 10, background: "#f6f6f6", padding: 10 }}>
          {JSON.stringify(sendResult, null, 2)}
        </pre>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3 style={{ margin: "0 0 10px" }}>View Meals for a Day</h3>

      <form onSubmit={handleDailyMealsSubmit}>
        <label htmlFor="date">
          <strong>Date (YYYY-MM-DD):</strong>
        </label>
        <input
          id="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="2026-01-08"
          style={{
            display: "block",
            width: "100%",
            padding: 8,
            marginTop: 6,
          }}
        />

        <button
          type="submit"
          disabled={dailyLoading}
          style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
        >
          {dailyLoading ? "Loading..." : "Load meals for date"}
        </button>
      </form>

      {dailyError && (
        <div style={{ marginTop: 10, color: "red" }}>Error: {dailyError}</div>
      )}

      {!dailyLoading && !dailyError && (
        <div style={{ marginTop: 12 }}>
          <strong>Meals:</strong> {dailyMeals.length}
        </div>
      )}

      {dailyMeals.length > 0 && (
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
                  Name
                </th>
                <th
                  style={{
                    textAlign: "right",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Calories
                </th>
                <th
                  style={{
                    textAlign: "right",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Protein
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyMeals.map((meal) => (
                <tr key={meal.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {meal.name}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {meal.calories}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {meal.protein}g
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 10, background: "#f6f6f6", padding: 10 }}>
            <strong>Totals:</strong> {totalCalories} cal, {totalProtein}g
            protein
            <br />
            <strong>Remaining:</strong> {remainingCalories} cal,{" "}
            {remainingProtein}g
          </div>
        </div>
      )}

      {dailyMeals.length === 0 && !dailyLoading && dateInput && !dailyError && (
        <div style={{ marginTop: 12 }}>No meals found for that date.</div>
      )}
    </div>
  );
}

export default Meals;
