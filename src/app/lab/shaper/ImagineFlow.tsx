"use client";

import dynamic from "next/dynamic";

import { ComposeShell, type ShellPhase } from "./ComposeShell";

const ImagineScene = dynamic(() => import("./bodies/ImagineScene"), {
  ssr: false
});

export function ImagineFlow({
  recipientCandidates,
  sceneAsset,
  warningCopy,
  onCancel,
  onSend
}: {
  recipientCandidates: string[];
  sceneAsset: string;
  warningCopy: string;
  onCancel: () => void;
  onSend: () => void;
}) {
  const phases = (advance: () => void): ShellPhase[] => [
    {
      id: "awaitingConfirm",
      showBody: false,
      showButtons: true,
      primary: { label: "Confirm", variant: "primary", onClick: advance }
    },
    {
      id: "active",
      showBody: false,
      showButtons: false,
      primary: null
    },
    {
      id: "warning",
      showBody: false,
      showButtons: true,
      showMiddleSlot: true,
      primary: { label: "Confirm", variant: "warning", onClick: advance }
    },
    {
      id: "awaitingSend",
      showBody: false,
      showButtons: true,
      primary: { label: "Send", variant: "primary", onClick: onSend }
    }
  ];

  return (
    <ComposeShell
      recipientCandidates={recipientCandidates}
      phases={phases}
      onCancel={onCancel}
      renderBackground={({ phase, advance }) => (
        <ImagineScene
          sceneAsset={sceneAsset}
          phaseId={phase?.id ?? "awaitingConfirm"}
          onAdvance={advance}
        />
      )}
      middleSlot={
        <p style={{ margin: 0, textAlign: "center", opacity: 0.85 }}>
          {warningCopy}
        </p>
      }
    />
  );
}
