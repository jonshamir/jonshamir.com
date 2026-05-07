import { ImagineBody } from "./bodies/ImagineBody";
import { ComposeShell, type ShellPhase } from "./ComposeShell";

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
      showBody: true,
      showButtons: true,
      primary: { label: "Confirm", variant: "primary", onClick: advance }
    },
    {
      id: "active",
      showBody: true,
      showButtons: false,
      primary: null,
      bodyFocused: true
    },
    {
      id: "warning",
      showBody: true,
      showButtons: true,
      showMiddleSlot: true,
      primary: { label: "Confirm", variant: "warning", onClick: advance }
    },
    {
      id: "awaitingSend",
      showBody: true,
      showButtons: true,
      primary: { label: "Send", variant: "primary", onClick: onSend }
    }
  ];

  return (
    <ComposeShell
      recipientCandidates={recipientCandidates}
      phases={phases}
      onCancel={onCancel}
      renderBody={(props) => <ImagineBody {...props} sceneAsset={sceneAsset} />}
      middleSlot={
        <p style={{ margin: 0, textAlign: "center", opacity: 0.85 }}>
          {warningCopy}
        </p>
      }
    />
  );
}
