import type {
  ProblemDocument,
  ProblemFrontmatter,
  ProblemFrontmatterInput,
} from "./schema";

export type ProblemFile = ProblemDocument & {
  fileName: string;
};

export type ProblemLoadErrorCode =
  | "read-error"
  | "frontmatter-error"
  | "yaml-error"
  | "validation-error"
  | "id-mismatch"
  | "duplicate-id";

export type ProblemLoadError = {
  fileName: string;
  code: ProblemLoadErrorCode;
  message: string;
};

export type ProblemLoadResult = {
  problems: ProblemFile[];
  errors: ProblemLoadError[];
};

export type EditableProblemField = Exclude<
  keyof ProblemFrontmatter,
  "id" | "reviews"
>;

export type ProblemFrontmatterPatch = Partial<
  Pick<ProblemFrontmatterInput, EditableProblemField>
>;

export type ProblemUpdate = {
  frontmatter?: ProblemFrontmatterPatch;
  content?: string;
};
