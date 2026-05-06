"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { FLOW_BY_ID, FLOWS, type StepId } from "./flows";
import { MessageFlow } from "./MessageFlow";
import styles from "./page.module.css";
import { Screen } from "./Screen";
import { IdleView } from "./views/IdleView";
import { SentView } from "./views/SentView";

const STEP_OPTIONS: StepId[] = ["idle", "intentPrelude", "compose", "sent"];
const PRELUDE_MS = 1000;

export default function Page() {
  const [flowId, setFlowId] = useState<string>(FLOWS[0].id);
  const [stepId, setStepId] = useState<StepId>("idle");

  const flow = FLOW_BY_ID[flowId];
  const recipient =
    flow.recipientCandidates[flow.recipientCandidates.length - 1];

  const controls = useControls({
    flow: {
      value: FLOWS[0].id,
      options: Object.fromEntries(FLOWS.map((f) => [f.label, f.id])),
      label: "Flow"
    },
    step: {
      value: "idle" as string,
      options: STEP_OPTIONS,
      label: "Step"
    }
  }) as { flow: string; step: StepId };

  useEffect(() => {
    setFlowId(controls.flow);
  }, [controls.flow]);

  useEffect(() => {
    setStepId(controls.step);
  }, [controls.step]);

  useEffect(() => {
    if (stepId !== "intentPrelude") return;
    const t = setTimeout(() => setStepId("compose"), PRELUDE_MS);
    return () => clearTimeout(t);
  }, [stepId]);

  useEffect(() => {
    if (stepId !== "sent") return;
    const t = setTimeout(() => setStepId("idle"), 3000);
    return () => clearTimeout(t);
  }, [stepId]);

  const goTo = (s: StepId) => setStepId(s);
  const reset = () => setStepId("idle");

  const shouldReduceMotion = useReducedMotion();
  const clockLarge = stepId === "idle" || stepId === "intentPrelude";
  const idleLayout = stepId === "idle" || stepId === "intentPrelude";
  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.645, 0.045, 0.355, 1] as const };

  return (
    <>
      <TweakpanePanel />
      <Screen
        className={idleLayout ? styles.containerIdle : styles.containerActive}
      >
        <motion.p
          layout
          animate={{ fontWeight: clockLarge ? 100 : 400 }}
          transition={layoutTransition}
          className={`${styles.time} ${clockLarge ? styles.clockLarge : styles.clockSmall}`}
        >
          09<span>:</span>34
        </motion.p>
        <AnimatePresence>
          {stepId === "intentPrelude" && (
            <motion.p
              key="prelude"
              className={styles.preludeText}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.3 }}
            >
              Message Intent
            </motion.p>
          )}
        </AnimatePresence>
        <div className={styles.viewport}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepId === "intentPrelude" ? "idle" : stepId}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.25 }}
              className={styles.screenContent}
            >
              {(stepId === "idle" || stepId === "intentPrelude") && (
                <IdleView />
              )}
              {stepId === "compose" && (
                <MessageFlow
                  recipientCandidates={flow.recipientCandidates}
                  phrasingOptions={flow.phrasingOptions}
                  onCancel={reset}
                  onSend={() => goTo("sent")}
                />
              )}
              {stepId === "sent" && <SentView recipient={recipient} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Screen>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => goTo(stepId === "idle" ? "intentPrelude" : "idle")}
        >
          Toggle Intent
        </button>
      </div>
    </>
  );
}
