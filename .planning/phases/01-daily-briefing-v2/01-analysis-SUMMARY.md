# Phase 01 Plan 01: Analysis and Architecture Summary

## 1. Validation Report
Analysis of `workflows/daily-briefing-enhanced.json` reveals that while it attempts to solve the "hardcoded users" issue, it introduces a critical data flow logic error.

*   **Issue**: Linear execution (`Users` -> `Tasks` -> `Prefs`) causes **Context Loss**.
    *   The "Get User Tasks" node output (Tasks) overwrites the "Get Active Users" output (Users).
    *   Subsequent nodes (like "Get User Preferences") try to reference `user_id` but receive `task_id`.
*   **Status**: The current JSON is **non-functional** for multi-user processing.
*   **Requirement**: A structural change is needed to maintain "User Context" while fetching related data (Tasks, Prefs).

## 2. Schema Analysis: User Preferences
The `user_preferences` table uses a Key-Value structure:
*   `user_id` (UUID)
*   `preference_key` (VARCHAR)
*   `preference_value` (TEXT)

**Transformation Strategy**:
To use this effectively in AI prompts, we must transform the rows into a flat JSON object for each user.

**Raw Data**:
```json
[
  { "key": "language", "value": "myanmar" },
  { "key": "style", "value": "concise" }
]
```

**Target Format**:
```json
{
  "language": "myanmar",
  "style": "concise"
}
```

This transformation should happen inside the "Briefing Generator" worker.

## 3. Architecture Design: V2 Hybrid Model

We will implement a **Master/Worker** architecture (Patterns 2 + 3).

### A. The Master Workflow (Scheduler)
**Purpose**: Triggers the process for all active users at a specific time.

*   **Trigger**: Schedule (e.g., 8:00 AM).
*   **Step 1**: `Get Active Users` (Supabase: `is_active = true`).
*   **Step 2**: `Loop Over Users` (Split In Batches).
*   **Step 3**: `Execute Workflow` (Call "Briefing Generator").
    *   Pass `user_id` and `first_name` as input.

### B. The Worker Workflow (Briefing Generator)
**Purpose**: Generates and sends a briefing for a *single* user. Can be called by Scheduler OR Chat Router.

*   **Trigger**: `Execute Workflow Trigger` / `Webhook` (Input: `user_id`).
*   **Step 1: Parallel Data Fetch**:
    *   **Tasks**: Fetch Overdue, Today, Upcoming (Supabase).
    *   **Preferences**: Fetch and Transform (Supabase + Code).
    *   **Context**: Fetch basic user profile (if not passed).
*   **Step 2: AI Generation**:
    *   Node: `Google Gemini` (or PaLM).
    *   Prompt: Inject Tasks + Prefs. Output: Concise briefing text.
*   **Step 3: Notification**:
    *   Node: `ntfy`.
    *   Topic: `nemo_user_{user_id}` (or lookup topic from prefs).

### C. On-Demand Integration
By making the **Worker Workflow** a standalone tool:
1.  We register it in the **Web API Router** (Jarvis Brain).
2.  Tool Definition:
    *   Name: `generate_daily_briefing`
    *   Description: "Generates a daily briefing for the user on demand."
    *   Inputs: `user_id` (from chat context).
3.  **Result**: Users can say "What's my briefing?" and it executes the exact same logic as the morning schedule.

## 4. Implementation Steps (Next Plans)

1.  **Plan 02: Core Loop Architecture**
    *   Create `workflows/daily-briefing-worker.json` (The logic unit).
    *   Create `workflows/daily-briefing-master.json` (The scheduler).
    *   Implement the "Preferences Transformation" code node.

2.  **Plan 03: Web API Router Integration**
    *   Register the Worker workflow as a tool in the Router.
    *   Test "On-demand" triggering.

3.  **Plan 04: Reliability**
    *   Add Error Handling (Try/Catch) in the Worker to prevent one user's failure stopping others.
