import logo from "./logo.svg";
import "./App.css";
import { Button, Card, Menubar, InputText } from "primereact";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Request from "./Request.js";
import RegistrationForm from "./RegistrationForm.js";
import Meals from "./Meals.js";
import Workouts from "./Workouts.js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import HomeScreen from "./HomeScreen.js";

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

export default App;
