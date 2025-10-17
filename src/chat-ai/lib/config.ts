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

export const getThemeConfig = (theme: ColorScheme): ThemeOption => {
  const tokens = getDesignTokensFromCss();
  return {
    color: {
      grayscale: {
        hue: 220,
        tint: 6,
        shade: theme === "dark" ? -1 : -4,
      },
      accent: {
        primary: tokens.primary ?? (theme === "dark" ? "#f1f5f9" : "#0f172a"),
        level: 1,
      },
    },
    radius: "round",
    colorScheme: theme,
    density: "normal",
    typography: {
      baseSize: 15,
    },
  };
};

function getDesignTokensFromCss(): { primary: string | null; background: string | null; foreground: string | null } {
  try {
    if (typeof window === "undefined") return { primary: null, background: null, foreground: null };
    const style = getComputedStyle(document.documentElement);
    const primary = normalizeCssColor(style.getPropertyValue("--primary"));
    const background = normalizeCssColor(style.getPropertyValue("--background"));
    const foreground = normalizeCssColor(style.getPropertyValue("--foreground"));
    return { primary, background, foreground };
  } catch {
    return { primary: null, background: null, foreground: null };
  }
}

function normalizeCssColor(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("#")) return raw;
  if (raw.startsWith("hsl")) {
    const hex = hslStringToHex(raw);
    return hex ?? raw;
  }
  if (raw.startsWith("rgb")) {
    const hex = rgbStringToHex(raw);
    return hex ?? raw;
  }
  return raw;
}

function hslStringToHex(input: string): string | null {
  // Supports CSS Color Level 4 space-separated hsl: hsl(H S% L% / A?) and comma form
  const re = /hsl\(\s*([\d.]+)\s*(?:,\s*|\s+)\s*([\d.]+)%\s*(?:,\s*|\s+)\s*([\d.]+)%/i;
  const m = input.match(re);
  if (!m) return null;
  const h = Number(m[1]);
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m0 = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const to255 = (n: number) => Math.round((n + m0) * 255);
  return rgbToHex(to255(r), to255(g), to255(b));
}

function rgbStringToHex(input: string): string | null {
  // Supports rgb(R G B) or rgb(R, G, B)
  const re = /rgb\(\s*(\d{1,3})\s*(?:,\s*|\s+)\s*(\d{1,3})\s*(?:,\s*|\s+)\s*(\d{1,3})/i;
  const m = input.match(re);
  if (!m) return null;
  const r = Math.max(0, Math.min(255, Number(m[1])));
  const g = Math.max(0, Math.min(255, Number(m[2])));
  const b = Math.max(0, Math.min(255, Number(m[3])));
  return rgbToHex(r, g, b);
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


