import type { ProblemLoadErrorCode } from "./types";

export class ProblemDataError extends Error {
  readonly code: ProblemLoadErrorCode | "invalid-id" | "already-exists";
  readonly fileName?: string;

  constructor(
    code: ProblemDataError["code"],
    message: string,
    fileName?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ProblemDataError";
    this.code = code;
    this.fileName = fileName;
  }
}
