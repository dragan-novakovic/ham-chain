import React, { useRef, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";

import { db } from "../index";
import useAuth from "../utils/useAuth";

export default function LoginPage() {
  const auth = getAuth();

  const [email, setEmail] = useState<string>("farmer@gmail.com");
  const [password, setPassword] = useState<string>("123123");

  const onSubmit = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        console.log(userCred);

        useAuth(userCred);

        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data()}`);
        });

        try {
          const docRef = await addDoc(collection(db, "users"), {
            permission: 0,
            uuid: userCred.user.uid,
            wallet: "xxx",
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
        // save name/uid -> map with wallet + redux
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
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
      <h1>Login</h1>
      <hr />
      <input placeholder="email" name="email" onChange={handleInputChange} />
      <input placeholder="password" name="pass" onChange={handleInputChange} />
      <button onClick={onSubmit}>KLIK</button>
    </div>
  );
}
