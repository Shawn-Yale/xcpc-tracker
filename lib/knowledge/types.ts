declare const knowledgeIdBrand: unique symbol;

export type KnowledgeId = string & {
  readonly [knowledgeIdBrand]: true;
};

export type KnowledgeNodeDefinition = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly children?: readonly KnowledgeNodeDefinition[];
};

export type KnowledgeNode = {
  readonly id: KnowledgeId;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly children: readonly KnowledgeNode[];
};

export type KnowledgeTaxonomy = readonly KnowledgeNode[];

export type KnowledgeCatalogEntry = {
  readonly id: KnowledgeId;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly parentId: KnowledgeId | null;
  readonly ancestorIds: readonly KnowledgeId[];
  readonly depth: 1 | 2 | 3;
  readonly pathSegments: readonly string[];
};

