# Gemeni Project Context

This document serves as the primary context and instruction set for the NemoAI Dashboard project.

## Instructions
*   **Mobile First:** Prioritize mobile responsiveness. All updates must be verified on mobile viewports (375px width).
*   **Full-Screen Modals:** On mobile devices, all modals (Idea, Task, Contact, Competitor, Settings) must be full-screen (`fixed inset-0`) with no visible borders or "glossy edges" (`border-0 md:border`).
*   **Design Aesthetic:** maintain a "Premium Dark Mode" aesthetic. Use gradients (`bg-gradient-to-br`), glassmorphism (`backdrop-blur-xl`), and subtle borders (`border-white/10`).
*   **Touch Targets:** Ensure all interactive elements (buttons, inputs) have adequate spacing and size for touch interaction.
*   **Performance:** Avoid heavy re-renders. Use `useMemo` and `useCallback` where appropriate.
*   **Strict Types:** Maintain strict TypeScript typing. Do not use `any` unless absolutely necessary.

## Structure
The project is built on **Next.js 15+ (App Router)** with **TypeScript** and **Tailwind CSS**.

```text
/app
  layout.tsx       # Root layout (Fonts context, Analytics, Global CSS)
  page.tsx         # Main Dashboard Logic (State, Effects, UI Rendering)
  globals.css      # Global Styles (Tailwind directives, Custom scrollbars)
/components
  /ui              # Reusable UI components (Card, Button, Input, etc.)
  RichTextEditor.tsx # Tiptap-based rich text editor for Ideas
/lib
  types.ts         # Global Type Definitions (Task, Idea, Contact, etc.)
  /services
    api.ts         # Supabase API Wrapper functions
  /supabase
    client.ts      # Supabase Client Initialization
```

## Components
*   **RichTextEditor:** Custom editor using `@tiptap` for Idea descriptions. Supports Markdown-like features (bold, lists).
*   **Modals:**
    *   **Idea Modal:** View/Edit concepts. Full-screen on mobile.
    *   **Task Popup:** Quick view of active tasks (Today, Overdue, Urgent).
    *   **Competitor Modal:** Detailed market intelligence view.
    *   **Contact Modal:** CRM entry implementation.
    *   **Settings Modal:** User preferences (Profile, Language, Change Log).
*   **UI Primitives:** `Card`, `Button`, `Input`, `Textarea` (styled with Tailwind/Radix).

## Modules
The dashboard is divided into distinct functional modules:

1.  **Home:** Central hub. Quick prompts, voice input, AI chat interface.
2.  **Tasks:** Task management system.
    *   *Features:* Filtering (Pending, In Progress, Completed, Archived), Priority tagging.
    *   *Stats Cards:* Clickable summaries (Overdue, Urgent, Today).
3.  **Ideas:** Creative space for logging concepts.
    *   *Features:* Rich Text descriptions, Tagging, Status workflow (Draft -> Approved).
4.  **Market Intelligence:** Competitor tracking.
    *   *Features:* Web scraping data (Followers, Viral Score), Ad activity tracking.
    *   *Logic:* Always displays the **latest** scrape data by sorting `scraped_at`.
5.  **CRM:** Contact management.
    *   *Features:* Add/Edit contacts, Search functionality.
6.  **Calendar:** Date-based task view.
    *   *Features:* Monthly grid, "Today" highlighting, Task dots by priority.

## Context
*   **Backend:** Supabase (PostgreSQL).
*   **Auth:** Custom implementation via Supabase + Webhook fallback (for N8N integration).
*   **Voice:** Custom "Push to Talk" implementation sending audio blobs to N8N webhook.
*   **Deployment:** Vercel.
*   **Version:** v1.0.5 (as of latest push).

## Recent Changes (v1.0.5)
*   **Polished Mobile Modals:** Removed borders and glossy edges to fix visual artifacts on mobile.
*   **Market Intelligence Fix:** Logic updated to strictly fetch the most recent scrape data.
*   **Changelog:** Integrated transparent changelog in Settings.
