import type { ColorScheme, StartScreenPrompt, ThemeOption } from "@openai/chatkit";
import {
  WORKFLOW_LIBRARY,
  findWorkflowByIdOrSlug,
  type WorkflowDefinition,
  type WorkflowPrompt,
} from "./map.wf";

export const WORKFLOW_ID =
  (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env?.VITE_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "What can you do?",
    prompt: "What can you do?",
    icon: "circle-question",
  },
];

export const PLACEHOLDER_INPUT = "Ask anything...";

export const GREETING = "How can I help you today?";

export const WORKFLOWS: WorkflowDefinition[] = WORKFLOW_LIBRARY;

export function getPromptsForWorkflow(workflowId: string | undefined): StartScreenPrompt[] {
  const wf = findWorkflowByIdOrSlug(workflowId);
  if (wf && wf.prompts?.length) return wf.prompts.map(mapWorkflowPromptToStartPrompt);
  return STARTER_PROMPTS;
}

function mapWorkflowPromptToStartPrompt(p: WorkflowPrompt): StartScreenPrompt {
  return {
    label: p.label,
    prompt: p.prompt,
    // The ChatKit StartScreenPrompt type restricts icons; if an unsupported name
    // is provided in the workflow map, we fall back to a safe default icon.
    icon: (p.icon as StartScreenPrompt["icon"]) ?? "circle-question",
  };
}

export function resolveWorkflowId(input: string | null | undefined): string {
  const wf = findWorkflowByIdOrSlug(input);
  if (wf?.wf_id) return wf.wf_id;
  return (input ?? "").trim();
}

export const getThemeConfig = (theme: ColorScheme): ThemeOption => ({
  color: {
    grayscale: {
      hue: 220,
      tint: 6,
      shade: theme === "dark" ? -1 : -4,
    },
    accent: {
      primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
      level: 1,
    },
  },
  radius: "round",
  colorScheme: theme,
  density: "normal",
  typography: {
    baseSize: 15,
  },
});


