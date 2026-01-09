import React, { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import "./HomeScreen.css";
import SignInCard from "./SignInCard";

function Homescreen() {
  return (
    <div id="Homescreen">
      <SignInCard></SignInCard>
    </div>
  );
}

export default Homescreen;
