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
    recipientCandidates: ["Mom", "Mike M.", "Michael Lambert"],
    phrasingOptions: [
      "Wanna meet today for coffee?",
      "Wanna meet later today in Marylebone?",
      "Want to meet later today in Marylebone for coffee at special guests?",
      "Wanna meet later today in Marylebone?",
      "Want to meet later today in Marylebone for coffee at special guests, 14:30?",
      "Wanna meet later today in Marylebone?",
      "Want to meet later today in Marylebone for coffee at special guests, 15:00?"
    ],
    steps: ["idle", "intentPrelude", "compose", "sent"]
  }
];

export const FLOW_BY_ID = Object.fromEntries(
  FLOWS.map((f) => [f.id, f])
) as Record<string, Flow>;
