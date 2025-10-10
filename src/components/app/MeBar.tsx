"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

interface UserDataProps {
  followers_number: number;
  avatar_ipfs_hash: string;
  role: string;
  user_id: string;
  display_name: string;
  username: string;
  following_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_list: [];
  mutual_followers_number: number;
}

export default function MeBar() {
  const [userData, setUserData] = useState<UserDataProps[]>([]);
  // console.log("this is out side try catch", userData);
  const fetchUserData = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/user/user-following", {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      if (!apiResponse) {
        console.error(apiResponse);
        return;
      }

      const response = await apiResponse.json();
      // console.log("This is response data", response)
      if (
        response.statusCode === 200 &&
        response.message === "OK"
      ) {
        setUserData(response.data);
        // console.log("this is inside try catch",response.data)
      }
    } catch (error) {
      console.error(error);
      console.log("Server fetch user data error");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="w-full h-full bg-[var(--background)] border-2 border-[var(--border-color)]">
      <Link
        href={"/app/channels/me/"}
        className="flex flex-row bg-red-500 w-full h-10 border-2 gap-2 "
      ></Link>
      {userData.length > 0 &&
        userData.map((user) => (
          <div key={user.user_id}>
            <Link
              href={`/app/channels/me/${user.user_id}`}
              className="flex flex-row w-full h-full border-2 gap-2 "
            >
              <div className="w-10 h-10">
                <Image
                  src={
                    userData
                      ? `http://35.247.142.76:8080/ipfs/${user.avatar_ipfs_hash}`
                      : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                  }
                  alt={"Avatar"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h1>{user.display_name}</h1>
                <p>@{user.username}</p>
              </div>
            </Link>
          </div>
        ))}
      {/* <div className="bg-red-500 w-100 h-100"></div> */}
    </div>
  );
}
