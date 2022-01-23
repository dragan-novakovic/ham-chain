import React from "react";

export default function useAuth(data?: any) {
  if (data) {
    window.localStorage.setItem("acc", JSON.stringify(data));
    return [true, data];
  }

  if (window.localStorage.getItem("acc")) {
    //ts wierd
    const cache: string = window.localStorage.getItem("acc") || "";
    return [true, JSON.parse(cache)];
  }

  return [false];
}
