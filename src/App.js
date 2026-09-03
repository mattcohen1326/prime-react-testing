import "./App.css";
import Meals from "./Meals.js";
import Workouts from "./Workouts.js";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomeScreen from "./HomeScreen.js";

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Meals />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/workouts" element={<Workouts />} />
      </Routes>
    </BrowserRouter>
  );
}
//DEPLOY AGAIN
export default App;
