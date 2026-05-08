"use client";

import { motion } from "motion/react";
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
      id: "solidifying",
      showBody: false,
      showButtons: false,
      primary: null,
      compactRecipient: true
    },
    {
      id: "awaitingSend",
      showBody: false,
      showButtons: true,
      primary: { label: "Send", variant: "primary", onClick: advance },
      compactRecipient: true
    },
    {
      id: "blurring",
      showBody: false,
      showButtons: false,
      primary: null,
      compactRecipient: true,
      hideRecipient: true,
      autoAdvanceMs: 1000
    },
    {
      id: "warning",
      showBody: false,
      showButtons: true,
      showMiddleSlot: true,
      primary: { label: "Confirm", variant: "warning", onClick: onSend },
      compactRecipient: true,
      hideRecipient: true
    }
  ];

  return (
    <ComposeShell
      recipientCandidates={recipientCandidates}
      phases={phases}
      onCancel={onCancel}
      renderBackground={({ phase, advance }) => {
        const visible = phase != null && phase.id !== "awaitingConfirm";
        const scaled =
          phase?.compactRecipient === true && phase?.id !== "solidifying";
        const blurred = phase?.id === "blurring" || phase?.id === "warning";
        return (
          <motion.div
            initial={false}
            animate={{
              opacity: visible && !blurred ? 1 : 0,
              scale: !blurred && scaled ? 0.8 : 1,
              y: scaled ? -40 : 0,
              filter: blurred ? "blur(10px)" : "blur(0px)"
            }}
            transition={{
              opacity: { duration: 0.4, delay: visible && !blurred ? 1 : 0 },
              scale: { duration: 0.4 },
              y: { duration: 0.4 },
              filter: { duration: 0.4 }
            }}
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "center"
            }}
          >
            <ImagineScene
              sceneAsset={sceneAsset}
              phaseId={phase?.id ?? "awaitingConfirm"}
              onAdvance={advance}
            />
          </motion.div>
        );
      }}
      middleSlot={
        <p style={{ margin: 0, textAlign: "center", opacity: 0.85 }}>
          {warningCopy}
        </p>
      }
    />
  );
}
