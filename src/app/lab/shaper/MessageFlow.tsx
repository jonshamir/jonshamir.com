import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "torph/react";

import { ActionButton } from "./ActionButton";
import styles from "./page.module.css";

const ENTER_SETTLE_MS = 400;
const OPTION_INTERVAL_MS = 1800;
const REVEAL_DELAY_MS = 600;
const MESSAGE_EXPAND_MS = 0.3;
const MESSAGE_TEXT_DELAY = 0.35;

const BUTTON_ROW_MIN_HEIGHT = 56;
const MESSAGE_TOP_GAP = 16;

type Sub = "recipient" | "cyclingMessage" | "awaitingSend";

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
  const [sub, setSub] = useState<Sub>("recipient");
  const [recipientIdx, setRecipientIdx] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ENTER_SETTLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!settled || sub !== "recipient") return;
    if (recipientIdx >= recipientCandidates.length - 1) return;
    const t = setTimeout(
      () => setRecipientIdx((i) => i + 1),
      OPTION_INTERVAL_MS
    );
    return () => clearTimeout(t);
  }, [settled, sub, recipientIdx, recipientCandidates.length]);

  useEffect(() => {
    if (sub !== "cyclingMessage") return;
    if (messageIdx >= phrasingOptions.length - 1) {
      const t = setTimeout(() => setSub("awaitingSend"), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setMessageIdx((i) => i + 1), OPTION_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [sub, messageIdx, phrasingOptions.length]);

  const recipientText = `Message ${recipientCandidates[recipientIdx]}`;
  const showMessage = sub === "cyclingMessage" || sub === "awaitingSend";
  const showButtons = sub === "recipient" || sub === "awaitingSend";
  const buttonsKey = sub === "recipient" ? "confirm" : "send";

  return (
    <motion.div
      layout
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <motion.div layout="position">
        {!settled ? (
          <p style={{ margin: 0 }}>{recipientText}</p>
        ) : (
          <TextMorph style={{ willChange: "transform" }}>
            {recipientText}
          </TextMorph>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {showMessage && (
          <motion.div
            layout
            key="message"
            className={styles.messageText}
            initial={{
              height: 0,
              marginTop: 0,
              opacity: 0,
              filter: "blur(10px)"
            }}
            animate={{
              height: "auto",
              marginTop: MESSAGE_TOP_GAP,
              opacity: 1,
              filter: "blur(0px)"
            }}
            exit={{
              height: 0,
              marginTop: 0,
              opacity: 0,
              filter: "blur(10px)"
            }}
            transition={{
              height: { duration: MESSAGE_EXPAND_MS },
              marginTop: { duration: MESSAGE_EXPAND_MS },
              opacity: { duration: 0.25, delay: MESSAGE_TEXT_DELAY },
              filter: { duration: 0.25, delay: MESSAGE_TEXT_DELAY }
            }}
            style={{ overflow: "hidden" }}
          >
            <TextMorph style={{ willChange: "transform" }}>
              {phrasingOptions[messageIdx]}
            </TextMorph>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          minHeight: BUTTON_ROW_MIN_HEIGHT,
          marginTop: MESSAGE_TOP_GAP,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {showButtons && (
            <motion.div
              key={buttonsKey}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.2 }}
            >
              <ActionButton
                label="Cancel"
                variant="secondary"
                onClick={onCancel}
              />
              <ActionButton
                label={buttonsKey === "confirm" ? "Confirm" : "Send"}
                variant="primary"
                onClick={
                  buttonsKey === "confirm"
                    ? () => setSub("cyclingMessage")
                    : onSend
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
