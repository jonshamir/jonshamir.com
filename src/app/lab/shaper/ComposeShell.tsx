import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

import { ActionButton } from "./ActionButton";
import { getContactImage } from "./contactImages";
import styles from "./page.module.css";

export type ShellPhase = {
  id: string;
  showBody: boolean;
  showButtons: boolean;
  primary: {
    label: string;
    variant?: "primary" | "secondary" | "warning";
    onClick: () => void;
  } | null;
  bodyFocused?: boolean;
  showMiddleSlot?: boolean;
  compactRecipient?: boolean;
  hideRecipient?: boolean;
  autoAdvanceMs?: number;
};

export type ComposeBodyProps = {
  phase: ShellPhase;
  onAdvance: () => void;
  measureRef: (el: HTMLElement | null) => void;
};

const VIEWPORT_H = 470;
const BUTTONS_H = 56;
const GROUP_GAP = 18;
const MESSAGE_BUTTONS_GAP = 32;
const LAYOUT_DURATION = 0.4;
const LAYOUT_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const RECIPIENT_FALLBACK_H = 24;
const BODY_FALLBACK_H = 80;
const MIDDLE_FALLBACK_H = 28;
const ENTER_SETTLE_MS = 100;
const RECIPIENT_INTERVAL_MS = 1200;
const REVEAL_DELAY_MS = 1200;

type Key = "recipient" | "body" | "middle" | "buttons";

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

