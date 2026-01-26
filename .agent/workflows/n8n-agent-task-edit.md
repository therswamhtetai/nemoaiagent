---
description: How to enable the AI Agent to edit, update, and manage tasks directly via n8n.
---

# Agent Task Editing Workflow

This workflow describes how to set up your n8n agent to handle task updates.

## Prerequisites
- n8n instance connected to your Supabase project.
- `tasks` table in Supabase.
- AI Agent node configured in n8n.

## Workflow Logic

**Ready-to-use Workflow**: A complete JSON file has been created at [`workflows/n8n_agent_task_edit.json`](file:///Users/MSIModern14/Downloads/nemo-ai-dashboard-setup/workflows/n8n_agent_task_edit.json). You can import this directly into n8n.

1.  **Tool Definition**: Define a tool for the AI Agent (e.g., "manage_tasks").
2.  **Input Schema**:
    ```json
    {
      "action": "update | create | delete",
      "task_id": "uuid (optional for create)",
      "updates": {
        "title": "string",
        "status": "pending | in_progress | completed",
        "description": "string"
      }
    }
    ```
3.  **Supabase Node Configuration**:
    - **Operation**: `Update` (or `Upsert` based on logic).
    - **Table**: `tasks`.
    - **Match Column**: `id` (matches `task_id`).
    - **Update Fields**: Map the `updates` object from the AI input to the table columns.

## Step-by-Step Implementation

1.  **Create a New Workflow in n8n**.
2.  **Add an "AI Agent" Node**.
3.  **Add a "Window Buffer Memory" Node** (optional, for context).
4.  **Add a "Supabase" Tool Node** connected to the Agent.
    - **Name**: `update_task`
    - **Description**: `Call this tool to update a task's status, title, or details. ID is required.`
    - **Resource**: `Database` -> `Update`.
5.  **Connect** the nodes and test with a prompt like "Mark task XYZ as completed".

## Example Prompt for Agent
"Please mark the task 'Buy Groceries' as completed."
-> Agent searches for task 'Buy Groceries' (via vector store or search tool) -> Gets ID -> Calls `update_task` with `{ id: "...", status: "completed" }`.
