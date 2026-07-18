"use client";

import { useEffect } from "react";

export default function N8nChatBot() {
  useEffect(() => {
    if (window.__n8nChatLoaded) return;

    async function loadChat() {
      let user = {
      
        customerName: "Guest",
        customerEmail: "",
       
      };

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (data?.user) {
            user = {
              
              customerName: data.user.name || data.user.email || "Guest",
              customerEmail: data.user.email || "",
             
            };
          }
        }
      } catch (error) {
        console.error("Failed to get logged-in user:", error);
      }

      console.log("N8N CHAT USER:", user);

      window.__n8nChatLoaded = true;

      if (!document.querySelector('link[data-n8n-chat-css="true"]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";
        css.setAttribute("data-n8n-chat-css", "true");
        document.head.appendChild(css);
      }

      const script = document.createElement("script");
      script.type = "module";
      script.setAttribute("data-n8n-chat-script", "true");

      const metadata = JSON.stringify(user);
      const initialMessages = JSON.stringify([
        `Hi ${user.customerName}`,
        "Welcome to TawBayin POS Assistant",
      ]);

      script.textContent = `
        import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

        createChat({
          webhookUrl: "https://unmagnified-wonda-nonfugitively.ngrok-free.dev/webhook/badminton-pos-chat/chat",
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
  }, []);

  return <div id="n8n-chat" />;
}