import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";

//@ts-ignore
import { db } from "../index.tsx";
//@ts-ignore
import useAuth from "../utils/useAuth.ts";

//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";

export default function LoginPage(props: any) {
  const { keyringState, keyring } = useSubstrate();
  const auth = getAuth();
  const [isNewUser, toggleRegister] = useState(false);
  const [email, setEmail] = useState<string>("farmer@gmail.com");
  const [password, setPassword] = useState<string>("123123");
  const [accs, setAccs] = useState([]);

  const onSubmit = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        useAuth(userCred);
        props.setLogin([true, userCred]);

        // save name/uid -> map with wallet + redux
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  };

  const registerNewUser = () => {
    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((userCred) => {
    //     // create user db
    //     useAuth(userCred);
    //     props.setLogin([true, userCred]);
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     console.error(errorCode, errorMessage);
    //   });
  };

  const handleInputChange = (e: any) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  return (
    <div>
      <h1>{isNewUser ? "Register" : "Login"}</h1>
      <hr />
      <input placeholder="email" name="email" onChange={handleInputChange} />
      <input placeholder="password" name="pass" onChange={handleInputChange} />
      <button onClick={isNewUser ? registerNewUser : onSubmit}>KLIK</button>
      <a onClick={() => toggleRegister(true)}>New User?</a>
    </div>
  );
}
