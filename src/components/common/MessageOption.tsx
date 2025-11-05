"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCamera, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MessageOption() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="h-11 w-11 rounded-full">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex flex-col items-center space-x-2">
          <Button>
            <FontAwesomeIcon icon={faUpload} className="mr-2" />
            Upload file
          </Button>

          <Button>
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Take a photo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
