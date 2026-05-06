import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

import { ActionButton } from "./ActionButton";
import styles from "./page.module.css";

const ENTER_SETTLE_MS = 400;
const OPTION_INTERVAL_MS = 1800;
const REVEAL_DELAY_MS = 600;
const MESSAGE_EXPAND_MS = 0.3;
const CONFIRM_HOLD = 1;
const MESSAGE_TEXT_DELAY = CONFIRM_HOLD + 0.35;

const VIEWPORT_H = 470;
const BUTTONS_H = 56;
const GROUP_GAP = 16;
const MESSAGE_BUTTONS_GAP = 32;
const LAYOUT_DURATION = 0.4;
const LAYOUT_EASE = [0.25, 0.46, 0.45, 0.94] as const;

const RECIPIENT_FALLBACK_H = 24;
const MESSAGE_FALLBACK_H = 40;

type Sub = "recipient" | "awaitingConfirm" | "cyclingMessage" | "awaitingSend";
type Key = "recipient" | "message" | "buttons";

function useMeasuredHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setH(entry.contentRect.height);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  return [ref, h] as const;
}

function computeTargets(
  items: Array<{ key: Key; h: number; gapAfter?: number }>
) {
  const totalGaps = items
    .slice(0, -1)
    .reduce((s, it) => s + (it.gapAfter ?? GROUP_GAP), 0);
  const groupH = items.reduce((s, it) => s + it.h, 0) + totalGaps;
  const groupTop = (VIEWPORT_H - groupH) / 2;
  const result: Partial<Record<Key, number>> = {};
  let cursor = groupTop;
  for (const it of items) {
    result[it.key] = cursor;
    cursor += it.h + (it.gapAfter ?? GROUP_GAP);
  }
  return result;
}

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

  const [recipientRef, recipientHMeasured] = useMeasuredHeight();
  const [messageMirrorRef, messageHMeasured] = useMeasuredHeight();

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ENTER_SETTLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!settled || sub !== "recipient") return;
    if (recipientIdx >= recipientCandidates.length - 1) {
      const t = setTimeout(() => setSub("awaitingConfirm"), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
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
    const isFirst = messageIdx === 0;
    const delayMs = isFirst
      ? CONFIRM_HOLD * 1000 + OPTION_INTERVAL_MS
      : OPTION_INTERVAL_MS;
    const t = setTimeout(() => setMessageIdx((i) => i + 1), delayMs);
    return () => clearTimeout(t);
  }, [sub, messageIdx, phrasingOptions.length]);

  const recipientText = `Message ${recipientCandidates[recipientIdx]}`;
  const showMessage = sub === "cyclingMessage" || sub === "awaitingSend";
  const showButtons = sub === "awaitingConfirm" || sub === "awaitingSend";
  const buttonsKey = sub === "awaitingConfirm" ? "confirm" : "send";

  const recipientH = recipientHMeasured || RECIPIENT_FALLBACK_H;
  const messageH = messageHMeasured || MESSAGE_FALLBACK_H;

  const allTargets = computeTargets([
    { key: "recipient", h: recipientH },
    { key: "message", h: messageH, gapAfter: MESSAGE_BUTTONS_GAP },
    { key: "buttons", h: BUTTONS_H }
  ]);

  const visItems: Array<{ key: Key; h: number; gapAfter?: number }> = [
    { key: "recipient", h: recipientH }
  ];
  if (showMessage) {
    visItems.push({
      key: "message",
      h: messageH,
      gapAfter: showButtons ? MESSAGE_BUTTONS_GAP : GROUP_GAP
    });
  }
  if (showButtons) visItems.push({ key: "buttons", h: BUTTONS_H });
  const visTargets = computeTargets(visItems);

  const targets: Record<Key, number> = {
    recipient: visTargets.recipient ?? 0,
    message: showMessage
      ? (visTargets.message ?? 0)
      : (allTargets.message ?? 0),
    buttons: showButtons ? (visTargets.buttons ?? 0) : (allTargets.buttons ?? 0)
  };

  const layoutTransition = (key: Key) => ({
    duration: LAYOUT_DURATION,
    ease: LAYOUT_EASE,
    delay: sub === "cyclingMessage" && key !== "buttons" ? CONFIRM_HOLD : 0
  });

  return (
    <motion.div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        willChange: "transform"
      }}
    >
      {/* Hidden mirror for measuring message bubble peak height */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div ref={messageMirrorRef} className={styles.messageText}>
          <span>{phrasingOptions[messageIdx]}</span>
        </div>
      </div>

      {/* Recipient */}
      <motion.div
        initial={false}
        animate={{ y: targets.recipient }}
        transition={layoutTransition("recipient")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          willChange: "transform"
        }}
      >
        <div ref={recipientRef} style={{ display: "inline-block" }}>
          {!settled ? (
            <p style={{ margin: 0 }}>{recipientText}</p>
          ) : (
            <TextMorph style={{ willChange: "transform" }}>
              {recipientText}
            </TextMorph>
          )}
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={false}
        animate={{ y: targets.message }}
        transition={layoutTransition("message")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          willChange: "transform"
        }}
      >
        <AnimatePresence initial={false}>
          {showMessage && (
            <motion.div
              key="message"
              className={styles.messageText}
              initial={{ height: 0, opacity: 0, filter: "blur(10px)" }}
              animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{
                height: { duration: MESSAGE_EXPAND_MS, delay: CONFIRM_HOLD },
                opacity: { duration: 0.25, delay: MESSAGE_TEXT_DELAY },
                filter: { duration: 0.25, delay: MESSAGE_TEXT_DELAY }
              }}
              style={{
                overflow: "hidden",
                willChange: "transform, opacity, filter"
              }}
            >
              <TextMorph style={{ willChange: "transform" }}>
                {phrasingOptions[messageIdx]}
              </TextMorph>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={false}
        animate={{ y: targets.buttons }}
        transition={layoutTransition("buttons")}
        className={`${styles.buttonRow}${
          showButtons ? ` ${styles.buttonRowVisible}` : ""
        }`}
      >
        <ActionButton label="Cancel" variant="secondary" onClick={onCancel} />
        <ActionButton
          label={buttonsKey === "confirm" ? "Confirm" : "Send"}
          variant="primary"
          onClick={
            buttonsKey === "confirm" ? () => setSub("cyclingMessage") : onSend
          }
        />
      </motion.div>
    </motion.div>
  );
}
