import { Leva } from "leva";

export function LevaPanel() {
  return (
    <div style={{ position: "fixed", bottom: 10, right: 10, width: 280, zIndex: 1000 }}>
      <Leva fill flat />
    </div>
  );
}
