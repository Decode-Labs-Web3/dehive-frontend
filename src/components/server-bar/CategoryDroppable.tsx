"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface CategoryProps {
  _id: string;
  name: string;
  server_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  channels: ChannelProps[];
}

interface ChannelProps {
  _id: string;
  name: string;
  type: string;
  category_id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CategoryDroppableProps {
  category: CategoryProps;
  isOpen: boolean;
  children: React.ReactNode;
}

export default function CategoryDroppable({
  category,
  isOpen,
  children,
}: CategoryDroppableProps) {
  const { setNodeRef } = useDroppable({ id: category._id });

  if (!isOpen) return null;

  return <div ref={setNodeRef}>{children}</div>;
}
