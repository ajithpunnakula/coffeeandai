import type { EditProposalFields } from "@/components/studio/ProposalPreview";

function sanitizeQuizMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== "object") return metadata;
  const questions = Array.isArray(metadata.questions)
    ? metadata.questions
        .filter(
          (q: any) =>
            q &&
            typeof q.prompt === "string" &&
            q.prompt.trim().length > 0 &&
            Array.isArray(q.choices) &&
            q.choices.some(
              (c: any) =>
                c && typeof c.text === "string" && c.text.trim().length > 0,
            ),
        )
        .map((q: any) => ({
          ...q,
          choices: q.choices.filter(
            (c: any) =>
              c && typeof c.text === "string" && c.text.trim().length > 0,
          ),
        }))
    : metadata.questions;
  return { ...metadata, questions };
}

function sanitizeScenarioMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== "object") return metadata;
  const steps = Array.isArray(metadata.steps)
    ? metadata.steps.filter(
        (s: any) =>
          s &&
          typeof s.id === "string" &&
          s.id.trim().length > 0 &&
          (typeof s.situation === "string" || typeof s.outcome === "string"),
      )
    : metadata.steps;
  return { ...metadata, steps };
}

export function sanitizeEditFields(
  fields: EditProposalFields,
): EditProposalFields {
  const out: EditProposalFields = { ...fields };
  if (out.metadata && typeof out.metadata === "object") {
    if (Array.isArray(out.metadata.questions)) {
      out.metadata = sanitizeQuizMetadata(out.metadata);
    } else if (Array.isArray(out.metadata.steps)) {
      out.metadata = sanitizeScenarioMetadata(out.metadata);
    }
  }
  return out;
}
