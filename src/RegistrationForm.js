import React, { useState } from "react";
import bcrypt from "bcryptjs";
import "./RegistrationForm.css";

function RegistrationForm() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [username, setUsername] = useState("");
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleUsernamecChange = (event) => {
    setUsername(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/endpoint");
    xhr.onload = function () {
      if (xhr.status === 200) {
        setData(JSON.parse(xhr.responseText));
      }
    };
    const payload = { username: username, password: hashedPassword };
    xhr.send(JSON.stringify(payload));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1>Username</h1>
        <input
          type="text"
          value={username}
          onChange={handleUsernamecChange}
        ></input>
      </div>
      <div>
        <h1>Password</h1>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      <button type="submit">Register</button>
      {data ? (
        <div id="data">{JSON.stringify(data)}</div>
      ) : (
        <div>Loading...</div>
      )}
    </form>
  );
}

export default RegistrationForm;
