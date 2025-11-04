"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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
  const [error, setError] = useState<string | null>(null);
  const { channelId } = useParams<{
    channelId: string;
  }>();
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    setCountPage(0);
    setIsLastPage(false);
    setSerachResult([]);
    if (event.target.value.trim().length > 0) {
      fetchSearchList(event.target.value);
    }
  };

  const fetchSearchList = useCallback(
    async (keywordSearch: string) => {
      if (isLastPage) return;
      try {
        setError(null);
        setSearchLoading(true);
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
          setError("Failed to search messages");
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
        setError("Server error while searching");
      } finally {
        setSearchLoading(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[500px] p-0" sideOffset={8}>
        <div className="flex flex-col h-[600px]">
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="space-y-1">
              <Label htmlFor="direct-search" className="text-xs">
                Search
              </Label>
              <Input
                id="direct-search"
                placeholder="Type a keyword to search..."
                value={keyword}
                onChange={handleKeywordChange}
                className="h-8"
              />
            </div>
          </div>

          <ScrollArea
            className="flex-1"
            ref={searchRef}
            onScrollViewport={handleScroll}
          >
            {keyword.trim().length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Start typing to search messages
              </div>
            ) : searchLoading && searchResult.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchSearchList(keyword)}
                >
                  Retry
                </Button>
              </div>
            ) : searchResult.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="w-8 h-8 text-muted-foreground"
                  />
                </div>
                <p className="font-semibold mb-2">No results found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different keyword
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {searchResult.map((result) => (
                  <button
                    key={result._id}
                    className="text-left px-4 py-3 hover:bg-muted border-b border-border"
                    onClick={() => {
                      setMessageSearchId(result._id);
                      setOpen(false);
                    }}
                  >
                    <div className="text-sm line-clamp-2">{result.content}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(result.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))}
                {searchLoading && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Loading more...
                  </div>
                )}
              </div>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
