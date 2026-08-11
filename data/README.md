# Training Data

Problem records live in `problems/`, with one Markdown file per stable problem ID. The production directory is allowed to contain zero Problems and does not carry automated-test samples. Unit tests use test-local or temporary fixtures, and E2E uses its isolated seed directory.

Do not rename a file or change its `id` after creation. Each record must use the current required `knowledge: KnowledgeId[]` Front Matter contract; `knowledge: []` is valid and legacy `categories` is invalid. Use the repository data API for application writes so validation, atomic replacement, unrelated unknown fields, Markdown content, and Review History remain protected.
