export type StepId = "idle" | "intentPrelude" | "compose" | "sent";

export type FlowKind = "compose" | "imagine";

export type Flow = {
  id: string;
  label: string;
  kind: FlowKind;
  recipientCandidates: string[];
  steps: StepId[];
  phrasingOptions?: string[];
  sceneAsset?: string;
  warningCopy?: string;
};

export const FLOWS: Flow[] = [
  {
    id: "message-michael",
    label: "Message Michael",
    kind: "compose",
    recipientCandidates: ["Mom", "Mike M.", "Michael Lambert"],
    phrasingOptions: [
      "Wanna meet today for coffee?",
      "Wanna meet later today in Marylebone?",
      "Want to meet later today in Marylebone for coffee at special guests?",
      "Want to meet later today in Marylebone for coffee at special guests, 14:30?",
      "Want to meet later today in Marylebone for coffee at special guests at 15:00?"
    ],
    steps: ["idle", "intentPrelude", "compose", "sent"]
  },
  {
    id: "imagine-michael",
    label: "Imagine to Michael",
    kind: "imagine",
    recipientCandidates: ["Mom", "Mike M.", "Michael Lambert"],
    sceneAsset: "/lab/point-cloud/Bonsai Tree.sog",
    warningCopy: "Michael's capacity is low — send anyway?",
    steps: ["idle", "intentPrelude", "compose", "sent"]
  }
];

export const FLOW_BY_ID = Object.fromEntries(
  FLOWS.map((f) => [f.id, f])
) as Record<string, Flow>;
