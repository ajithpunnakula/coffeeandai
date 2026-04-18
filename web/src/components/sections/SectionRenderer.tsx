"use client";

import type { Section } from "@/lib/split-sections";
import ConceptSection from "./ConceptSection";
import CodeSection from "./CodeSection";
import KeypointsSection from "./KeypointsSection";
import ExamTipSection from "./ExamTipSection";
import ComparisonSection from "./ComparisonSection";

export default function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case "concept":
      return <ConceptSection section={section} />;
    case "code":
      return <CodeSection section={section} />;
    case "keypoints":
      return <KeypointsSection section={section} />;
    case "examtip":
      return <ExamTipSection section={section} />;
    case "comparison":
      return <ComparisonSection section={section} />;
    default:
      return <ConceptSection section={section} />;
  }
}
