import { createKnowledgeCatalog } from "@/lib/knowledge/catalog";
import { defineKnowledgeTaxonomy } from "@/lib/knowledge/definition";
import type { KnowledgeNodeDefinition } from "@/lib/knowledge/types";

export const knowledgeTaxonomyFixtureDefinition = [
  {
    id: "graph",
    name: "图论",
    selectable: false,
    children: [
      {
        id: "graph.shortest-path",
        name: "最短路",
        selectable: true,
        children: [
          {
            id: "graph.shortest-path.dijkstra",
            name: "Dijkstra",
            selectable: true,
          },
          {
            id: "graph.shortest-path.bellman-ford",
            name: "Bellman–Ford",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "data-structure",
    name: "数据结构",
    selectable: false,
    children: [
      {
        id: "data-structure.heap",
        name: "堆",
        selectable: true,
      },
    ],
  },
] as const satisfies readonly KnowledgeNodeDefinition[];

export const knowledgeTaxonomyFixture = defineKnowledgeTaxonomy(
  knowledgeTaxonomyFixtureDefinition,
);

export const knowledgeCatalogFixture = createKnowledgeCatalog(
  knowledgeTaxonomyFixture,
);

