export type StepId = "idle" | "intentPrelude" | "compose" | "sent";

export type Flow = {
  id: string;
  label: string;
  recipientCandidates: string[];
  phrasingOptions: string[];
  steps: StepId[];
};

export const FLOWS: Flow[] = [
  {
    id: "message-michael",
    label: "Message Michael",
    recipientCandidates: ["Michelle Smith", "Michael Lambert"],
    phrasingOptions: [
      "I might be late",
      "I'm running late",
      "I'll arrive 5 minutes late",
      "I might not make it at all",
      "I might not make it on time"
    ],
    steps: ["idle", "intentPrelude", "compose", "sent"]
  }
];

export const FLOW_BY_ID = Object.fromEntries(
  FLOWS.map((f) => [f.id, f])
) as Record<string, Flow>;
