"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Wallet from "@/components/common/Wallet";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  faMoneyBillTransfer,
  faArrowRightArrowLeft,
  faRightLeft,
  faArrowsRotate,
  faHandHoldingDollar,
  faMoneyCheckDollar,
  faWallet,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

export default function MoneyTransfer() {
  const { isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  if (!isConnected) {
    return <Wallet />;
  }
  return (
    <>
      <Button asChild onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon icon={faMoneyBillTransfer} />
        Transfer Monney
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBillTransfer} />
              Transfer Money
            </DialogTitle>
          </DialogHeader>
          {/* Content */}
        </DialogContent>
      </Dialog>
    </>
  );
}
