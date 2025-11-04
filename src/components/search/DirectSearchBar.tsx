"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface DirectSearchBarProps {
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function DirectSearchBar({
  setMessageSearchId,
}: DirectSearchBarProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [countPage, setCountPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSerachResult] = useState<SearchResultProps[]>([]);
  const { channelId } = useParams<{
    channelId: string;
  }>();
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    setCountPage(0);
    fetchSearchList(event.target.value);
  };

  const fetchSearchList = useCallback(
    async (keywordSearch: string) => {
      if (isLastPage) return;
      try {
        const apiResponse = await fetch("/api/search/direct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Frontend-Internal-Request": "true",
          },
          body: JSON.stringify({
            channelId,
            keyword: keywordSearch,
            countPage,
          }),
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
          // console.log(response.data.items);
          setSerachResult((prev) => {
            if (countPage === 0) {
              return response.data.items;
            }
            return [...prev, ...response.data.items];
          });
          setOpen(true);
          setIsLastPage(response.data.metadata.is_last_page);
        }
      } catch (error) {
        console.group();
        console.error(error);
        console.log("server search message error");
        console.groupEnd();
      }
    },
    [channelId, isLastPage, countPage]
  );

  const searchRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);

  const handleScroll = () => {
    const element = searchRef.current;
    if (!element || isLastPage || searchLoading) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      setSearchLoading(true);
      setCountPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setSearchLoading(false);
    const element = searchRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current;
    }
  }, [searchResult]);

  return (
    <>
      <Label htmlFor="keyword">Search keyword here</Label>
      <Input
        id="keyword"
        name="keyword"
        value={keyword}
        onChange={handleKeywordChange}
      />
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Result</DialogTitle>
          </DialogHeader>
          <ScrollArea ref={searchRef} onScrollViewport={handleScroll}>
            <div className="flex flex-col">
              {searchResult.map((result) => (
                <button
                  key={result._id}
                  onClick={() => {
                    setMessageSearchId(result._id);
                    setOpen(false);
                  }}
                >
                  <h1 className="bg-red-500">{result.content}</h1>
                </button>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
