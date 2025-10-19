"use client";

import { useParams } from "next/navigation";

export default function CallPage() {
  const { userId } = useParams();
  return <h1>{userId} call page</h1>;
}
