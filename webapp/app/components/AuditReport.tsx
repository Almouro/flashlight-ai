"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { AlertTriangle, Check, Zap } from "lucide-react";
import {
  Diagnostician,
  Results,
  Step,
} from "@perf-profiler/auditor/src/interfaces";
import {
  AccessibilityDiagnostician,
  PerformanceDiagnostician,
} from "@perf-profiler/auditor/src/interfaces";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import resultsData from "./results.json";

const result = Results.fromJSON(resultsData);
const reporters: Diagnostician[] = [
  new PerformanceDiagnostician(),
  // new AccessibilityDiagnostician(),
];

interface StepAccordionItemProps {
  step: Step;
  index: number;
  currentStepIndex: number | null;
  handleStepClick: (stepIndex: number) => void;
}

const StepAccordionItem: React.FC<StepAccordionItemProps> = ({
  step,
  index,
  currentStepIndex,
  handleStepClick,
}) => {
  const diagnostics = reporters.flatMap((reporter) =>
    reporter.diagnoseStep(step)
  );
  const issues = diagnostics.flatMap((diagnostic) => diagnostic.issues);
  const hasIssues = issues.length > 0;

  return (
    <AccordionItem value={`step-${index}`} key={index}>
      <AccordionTrigger
        onClick={() => handleStepClick(index)}
        className={`hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg ${
          currentStepIndex === index ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          {hasIssues ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : (
            <Check className="h-4 w-4 text-green-500" />
          )}
          <span>
            <span className="text-blue-900 font-bold">
              {step.action.data.info.shortTitle
                .split(" ")[0]
                .toLocaleUpperCase()}
            </span>{" "}
            {step.action.data.info.shortTitle.split(" ").slice(1).join(" ")}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-2 ml-6">
        <p className="text-sm text-muted-foreground mb-2">
          🤔 {step.action.data.info.previousActionAnalysis}{" "}
          {step.action.data.info.explanation}
          <p>🪄 {step.action.data.info.description}</p>
        </p>
        <div>
          <h4 className="text-sm font-semibold">Issues:</h4>
          {issues.length === 0 && "None! ✅"}
          {issues.map((issue, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm hover:bg-accent cursor-pointer p-2 rounded-sm"
            >
              {issue.description === "performance" ? (
                <Zap className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span>{issue.description}</span>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface VideoPlayerProps {
  playerRef: React.RefObject<HTMLVideoElement>;
}

function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    // Create a ResizeObserver instance
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const entry = entries[0]; // We're observing only one element
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    // Start observing the element's size
    resizeObserver.observe(element);

    // Cleanup function
    return () => {
      resizeObserver.unobserve(element);
      resizeObserver.disconnect();
    };
  }, [ref]); // Depend on the ref so it reattaches if the ref changes

  return size;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playerRef }) => {
  const videoWidth = 1080;
  const videoHeight = 2400;

  const selectedElementBounds = {
    left: 335,
    top: 1088,
    width: 746 - 335,
    height: 1214 - 1088,
  };

  const rect = {
    left: (selectedElementBounds.left / videoWidth) * 100 + "%",
    top: (selectedElementBounds.top / videoHeight) * 100 + "%",
    width: (selectedElementBounds.width / videoWidth) * 100 + "%",
    height: (selectedElementBounds.height / videoHeight) * 100 + "%",
  };

  return (
    <div
      className={`bg-blue-100 h-full aspect-[${videoWidth}/${videoHeight}] relative`}
    >
      <video
        ref={playerRef}
        src="/video.mp4"
        className="bg-black h-full w-full"
        controls
        autoPlay
        muted
      />
      {/* <div
        className="absolute border-2 border-red-500"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          boxSizing: "border-box",
        }}
      ></div> */}
    </div>
  );
};

export default function AuditReport() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    if (playerRef.current) {
      playerRef.current.currentTime =
        result.steps[stepIndex].timingsMs.stepBegin / 1000;
    }
  };

  return (
    <div className="flex h-screen bg-background w-full">
      <div className="flex-grow p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">🔦 FLASHLIGHT AI 🤖</h2>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <Accordion type="single" collapsible className="w-full">
            {result.steps.map((step, index) => (
              <StepAccordionItem
                key={index}
                step={step}
                index={index}
                currentStepIndex={currentStepIndex}
                handleStepClick={handleStepClick}
              />
            ))}
          </Accordion>
        </ScrollArea>
      </div>
      <VideoPlayer playerRef={playerRef} />
    </div>
  );
}

const LoaderContainer = ({ children }: { children: React.ReactNode }) => (
  // TODO: add error boundary
  // <ErrorBoundary errorComponent={<p>⚠️Something went wrong</p>}>
  <Suspense fallback={<p>⌛Downloading message...</p>}>{children}</Suspense>
  // </ErrorBoundary>
);
