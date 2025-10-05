"use client";

import Image from "next/image";

export default function UserBar() {
  return (
    <div className="fixed rounded-xl bottom-0 m-4 left-0 z-10 bg-gray-800 p-2 w-70 h-30 border-white border-2">
      <div className="flex flex-col justify-end w-full h-full">
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
