import React, { useEffect, useState } from "react";

function Meals() {
  const [meals, setMeals] = useState([]);
  const [selectedMealId, setSelectedMealId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendResult, setSendResult] = useState(null);

  // 1) Load meals from your API on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:8080/grocery/items");
        if (!res.ok)
          throw new Error(`Failed to load meals (HTTP ${res.status})`);

        const data = await res.json();
        setMeals(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load meals");
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  // Find the selected meal object
  const selectedMeal = meals.find(
    (m) => String(m.id) === String(selectedMealId)
  );

  // 2) Send selected meal as a GroceryItem to a different API
  const handleAddToGrocery = async () => {
    if (!selectedMeal) return;

    // Map meal -> GroceryItem (matches your Java model)
    const groceryItem = {
      // If you want Mongo to generate the id, remove this line
      id: "122323",
      name: selectedMeal.name,
      quantity: Number(selectedMeal.quantity) || 0,
      category: selectedMeal.category || "MEAL",
    };

    try {
      setSendLoading(true);
      setSendError("");
      setSendResult(null);

      const res = await fetch("http://localhost:8080/grocery/createItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groceryItem),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to add item (HTTP ${res.status})${text ? `: ${text}` : ""}`
        );
      }

      // If your backend returns the saved object as JSON:
      const result = await res.json().catch(() => ({ ok: true }));
      setSendResult(result);
    } catch (e) {
      setSendError(e?.message || "Failed to add grocery item");
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) return <div>Loading meals...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 420 }}>
      {/* Image from public folder:
          If your image is public/meal.png use src="/meal.png"
          If your image is public/images/meal.png use src="/images/meal.png"
      */}
      <img
        src="/meal.png"
        alt="Meal"
        style={{
          width: "100%",
          maxWidth: 320,
          display: "block",
          marginBottom: 12,
        }}
        onError={(e) => {
          // helpful fallback if the path is wrong
          e.currentTarget.style.display = "none";
        }}
      />

      <label htmlFor="meal">
        <strong>Meal:</strong>
      </label>
      <select
        id="meal"
        value={selectedMealId}
        onChange={(e) => setSelectedMealId(e.target.value)}
        style={{ display: "block", width: "100%", padding: 8, marginTop: 6 }}
      >
        <option value="">-- Select a meal --</option>
        {meals.map((meal) => (
          <option key={meal.id} value={meal.id}>
            {meal.name}
          </option>
        ))}
      </select>

      {selectedMeal ? (
        <div style={{ marginTop: 12 }}>
          <div>
            <strong>Selected:</strong> {selectedMeal.name}
          </div>
          <div>
            <strong>Quantity:</strong> {selectedMeal.quantity}
          </div>
          <div>
            <strong>Category:</strong> {selectedMeal.category || "MEAL"}
          </div>

          <button
            type="button"
            onClick={handleAddToGrocery}
            disabled={sendLoading}
            style={{ marginTop: 12, padding: "8px 12px", cursor: "pointer" }}
          >
            {sendLoading ? "Adding..." : "Add to Grocery List"}
          </button>

          {sendError && (
            <div style={{ marginTop: 10, color: "red" }}>
              Error: {sendError}
            </div>
          )}

          {sendResult && (
            <pre style={{ marginTop: 10, background: "#f6f6f6", padding: 10 }}>
              {JSON.stringify(sendResult, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>No meal selected.</div>
      )}
    </div>
  );
}

export default Meals;
