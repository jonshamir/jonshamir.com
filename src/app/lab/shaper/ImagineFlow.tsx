export function ImagineFlow({
  onCancel
}: {
  recipientCandidates: string[];
  sceneAsset: string;
  warningCopy: string;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <p>Imagine flow stub</p>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
