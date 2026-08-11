import type {
  KnowledgeId,
  KnowledgeNode,
  KnowledgeNodeDefinition,
  KnowledgeTaxonomy,
} from "./types";

export const knowledgeIdPattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){0,2}$/;

const nodeFields = new Set([
  "id",
  "name",
  "description",
  "selectable",
  "children",
]);

export class KnowledgeTaxonomyDefinitionError extends TypeError {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "KnowledgeTaxonomyDefinitionError";
    this.path = path;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asKnowledgeId(value: string): KnowledgeId {
  return value as KnowledgeId;
}

export function defineKnowledgeTaxonomy(
  definition: readonly KnowledgeNodeDefinition[],
): KnowledgeTaxonomy {
  if (!Array.isArray(definition)) {
    throw new KnowledgeTaxonomyDefinitionError(
      "taxonomy",
      "Taxonomy must be an array of nodes",
    );
  }

  const ids = new Set<string>();
  const activeNodes = new Set<object>();

  function normalizeNode(
    input: unknown,
    parentId: string | null,
    path: string,
  ): KnowledgeNode {
    if (!isRecord(input)) {
      throw new KnowledgeTaxonomyDefinitionError(path, "Node must be an object");
    }

    if (activeNodes.has(input)) {
      throw new KnowledgeTaxonomyDefinitionError(path, "Taxonomy tree contains a cycle");
    }

    for (const field of Object.keys(input)) {
      if (!nodeFields.has(field)) {
        throw new KnowledgeTaxonomyDefinitionError(
          `${path}.${field}`,
          "Unknown node field",
        );
      }
    }

    const id = input.id;
    if (typeof id !== "string" || !knowledgeIdPattern.test(id)) {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.id`,
        "Knowledge ID must contain one to three dotted kebab-case segments",
      );
    }

    const segments = id.split(".");
    if (parentId === null) {
      if (segments.length !== 1) {
        throw new KnowledgeTaxonomyDefinitionError(
          `${path}.id`,
          "Root node ID must contain exactly one segment",
        );
      }
    } else {
      const parentSegments = parentId.split(".");
      if (
        segments.length !== parentSegments.length + 1 ||
        !id.startsWith(`${parentId}.`)
      ) {
        throw new KnowledgeTaxonomyDefinitionError(
          `${path}.id`,
          `Child ID must extend parent ${parentId} by exactly one segment`,
        );
      }
    }

    if (ids.has(id)) {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.id`,
        `Duplicate knowledge ID: ${id}`,
      );
    }
    ids.add(id);

    const name = input.name;
    if (typeof name !== "string" || name.trim() === "") {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.name`,
        "Knowledge node name must be a non-empty string",
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(input, "selectable") ||
      typeof input.selectable !== "boolean"
    ) {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.selectable`,
        "Knowledge node selectable must be an explicit boolean",
      );
    }

    const description = input.description;
    if (description !== undefined && typeof description !== "string") {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.description`,
        "Knowledge node description must be a string when present",
      );
    }

    const childDefinitions = input.children ?? [];
    if (!Array.isArray(childDefinitions)) {
      throw new KnowledgeTaxonomyDefinitionError(
        `${path}.children`,
        "Knowledge node children must be an array when present",
      );
    }

    activeNodes.add(input);
    let children: readonly KnowledgeNode[];
    try {
      children = Object.freeze(
        childDefinitions.map((child, index) =>
          normalizeNode(child, id, `${path}.children[${index}]`),
        ),
      );
    } finally {
      activeNodes.delete(input);
    }

    return Object.freeze({
      id: asKnowledgeId(id),
      name: name.trim(),
      ...(description === undefined ? {} : { description }),
      selectable: input.selectable,
      children,
    });
  }

  return Object.freeze(
    definition.map((node, index) =>
      normalizeNode(node, null, `taxonomy[${index}]`),
    ),
  );
}

