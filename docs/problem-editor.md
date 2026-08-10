# Creating and Editing Problems

Use `/problems/new` to create a record and `/problems/<id>/edit` to update one. Both forms write directly to `data/problems/*.md` through the validated, atomic repository API.

## Stable IDs

The create form suggests a kebab-case ID from platform, contest, and problem number, falling back to the title. Review the editable suggestion and confirm it before saving. The ID becomes both the Markdown filename and route segment; it is read-only after creation. Existing IDs are rejected rather than overwritten.

## Form Normalization

- Required fields are title, platform, solved date, and status.
- Categories come from `config/categories.ts` and support multiple selections.
- Tags may be separated by commas, Chinese commas, or new lines. Whitespace and duplicate values are removed.
- Rating, duration, and Review intervals must be positive integers when supplied.
- Review date and interval are enabled and validated as a pair.
- New records start with a structured Markdown retrospective template.

Validation errors are attached to their fields. Invalid URLs, calendar dates, numbers, IDs, or partial Review schedules never reach the filesystem.

## Data Safety

General edits may update the current status and schedule but never create a Review History item. Completing a Review remains a separate workflow. Updates re-read the current file, merge only editable fields, preserve unknown Front Matter and all existing history, and avoid content changes when submitted values are unchanged. The form warns before following a link or closing a page with unsaved changes.