export function ComposeShell({
  recipientCandidates,
  phases,
  onCancel,
  renderBody,
  renderBackground,
  middleSlot
}: {
  recipientCandidates: string[];
  phases: (advance: () => void) => ShellPhase[];
  onCancel: () => void;
  renderBody?: (props: ComposeBodyProps) => ReactNode;
  renderBackground?: (args: {
    phase: ShellPhase | null;
    advance: () => void;
  }) => ReactNode;
  middleSlot?: ReactNode;
}) {
  const [recipientIdx, setRecipientIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(-1); // -1 = still cycling recipient
  const [settled, setSettled] = useState(false);

  const [recipientRef, recipientHMeasured] = useMeasuredHeight();
  const [bodyMirrorRef, bodyHMeasured] = useMeasuredHeight();
  const [middleRef, middleHMeasured] = useMeasuredHeight();

  const phasesRef = useRef<ShellPhase[]>([]);
  const advance = () => {
    setPhaseIdx((i) => (i < phasesRef.current.length - 1 ? i + 1 : i));
  };
  const resolvedPhases = phases(advance);
  phasesRef.current = resolvedPhases;

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ENTER_SETTLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!settled || phaseIdx >= 0) return;
    if (recipientIdx >= recipientCandidates.length - 1) {
      const t = setTimeout(() => setPhaseIdx(0), REVEAL_DELAY_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setRecipientIdx((i) => i + 1),
      RECIPIENT_INTERVAL_MS
    );
    return () => clearTimeout(t);
  }, [settled, phaseIdx, recipientIdx, recipientCandidates.length]);

  const phase: ShellPhase | null =
    phaseIdx >= 0 ? resolvedPhases[phaseIdx] : null;
  const recipientName = recipientCandidates[recipientIdx];
  const recipientFocused = phaseIdx < 0;

  // Delay the text morph slightly so it lines up with the new image
  // arriving during the avatar cross-fade.
  const [displayName, setDisplayName] = useState(recipientName);
  useEffect(() => {
    const t = setTimeout(() => setDisplayName(recipientName), 100);
    return () => clearTimeout(t);
  }, [recipientName]);

  const showBody = phase?.showBody ?? false;
  const showButtons = phase?.showButtons ?? false;
  const showMiddle = phase?.showMiddleSlot ?? false;
  const compactRecipient = phase?.compactRecipient ?? showBody;

  useEffect(() => {
    if (!phase?.autoAdvanceMs) return;
    const t = setTimeout(advance, phase.autoAdvanceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, phase?.autoAdvanceMs]);

  const recipientH = recipientHMeasured || RECIPIENT_FALLBACK_H;
  const bodyH = bodyHMeasured || BODY_FALLBACK_H;
  const middleH = middleHMeasured || MIDDLE_FALLBACK_H;

  const allItems: Array<{ key: Key; h: number; gapAfter?: number }> = [
    { key: "recipient", h: recipientH },
    { key: "body", h: bodyH, gapAfter: GROUP_GAP },
    { key: "middle", h: middleH, gapAfter: GROUP_GAP },
    { key: "buttons", h: BUTTONS_H }
  ];
  const allTargets = computeTargets(allItems);

  const visItems: Array<{ key: Key; h: number; gapAfter?: number }> = [
    { key: "recipient", h: recipientH }
  ];
  if (showBody) {
    visItems.push({
      key: "body",
      h: bodyH,
      gapAfter: showMiddle || showButtons ? MESSAGE_BUTTONS_GAP : GROUP_GAP
    });
  }
  if (showMiddle) {
    visItems.push({ key: "middle", h: middleH, gapAfter: GROUP_GAP });
  }
  if (showButtons) visItems.push({ key: "buttons", h: BUTTONS_H });
  const visTargets = computeTargets(visItems);

  const targets: Record<Key, number> = {
    recipient: visTargets.recipient ?? 0,
    body: showBody ? (visTargets.body ?? 0) : (allTargets.body ?? 0),
    middle: showMiddle ? (visTargets.middle ?? 0) : (allTargets.middle ?? 0),
    buttons: showButtons ? (visTargets.buttons ?? 0) : (allTargets.buttons ?? 0)
  };

  // Pin recipient near the top of the frame when compact and no body slot
  // (imagine flow). Compose flow keeps recipient grouped above the message.
  if (compactRecipient && !showBody) {
    targets.recipient = 48;
  }

  if (compactRecipient && !showBody && showButtons && !showMiddle) {
    targets.buttons = VIEWPORT_H - BUTTONS_H - 24;
  }

  const layoutTransition = () => ({
    duration: LAYOUT_DURATION,
    ease: LAYOUT_EASE
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
      {renderBackground && (
        <div
          style={{
            position: "absolute",
            top: -40,
            bottom: -40,
            left: -32,
            right: -32,
            zIndex: -1,
            borderRadius: 999,
            overflow: "hidden",
            pointerEvents: "none"
          }}
        >
          {renderBackground({ phase, advance })}
        </div>
      )}
      {/* Recipient */}
      <motion.div
        initial={false}
        animate={{
          y: targets.recipient,
          opacity: phase?.hideRecipient ? 0 : compactRecipient ? 0.9 : 1,
          fontWeight: compactRecipient ? 500 : 450,
          letterSpacing: compactRecipient ? "0.02em" : "0em",
          scale: compactRecipient ? 0.8 : 1,
          filter: phase?.hideRecipient ? "blur(10px)" : "blur(0px)"
        }}
        transition={layoutTransition()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          willChange: "transform, opacity"
        }}
      >
        <div ref={recipientRef} style={{ display: "inline-block" }}>
          <AnimatePresence initial={false}>
            {!compactRecipient && (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "relative",
                  width: 110,
                  height: 110,
                  margin: "0 auto 18px",
                  borderRadius: 999,
                  overflow: "hidden",
                  willChange: "opacity, filter",
                  backgroundColor: "#555"
                }}
              >
                <AnimatePresence initial={false}>
                  {(() => {
                    const img = getContactImage(recipientName);
                    return (
                      <motion.div
                        key={recipientName}
                        initial={{ opacity: 0, filter: "blur(12px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{
                          opacity: 0,
                          filter: "blur(12px)",
                          transition: {
                            filter: { duration: 0.35, ease: LAYOUT_EASE },
                            opacity: {
                              duration: 0.2,
                              delay: 0.2,
                              ease: LAYOUT_EASE
                            }
                          }
                        }}
                        transition={{
                          filter: {
                            duration: 0.4,
                            delay: 0.12,
                            ease: LAYOUT_EASE
                          },
                          opacity: {
                            duration: 0.25,
                            delay: 0.15,
                            ease: LAYOUT_EASE
                          }
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          willChange: "opacity, filter"
                        }}
                      >
                        {img && (
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="110px"
                            style={{
                              objectFit: "cover",
                              transform: "scale(1.15)"
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          <span>Message </span>
          <span
            className={`${styles.recipientName}${
              recipientFocused ? ` ${styles.focused}` : ""
            }`}
          >
            {!settled ? (
              displayName
            ) : (
              <TextMorph style={{ willChange: "transform" }}>
                {displayName}
              </TextMorph>
            )}
          </span>
        </div>
      </motion.div>

      {/* Body slot */}
      <motion.div
        initial={false}
        animate={{ y: targets.body }}
        transition={layoutTransition()}
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
          {showBody && phase && renderBody && (
            <motion.div
              key="body"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
              ref={(el) => {
                (bodyMirrorRef as { current: HTMLDivElement | null }).current =
                  el;
              }}
              style={{ willChange: "transform, opacity, filter" }}
            >
              {renderBody({
                phase,
                onAdvance: advance,
                measureRef: (el) => {
                  (
                    bodyMirrorRef as { current: HTMLDivElement | null }
                  ).current = el as HTMLDivElement | null;
                }
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Middle slot (warning copy etc.) */}
      <motion.div
        initial={false}
        animate={{ y: targets.middle }}
        transition={layoutTransition()}
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
          {showMiddle && middleSlot && (
            <motion.div
              key="middle"
              ref={middleRef}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.25 }}
            >
              {middleSlot}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Buttons */}
      <AnimatePresence mode="wait" initial={false}>
        {showButtons && phase && (
          <motion.div
            key={phase.id}
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              y: targets.buttons
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              y: targets.buttons
            }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={styles.buttonRow}
          >
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={onCancel}
            />
            {phase.primary && (
              <ActionButton
                label={phase.primary.label}
                variant={phase.primary.variant ?? "primary"}
                onClick={phase.primary.onClick}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
