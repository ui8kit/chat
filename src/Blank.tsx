import { Block } from "@ui8kit/core";
import { useState, useCallback } from "react";
import type { ColorScheme } from "@openai/chatkit";
import { ChatKitPanel } from "@/chat-ai/components/ChatKitPanel";

export function Blank() {
  const [scheme, setScheme] = useState<ColorScheme>("dark");
  const selectedWorkflowId = "wf_68ea5c2540d48190858e868cf48a050201e47c9c2f133b23";

  const handleWidgetAction = useCallback(async () => {
    // Minimal no-op persistence
  }, []);

  const handleResponseEnd = useCallback(() => {
    // Minimal no-op hook
  }, []);

  return (
    <Block w="full" component="section">
      <ChatKitPanel
        theme={scheme}
        onWidgetAction={handleWidgetAction}
        onResponseEnd={handleResponseEnd}
        onThemeRequest={setScheme}
        workflowId={selectedWorkflowId}
      />
    </Block>
  );
}
