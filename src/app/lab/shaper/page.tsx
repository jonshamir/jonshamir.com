"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { TweakpanePanel } from "../../../components/TweakpanePanel";
import { useControls } from "../../../lib/tweakpane";
import { FLOW_BY_ID, FLOWS, type StepId } from "./flows";
import styles from "./page.module.css";
import { Screen } from "./Screen";
import { IdleView } from "./views/IdleView";
import { IntentView } from "./views/IntentView";
import { PreviewView } from "./views/PreviewView";
import { SentView } from "./views/SentView";
import { SolidifyView } from "./views/SolidifyView";

const STEP_OPTIONS: StepId[] = [
  "idle",
  "intent",
  "solidify",
  "preview",
  "sent"
];

export default function Page() {
  const [flowId, setFlowId] = useState<string>(FLOWS[0].id);
  const [stepId, setStepId] = useState<StepId>("idle");
  const [phrasingIndex, setPhrasingIndex] = useState(0);

  const flow = FLOW_BY_ID[flowId];

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

  const goTo = (s: StepId) => setStepId(s);
  const reset = () => {
    setStepId("idle");
    setPhrasingIndex(0);
  };

  const shouldReduceMotion = useReducedMotion();
  const isIdle = stepId === "idle";
  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.645, 0.045, 0.355, 1] as const };

  return (
    <>
      <TweakpanePanel />
      <Screen
        className={isIdle ? styles.containerIdle : styles.containerActive}
      >
        <motion.p
          layout
          animate={{ fontWeight: isIdle ? 100 : 400 }}
          transition={layoutTransition}
          className={`${styles.time} ${isIdle ? styles.clockLarge : styles.clockSmall}`}
        >
          09:34
        </motion.p>
        <div className={styles.viewport}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {stepId === "idle" && <IdleView />}
              {stepId === "intent" && (
                <IntentView
                  prompt={flow.intentPrompt}
                  onCancel={reset}
                  onConfirm={() => goTo("solidify")}
                />
              )}
              {stepId === "solidify" && (
                <SolidifyView
                  options={flow.phrasingOptions}
                  selectedIndex={phrasingIndex}
                  onSelect={setPhrasingIndex}
                  onCancel={reset}
                  onConfirm={() => goTo("preview")}
                />
              )}
              {stepId === "preview" && (
                <PreviewView
                  recipient={flow.recipient}
                  message={flow.phrasingOptions[phrasingIndex]}
                  onCancel={reset}
                  onSend={() => goTo("sent")}
                />
              )}
              {stepId === "sent" && <SentView recipient={flow.recipient} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Screen>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => goTo(stepId === "idle" ? "intent" : "idle")}>
          Toggle Intent
        </button>
      </div>
    </>
  );
}
