"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useCallback, useRef, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface ChannelSearchBarProps {
  channelId: string;
  setMessageSearchId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChannelSearchBar({
  channelId,
  setMessageSearchId,
}: ChannelSearchBarProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchResult, setSerachResult] = useState<SearchResultProps[]>([]);
  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const fetchSearchList = useCallback(async () => {
    if (!keyword.trim()) return;
    if (page > 0 && isLastPage) return;
    try {
      const apiResponse = await fetch("/api/search/channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({
          channelId,
          keyword,
          page,
        }),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      });

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
        setSerachResult((prev) => {
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
  }, [channelId, isLastPage, page, keyword]);

  useEffect(() => {
    setPage(0);
    setIsLastPage(false);
    setSerachResult([]);

    if (!keyword.trim()) return;
    const id = setTimeout(() => {
      fetchSearchList();
    }, 1000);

    return () => clearTimeout(id);
  }, [keyword]);

  useEffect(() => {
    if (!keyword.trim()) return;
    if (page === 0) return;
    fetchSearchList();
  }, [page, keyword, fetchSearchList]);

  const searchRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);

  const handleScroll = () => {
    const element = searchRef.current;
    if (!element || isLastPage || loadingMore) return;
    if (element.scrollTop + element.clientHeight === element.scrollHeight) {
      prevScrollHeightRef.current = element.scrollHeight;
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page === 0) return;
    setLoadingMore(false);
    const element = searchRef.current;
    if (element) {
      element.scrollTop = prevScrollHeightRef.current - element.clientHeight;
      prevScrollHeightRef.current = element.scrollHeight;
    }
  }, [searchResult, page]);

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
              <Label htmlFor="channel-search" className="text-xs">
                Search: Page {page}
              </Label>
              <Input
                id="channel-search"
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
            {keyword.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Start typing to search messages
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
                {loadingMore && (
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
