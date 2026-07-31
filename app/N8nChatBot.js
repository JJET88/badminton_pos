"use client";

import { useEffect } from "react";
import useAuthStore from "@/app/store/useAuthStore";

export default function N8nChatBot() {
  const storeUser = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    let active = true;

    async function loadChat() {
      let user = {
        customerName: "Guest",
        customerEmail: "",
      };

      if (storeUser) {
        user = {
          customerName: storeUser.name || storeUser.email || "Guest",
          customerEmail: storeUser.email || "",
        };
      } else {
        try {
          const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
          });

          if (res.ok && active) {
            const data = await res.json();

            if (data?.user) {
              user = {
                customerName: data.user.name || data.user.email || "Guest",
                customerEmail: data.user.email || "",
              };
              // Sync user to Zustand store
              fetchUser();
            }
          }
        } catch (error) {
          console.error("Failed to get logged-in user:", error);
        }
      }

      if (!active) return;

      console.log("N8N CHAT USER:", user);

      // Load stylesheet if not already present
      if (!document.querySelector('link[data-n8n-chat-css="true"]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";
        css.setAttribute("data-n8n-chat-css", "true");
        document.head.appendChild(css);
      }

      const container = document.getElementById("n8n-chat");
      if (!container) return;

      // Clean container first to ensure fresh mount and prevent duplicates
      container.innerHTML = "";

      // Remove existing script tag if any
      const existingScript = document.querySelector('script[data-n8n-chat-script="true"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.type = "module";
      script.setAttribute("data-n8n-chat-script", "true");

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://unmagnified-wonda-nonfugitively.ngrok-free.dev/webhook/badminton-pos-chat/chat";
      const metadata = JSON.stringify(user);
      const initialMessages = JSON.stringify([
        `Hi ${user.customerName}`,
        "Welcome to TawBayin POS Assistant",
      ]);

      script.textContent = `
        import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

        createChat({
          webhookUrl: "${webhookUrl}",
          webhookConfig: {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"
            }
          },
          mode: "window",
          target: "#n8n-chat",
          chatInputKey: "chatInput",
          chatSessionKey: "sessionId",
          loadPreviousSession: false,
          showWelcomeScreen: false,

          metadata: ${metadata},

          initialMessages: ${initialMessages},

          i18n: {
            en: {
              title: "TawBayin POS Assistant",
              subtitle: "Ask me about products, sales, and inventory.",
              footer: "",
              getStarted: "New Chat",
              inputPlaceholder: "Type your question..."
            }
          }
        });
      `;

      document.body.appendChild(script);
    }

    loadChat();

    return () => {
      active = false;
      const existingScript = document.querySelector('script[data-n8n-chat-script="true"]');
      if (existingScript) {
        existingScript.remove();
      }
      const container = document.getElementById("n8n-chat");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [storeUser?.email, storeUser?.name, fetchUser]);

  return <div id="n8n-chat" />;
}