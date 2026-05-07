import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

import type { ComposeBodyProps } from "../ComposeShell";
import styles from "../page.module.css";
import { useMaxWrappedLineCount, useWrappedLines } from "../useWrappedLines";

const MESSAGE_MAX_WIDTH = 320;
const MESSAGE_INTERVAL_MS = 1800;
const REVEAL_DELAY_MS = 1200;
const MESSAGE_EXPAND_MS = 0.3;
const CONFIRM_HOLD = 0.6;
const MESSAGE_TEXT_DELAY = CONFIRM_HOLD + 0.35;
const LAYOUT_DURATION = 0.4;
const LAYOUT_EASE = [0.25, 0.46, 0.45, 0.94] as const;

function fillerLines(count: number) {
  const out: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    out.push(<div key={i}>&nbsp;</div>);
  }
  return out;
}

export function MessageBody({
  phrasingOptions,
  phase,
  onAdvance,
  measureRef
}: ComposeBodyProps & { phrasingOptions: string[] }) {
  const [messageIdx, setMessageIdx] = useState(0);
  const [messageEntered, setMessageEntered] = useState(false);

  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const [messageFont, setMessageFont] = useState("");
  const [messageLineHeight, setMessageLineHeight] = useState(0);
  const [messagePaddingY, setMessagePaddingY] = useState(0);

  useEffect(() => {
    const node = mirrorRef.current;
    if (!node) return;
    const cs = getComputedStyle(node);
    setMessageFont(cs.font);
    const lh = parseFloat(cs.lineHeight);
    if (!Number.isNaN(lh)) setMessageLineHeight(lh);
    const pt = parseFloat(cs.paddingTop) || 0;
    const pb = parseFloat(cs.paddingBottom) || 0;
    setMessagePaddingY(pt + pb);
  }, []);

  const messageLines = useWrappedLines(
    phrasingOptions[messageIdx] ?? "",
    MESSAGE_MAX_WIDTH,
    messageFont
  );
  const maxLineCount = useMaxWrappedLineCount(
    phrasingOptions,
    MESSAGE_MAX_WIDTH,
    messageFont
  );

  const isCycling = phase.id === "active";

  useEffect(() => {
    if (!isCycling) return;
    if (messageIdx >= phrasingOptions.length - 1) {
      const t = setTimeout(() => onAdvance(), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
    const isFirst = messageIdx === 0;
    const delayMs = isFirst
      ? CONFIRM_HOLD * 1000 + MESSAGE_INTERVAL_MS
      : MESSAGE_INTERVAL_MS;
    const t = setTimeout(() => setMessageIdx((i) => i + 1), delayMs);
    return () => clearTimeout(t);
  }, [isCycling, messageIdx, phrasingOptions.length, onAdvance]);

  useEffect(() => {
    const t = setTimeout(
      () => setMessageEntered(true),
      (CONFIRM_HOLD + MESSAGE_EXPAND_MS) * 1000
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Hidden mirror for measuring peak height */}
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
        <div
          ref={mirrorRef}
          className={styles.messageText}
          style={{ maxWidth: MESSAGE_MAX_WIDTH }}
        >
          {fillerLines(maxLineCount)}
        </div>
      </div>
      <motion.div
        ref={measureRef as (el: HTMLDivElement | null) => void}
        className={`${styles.messageText}${
          isCycling ? ` ${styles.focused}` : ""
        }`}
        initial={{ height: 0, opacity: 0, filter: "blur(10px)" }}
        animate={{
          height:
            messageLineHeight > 0
              ? messageLines.length * messageLineHeight + messagePaddingY
              : "auto",
          opacity: 1,
          filter: "blur(0px)"
        }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{
          height: messageEntered
            ? { duration: LAYOUT_DURATION, ease: LAYOUT_EASE }
            : { duration: MESSAGE_EXPAND_MS, delay: CONFIRM_HOLD },
          opacity: { duration: 0.25, delay: MESSAGE_TEXT_DELAY },
          filter: { duration: 0.25, delay: MESSAGE_TEXT_DELAY }
        }}
        style={{ overflow: "hidden", willChange: "transform, opacity, filter" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: MESSAGE_MAX_WIDTH
          }}
        >
          {messageLines.map((line, i) => (
            <TextMorph key={i} style={{ willChange: "transform" }}>
              {line}
            </TextMorph>
          ))}
        </div>
      </motion.div>
    </>
  );
}
