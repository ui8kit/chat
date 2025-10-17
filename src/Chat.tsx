import { Block, useTheme } from "@ui8kit/core";
import { useCallback, useEffect } from "react";
import type { ColorScheme } from "@openai/chatkit";
import { ChatKitPanel } from "@/chat-ai/components/ChatKitPanel";

export function Chat() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const scheme: ColorScheme = isDarkMode ? "dark" : "light";
  const selectedWorkflowId = "wf_68ea5c2540d48190858e868cf48a050201e47c9c2f133b23";

  const handleWidgetAction = useCallback(async () => {
    // Minimal no-op persistence
  }, []);

  const handleResponseEnd = useCallback(() => {
    // Minimal no-op hook
  }, []);

  // Keep global CSS variables in sync by toggling .dark on <html>
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", isDarkMode);
    } catch {}
  }, [isDarkMode]);

  const handleThemeRequest = useCallback((requested: ColorScheme) => {
    // Flip app theme only if different
    if (requested === "dark" && !isDarkMode) {
      toggleDarkMode();
    } else if (requested === "light" && isDarkMode) {
      toggleDarkMode();
    }
  }, [isDarkMode, toggleDarkMode]);

  return (
    <Block w="full" component="section">
      <ChatKitPanel
        theme={scheme}
        onWidgetAction={handleWidgetAction}
        onResponseEnd={handleResponseEnd}
        onThemeRequest={handleThemeRequest}
        workflowId={selectedWorkflowId}
      />
    </Block>
  );
}
