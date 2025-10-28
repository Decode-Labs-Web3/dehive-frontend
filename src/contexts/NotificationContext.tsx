import { createContext, useContext, useState } from "react";

export const NotificationContext = createContext<{
  notifications: boolean;
  addNotification: (message: string) => void;
}>
