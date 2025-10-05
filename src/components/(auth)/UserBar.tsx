"use client";

import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faGear,
  faMicrophoneSlash,
  faMicrophone,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function UserBar() {
  const [theme, setTheme] = useState(false);
  const [sound, setSound] = useState(false);
  const [microphone, setMicrophone] = useState(false);

  return (
    <div className="fixed rounded-xl bottom-0 m-4 left-0 z-10 bg-gray-800 p-2 w-70 h-30 border-white border-2">
      <div className="flex flex-col justify-end w-full h-full">
        {/* Button area */}
        <div className="flex flex-row gap-2 mb-2 justify-center w-full">
          <button
            onClick={() => setTheme((prev) => !prev)}
            className="bg-gray-500 p-1 w-full rounded-md"
          >
            <FontAwesomeIcon icon={theme ? faSun : faMoon} />
          </button>
          <button
            onClick={() => setMicrophone((prev) => !prev)}
            className="bg-gray-500 p-1 w-full rounded-md"
          >
            <FontAwesomeIcon icon={microphone ? faMicrophone : faMicrophoneSlash} />
          </button>
          <button
            onClick={() => setSound((prev) => !prev)}
            className="bg-gray-500 p-1 w-full rounded-md"
          >
            <FontAwesomeIcon icon={sound ? faVolumeHigh : faVolumeXmark} />
          </button>
          <button className="bg-gray-500 p-1 w-full rounded-md">
            <FontAwesomeIcon icon={faGear} className="hover:animate-spin" />
          </button>
        </div>

        {/* User Info Area */}
        <div className="flex gap-2">
          <div className="w-10 h-10">
            <Image
              src={
                "https://gateway.pinata.cloud/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
              }
              alt={"Avatar"}
              width={5}
              height={5}
              className="w-full h-full"
              unoptimized
            />
          </div>
          <div>
            <h3>Vũ Trần Quang Minh</h3>
            <h4>User</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
