import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "torph/react";

import { ActionButton } from "../ActionButton";

const ENTER_SETTLE_MS = 400;
const OPTION_INTERVAL_MS = 1800;
const REVEAL_DELAY_MS = 600;

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
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ENTER_SETTLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!settled) return;
    if (index >= options.length - 1) {
      const t = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const next = index + 1;
      setIndex(next);
      onSelect(next);
    }, OPTION_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, options.length, onSelect, settled]);

  const current = options[index] ?? "";
  void selectedIndex;

  return (
    <>
      {settled ? (
        <TextMorph style={{ willChange: "transform" }}>{current}</TextMorph>
      ) : (
        <p>{current}</p>
      )}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
          >
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={onCancel}
            />
            <ActionButton label="Next" variant="primary" onClick={onConfirm} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
