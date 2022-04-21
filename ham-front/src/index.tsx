//@ts-nocheck
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { SubstrateContextProvider } from "./substrate-lib/SubstrateContext.tsx";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuu4gScKO2bLk7J6ykahZEUxPKmoNFCNw",
  authDomain: "ham-api.firebaseapp.com",
  projectId: "ham-api",
  storageBucket: "ham-api.appspot.com",
  messagingSenderId: "413646690844",
  appId: "1:413646690844:web:12fac0b10ad1ea545cddd9",
};

const Core = () => {
  return (
    <SubstrateContextProvider>
      <App />
    </SubstrateContextProvider>
  );
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

ReactDOM.render(<Core />, document.getElementById("root"));
