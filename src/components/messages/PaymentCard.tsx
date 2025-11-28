"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentData {
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  token_address: string;
  message: string;
}

interface PaymentCardProps {
  cid: string;
}

export default function PaymentCard({ cid }: PaymentCardProps) {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL_GET;
        if (!gateway) throw new Error("IPFS gateway not configured");
        const res = await fetch(`${gateway}/${cid}`);
        if (!res.ok) throw new Error("Failed to fetch payment data");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || "Error loading payment");
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [cid]);

  if (loading) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="max-w-md border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || "Invalid payment data"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faMoneyBillTransfer} />
          Payment Received
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">From:</span>{" "}
          <Badge variant="outline">
            {data.sender.slice(0, 6)}…{data.sender.slice(-4)}
          </Badge>
        </div>
        <div>
          <span className="font-medium">To:</span>{" "}
          <Badge variant="outline">
            {data.recipient.slice(0, 6)}…{data.recipient.slice(-4)}
          </Badge>
        </div>
        <div>
          <span className="font-medium">Amount:</span> {data.amount}{" "}
          {data.token}
        </div>
        <div>
          <span className="font-medium">Token:</span> {data.token} (
          {data.token_address.slice(0, 6)}…{data.token_address.slice(-4)})
        </div>
        {data.message && (
          <div>
            <span className="font-medium">Message:</span> {data.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
