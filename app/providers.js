"use client";

import { SessionProvider } from "next-auth/react";
import N8nChatBot from "./N8nChatBot";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <N8nChatBot />
    </SessionProvider>
  );
}

