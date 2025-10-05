"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import ServerBarItem from "../ServerBaritem/index"

export default function ServerBar() {
  const [active, setActive] = useState<number | "dm">("dm");



  return (
    <aside className="fix flex flex-col gap-2 left-0 top-0 p-3 w-16 h-screen border-white border-r-1 bg-gray-800">
      <div className="relative w-10 h-10 bg-green-500 rounded-xl">
        <span
          className={`absolute -left-3 top-1/2 -translate-y-1/2 rounded-r-full w-1 bg-white ${
            active === "dm" ? "h-8" : "h-4"
          }`}
        />
        <button onClick={() => setActive("dm")} className={`w-full h-full`}>
          <FontAwesomeIcon icon={faMessage}/>
        </button>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="relative w-10 h-10 bg-pink-500 rounded-xl">
          <span
            className={`absolute top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white -left-3 ${
              active === i ? "h-8" : "h-4"
            }`}
          />
          <button onClick={() => setActive(i)} className="w-full h-full ">
            {i}
          </button>
        </div>
      ))}

      <ServerBarItem.AddServer />
    </aside>
  );
}
