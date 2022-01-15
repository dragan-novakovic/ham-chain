import React, { useRef, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const auth = getAuth();

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const onSubmit = () => {
    signInWithEmailAndPassword(auth, "farmer@gmail.com", "123123")
      .then((userCred) => {
        console.log(userCred);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  };

  const handleInputChange = () => {};

  return (
    <div>
      <h1>Login</h1>
      <hr />
      <input placeholder="email" onChange={handleInputChange} />
      <input placeholder="password" onChange={handleInputChange} />
      <button onClick={onSubmit}>KLIK</button>
    </div>
  );
}
