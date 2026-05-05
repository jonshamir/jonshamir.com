type Variant = "primary" | "secondary";

export function ActionButton({
  label,
  onClick,
  variant = "primary"
}: {
  label: string;
  onClick: () => void;
  variant?: Variant;
}) {
  return (
    <button data-variant={variant} onClick={onClick}>
      {label}
    </button>
  );
}
