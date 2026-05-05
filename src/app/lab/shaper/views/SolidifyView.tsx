import { ActionButton } from "../ActionButton";

export function SolidifyView({
  options,
  selectedIndex,
  onSelect,
  onCancel,
  onConfirm
}: {
  options: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div>
      <p>Choose phrasing</p>
      <ul>
        {options.map((opt, i) => (
          <li key={i}>
            <button
              data-selected={i === selectedIndex}
              onClick={() => onSelect(i)}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      <ActionButton label="Cancel" variant="secondary" onClick={onCancel} />
      <ActionButton label="Next" variant="primary" onClick={onConfirm} />
    </div>
  );
}
