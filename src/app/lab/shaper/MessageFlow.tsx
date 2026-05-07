import { MessageBody } from "./bodies/MessageBody";
import { ComposeShell, type ShellPhase } from "./ComposeShell";

export function MessageFlow({
  recipientCandidates,
  phrasingOptions,
  onCancel,
  onSend
}: {
  recipientCandidates: string[];
  phrasingOptions: string[];
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
      showBody: true,
      showButtons: false,
      primary: null,
      bodyFocused: true
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
      renderBody={(props) => (
        <MessageBody {...props} phrasingOptions={phrasingOptions} />
      )}
    />
  );
}
