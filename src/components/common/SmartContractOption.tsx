"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { faPlus, faMoneyCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SmartContractOptionProps {
  isRelayerMode: boolean;
  setIsRelayerMode: React.Dispatch<React.SetStateAction<boolean>>;
  onDeposit?: () => void;
}

export default function SmartContractOption({
  isRelayerMode,
  setIsRelayerMode,
  onDeposit,
}: SmartContractOptionProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="h-11 w-11 rounded-full">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex items-center space-x-2">
          <Switch
            id="relayer"
            checked={isRelayerMode}
            onCheckedChange={setIsRelayerMode}
          />
          <Label htmlFor="private">
            {isRelayerMode ? "Relayer ON" : "Relayer OFF"}
          </Label>
        </div>
        <Button onClick={() => onDeposit?.()}>
          <FontAwesomeIcon icon={faMoneyCheck} className="mr-2" />
          Deposit
        </Button>
      </PopoverContent>
    </Popover>
  );
}
