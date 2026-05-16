# NeuroTask Canvas

NeuroTask Canvas is a local-first productivity app for notes, tasks, projects, decisions, risks, attachments, and visual relationship mapping. The MVP stores data in IndexedDB and renders a zoomable brain-shaped graph canvas with draggable nodes.

## Stack

- React, TypeScript, Vite
- Tailwind CSS
- @xyflow/react for zoom, pan, nodes, edges, minimap, and controls
- Zustand for app state
- Dexie / IndexedDB for local persistence
- Vitest for focused tests

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Other Commands

```bash
npm run build
npm run test
```

## MVP Features

- Left sidebar with search, filters, categories, tags, and add item
- Brain-shaped graph area with draggable nodes, zoom, pan, minimap, and curved relationship lines
- Agenda view for overdue, today, this week, later, and undated work
- Right detail panel for item editing
- Markdown-style description preview for notes and tasks
- Create, edit, delete items
- Edit, complete, delete checklist items with a completion progress bar
- Create relationships by dragging graph handles or using the detail panel
- Suggested relationships based on shared tags, keywords, and category
- Persist items, positions, relationships, checklists, and attachments in IndexedDB
- Attach files and images
- Paste screenshots/images into the selected item
- Export full ZIP backups with attachment files
- Import ZIP backups and legacy JSON backups

## Notes

Legacy JSON backup exports attachment metadata but not binary file contents. ZIP backup includes `backup.json` plus attachment blobs.

Markdown preview supports a small safe subset: headings, paragraphs, bullets, quotes, and fenced code blocks.

The app is intentionally local-first. There is no backend, login, sync, or paid API dependency in the MVP.
