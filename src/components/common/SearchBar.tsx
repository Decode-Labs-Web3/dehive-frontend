"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchResultProps {
  _id: string;
  conversationId: string;
  sender: SenderProps;
  content: string;
  attachments: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  score: number;
}

interface SenderProps {
  dehive_id: string;
  username: string;
  display_name: string;
  avatar_ipfs_hash: string;
}

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const { channelId } = useParams<{
    channelId: string;
  }>();
  const [searchResult, setSerachResult] = useState<SearchResultProps[]>([]);
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    setTimeout(fetchSearchList, 1000);
  };

  const fetchSearchList = useCallback(async () => {
    try {
      const apiResponse = await fetch("/api/search/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ channelId, keyword }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

      console.log("this is chanelid from search", apiResponse);

      if (!apiResponse.ok) {
        console.group();
        console.error(apiResponse);
        console.log("api response error");
        console.groupEnd();
        return;
      }
      const response = await apiResponse.json();
      if (
        response.statusCode === 200 &&
        response.message === "Search completed successfully"
      ) {
        console.log(response.data.items);
        setSerachResult(response.data.items);
      }
    } catch (error) {
      console.group();
      console.error(error);
      console.log("server search message error");
      console.groupEnd();
    }
  }, [channelId, keyword]);
  return (
    <>
      <Label htmlFor="keyword">Search keyword here</Label>
      <Input
        id="keyword"
        name="keyword"
        value={keyword}
        onChange={handleKeywordChange}
      />
      {searchResult.map((result) => {
        <div key={result._id}>
          <h1 className="bg-red-500">{result.content}</h1>
        </div>;
      })}
      <h1>Minh</h1>
    </>
  );
}
