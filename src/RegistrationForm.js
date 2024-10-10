import React, { useState } from "react";
import bcrypt from "bcryptjs";

function RegistrationForm() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
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
    xhr.send(hashedPassword);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" value={password} onChange={handlePasswordChange} />
      <button type="submit">Register</button>
      {data ? <div>{JSON.stringify(data)}</div> : <div>Loading...</div>}
    </form>
  );
}

export default RegistrationForm;
