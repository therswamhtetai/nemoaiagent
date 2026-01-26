---
phase: 01-daily-briefing-v2
plan: 02
type: execute
wave: 1
depends_on: [01]
files_modified: []
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Workflow triggers at 8 AM, 12 PM, and 8 PM"
    - "Workflow iterates through ALL active users dynamically"
    - "AI Summary contains user-specific tasks and calendar events"
    - "Notification is sent via `push-notif-briefing` sub-workflow"
    - "No data leaks between users in the loop"
  artifacts:
    - path: "workflows/daily-briefing-v2.json"
      provides: "Main workflow definition"
      min_lines: 50
  key_links:
    - from: "Split In Batches"
      to: "Google Gemini"
      via: "JSON expression"
      pattern: "\\$json\\.id"
    - from: "Execute Workflow (Notification)"
      to: "push-notif-briefing"
      via: "Workflow ID OPqleYbWDbxnuHa6"
      pattern: "OPqleYbWDbxnuHa6"
---

<objective>
Implement the "Daily Briefing V2" workflow as a single monolithic process with a dynamic user loop.

Purpose: Replace the hardcoded user chain with a scalable loop that supports unlimited users, ensuring strict data isolation and correct notification delivery.
Output: `workflows/daily-briefing-v2.json`
</objective>

<context>
@CLAUDE.md
@.planning/phases/01-daily-briefing-v2/01-analysis-SUMMARY.md

# Override Note: 
# Contrary to Analysis Plan 01, we are using a MONOLITHIC LOOP approach.
# Logic (Fetching + AI) stays in the main workflow.
# Only Notification is a sub-workflow.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Workflow and User Loop</name>
  <files>workflows/daily-briefing-v2.json</files>
  <action>
    Create a new n8n workflow JSON structure.
    1. Add `Schedule Trigger` nodes for 8:00, 12:00, and 20:00.
    2. Add `Supabase` node to fetch all users where `is_active = true`.
    3. Add `Split In Batches` node to loop through users one by one.
    4. Save as `workflows/daily-briefing-v2.json`.
  </action>
  <verify>
    Inspect JSON: Ensure Schedule Triggers exist and SplitInBatches is connected to Supabase output.
  </verify>
  <done>
    Workflow file exists with triggers and user loop structure.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement Data Fetching inside Loop</name>
  <files>workflows/daily-briefing-v2.json</files>
  <action>
    Inside the Split In Batches loop, add nodes to fetch user-specific data:
    1. `Supabase` (Tasks): Fetch tasks where `user_id` matches current loop item ID and `status != completed`.
    2. `Google Calendar`: Fetch events for the current day using user's email/ID (if available) or generic calendar for now.
    3. `HTTP Request`: Fetch weather data (optional, can use hardcoded location or user pref if exists).
    
    CRITICAL: Ensure all nodes reference `$('SplitInBatches').item.json.id` to prevent data leaks.
  </action>
  <verify>
    Check JSON expressions in the new nodes to confirm they reference the Loop item, not static IDs.
  </verify>
  <done>
    Loop contains data fetching nodes for Tasks, Calendar, and Weather.
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement AI Summary and Notification</name>
  <files>workflows/daily-briefing-v2.json</files>
  <action>
    Continue the loop logic:
    1. `Google Gemini`: Create a prompt that combines User Name, Tasks, Calendar, and Weather.
       - Prompt: "Generate a friendly daily briefing for {Name}. Tasks: {Tasks}. Events: {Events}. Keep it concise."
    2. `Execute Workflow`: Call `push-notif-briefing` (ID: OPqleYbWDbxnuHa6).
       - Pass `user_id` (from Loop) and `message` (from Gemini).
    3. Connect loop back to `Split In Batches`.
  </action>
  <verify>
    Inspect JSON: Ensure Gemini node uses data from previous nodes and Notification node calls ID `OPqleYbWDbxnuHa6`.
  </verify>
  <done>
    Workflow processes data via AI and sends notification for each user.
  </done>
</task>

</tasks>

<verification>
Verify that the `user_id` passed to the Notification sub-workflow comes explicitly from the SplitInBatches node, not an upstream fetch node that might have been overwritten.
</verification>

<success_criteria>
- Workflow successfully iterates 5 users (simulated).
- "push-notif-briefing" is called 5 times.
- Each call has a unique user_id.
</success_criteria>

<output>
After completion, create `.planning/phases/01-daily-briefing-v2/01-implementation-SUMMARY.md`
</output>
