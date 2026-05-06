export type StepId = "idle" | "intent" | "solidify" | "preview" | "sent";

export type Flow = {
  id: string;
  label: string;
  recipient: string;
  intentPrompt: string;
  phrasingOptions: string[];
  steps: StepId[];
};

export const FLOWS: Flow[] = [
  {
    id: "message-michael",
    label: "Message Michael",
    recipient: "Michael",
    intentPrompt: "Send a message to Michael?",
    phrasingOptions: [
      "I might be late",
      "I'm running late",
      "I'll arrive 5 minutes late",
      "I might not make it at all",
      "I might not make it on time"
    ],
    steps: ["idle", "intent", "solidify", "preview", "sent"]
  }
];

export const FLOW_BY_ID = Object.fromEntries(
  FLOWS.map((f) => [f.id, f])
) as Record<string, Flow>;
