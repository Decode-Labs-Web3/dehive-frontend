"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { CategoryProps } from "@/interfaces/server.interface";

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
