import { ActionButton } from "../ActionButton";

export function PreviewView({
  recipient,
  message,
  onCancel,
  onSend
}: {
  recipient: string;
  message: string;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <div>
      <p>To {recipient}</p>
      <p>{message}</p>
      <ActionButton label="Cancel" variant="secondary" onClick={onCancel} />
      <ActionButton label="Send" variant="primary" onClick={onSend} />
    </div>
  );
}
