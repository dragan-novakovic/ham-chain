import React from "react";
import ReactDOM from "react-dom";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuu4gScKO2bLk7J6ykahZEUxPKmoNFCNw",
  authDomain: "ham-api.firebaseapp.com",
  projectId: "ham-api",
  storageBucket: "ham-api.appspot.com",
  messagingSenderId: "413646690844",
  appId: "1:413646690844:web:12fac0b10ad1ea545cddd9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import App from "./App";
import { getFirestore } from "firebase/firestore";

ReactDOM.render(<App />, document.getElementById("root"));
