import React, { useRef, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const onSubmit = () => {};

  const handleInputChange = () => {};

  return (
    <div>
      <h1>Login</h1>
      <hr />
      <input placeholder="email" onChange={handleInputChange} />
      <input placeholder="password" onChange={handleInputChange} />
    </div>
  );
}
