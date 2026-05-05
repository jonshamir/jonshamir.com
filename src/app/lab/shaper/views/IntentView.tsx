import { ActionButton } from "../ActionButton";

export function IntentView({
  prompt,
  onCancel,
  onConfirm
}: {
  prompt: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div>
      <p>{prompt}</p>
      <ActionButton label="Cancel" variant="secondary" onClick={onCancel} />
      <ActionButton label="Okay" variant="primary" onClick={onConfirm} />
    </div>
  );
}
