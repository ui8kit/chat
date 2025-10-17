export type WorkflowDefinition = {
  name: string;
  wf_id: string;
  prompts: WorkflowPrompt[];
};

export type WorkflowPrompt = {
  label: string;
  prompt: string;
  icon?: string; // free-form icon name; mapping may ignore/adjust for UI type safety
};

// Helper to build prompts with minimal boilerplate
const p = (label: string, icon: string = "circle-question"): WorkflowPrompt => ({
  label,
  prompt: label,
  icon,
});

export const WORKFLOW_LIBRARY: WorkflowDefinition[] = [
  {
    name: "Hello Agent",
    wf_id: (import.meta as unknown as { env?: Record<string, string | undefined> })
      .env?.VITE_CHATKIT_WORKFLOW_ID?.trim() ?? "",
    prompts: [
      {
        label: "What can you do?",
        prompt: "What can you do?",
        icon: "circle-question",
      },
    ],
  },
  {
    name: "Content Manager",
    wf_id: "wf_68ea5c2540d48190858e868cf48a050201e47c9c2f133b23",
    prompts: [
      p("Where should we start writing the article?", "write"),
      p("How to conduct SEO research?", "search"),
      p("In what format and style should the illustration be created?", "images"),
    ],
  },
  {
    name: "Copywriter AI",
    wf_id: "wf_68ef76b4b0f48190a249d1b33295d265079411bb63e6b239",
    prompts: [
      p("How to create a content plan for a blog post?", "write"),
    ],
  }
  // 
];

export function slugifyWorkflowName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function findWorkflowByIdOrSlug(value: string | null | undefined) {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  const byId = WORKFLOW_LIBRARY.find((w) => w.wf_id === v);
  if (byId) return byId;
  const byName = WORKFLOW_LIBRARY.find(
    (w) => slugifyWorkflowName(w.name) === slugifyWorkflowName(v)
  );
  if (byName) return byName;
  const byNameExact = WORKFLOW_LIBRARY.find(
    (w) => w.name.toLowerCase() === v.toLowerCase()
  );
  return byNameExact;
}


