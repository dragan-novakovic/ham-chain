import React, { useRef, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";

import { db } from "../index";

export default function LoginPage() {
  const auth = getAuth();

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const onSubmit = () => {
    signInWithEmailAndPassword(auth, "farmer@gmail.com", "123123")
      .then(async (userCred) => {
        console.log(userCred);

        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data()}`);
        });

        try {
          const docRef = await addDoc(collection(db, "users"), {
            permission: "Ada",
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
