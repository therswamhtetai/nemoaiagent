---
phase: quick-fix
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
user_setup: []
must_haves:
  truths:
    - "Web API Router saves to memory without blocking response"
    - "Errors in router do not crash the workflow or hang the chat"
    - "Chat response is received within 5 seconds"
  artifacts:
    - path: "workflows/o5t83JWF11dsSfyi.json"
      provides: "Web API Router workflow"
  key_links:
    - from: "Web API Router"
      to: "Memory Save Workflow"
      via: "Execute Workflow Node"
---

<objective>
Fix regressions in Web API Router (o5t83JWF11dsSfyi) caused by recent async optimization attempts.
Specifically address:
1. "Save to Long-term Memory" blocking or failing.
2. Error handling gaps causing silent failures.

Purpose: Restore stability while keeping the performance gains intended.
Output: Updated and deployed Web API Router workflow.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
@~/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
# Workflow ID: o5t83JWF11dsSfyi (Web API Router)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Memory Saving Async Logic</name>
  <files>workflows/o5t83JWF11dsSfyi.json</files>
  <action>
    1. Fetch current Web API Router workflow: `n8n_get_workflow --id "o5t83JWF11dsSfyi"`
    2. Locate the "Save to Long-term Memory" node (or equivalent Execute Workflow node).
    3. Check its settings:
       - Ensure it is NOT blocking the main response path if it's meant to be async.
       - If it was moved to a separate branch, ensure that branch handles errors and doesn't terminate the main execution prematurely.
       - Correct any "Execute Once" or loop issues.
    4. Save the fixed workflow definition locally as `web_api_router_fixed.json`.
  </action>
  <verify>grep "Save to Long-term Memory" web_api_router_fixed.json</verify>
  <done>Workflow JSON has corrected memory saving logic</done>
</task>

<task type="auto">
  <name>Task 2: Reinforce Error Handling</name>
  <files>workflows/o5t83JWF11dsSfyi.json</files>
  <action>
    1. In `web_api_router_fixed.json`, analyze the Error Trigger or catch paths.
    2. Ensure that if the AI Agent or Tools fail, a fallback message is returned to the user (instead of timeout).
    3. Add or update the Error Trigger node to log to ntfy/Supabase if missing.
    4. Validate the workflow: `n8n_validate_workflow --file web_api_router_fixed.json`.
  </action>
  <verify>n8n_validate_workflow --file web_api_router_fixed.json</verify>
  <done>Workflow validates with improved error handling</done>
</task>

<task type="auto">
  <name>Task 3: Deploy and Verify</name>
  <files>workflows/o5t83JWF11dsSfyi.json</files>
  <action>
    1. Deploy the fixed workflow: `n8n_update_workflow --id "o5t83JWF11dsSfyi" --file web_api_router_fixed.json`
    2. Activate it: `n8n_activate_workflow --id "o5t83JWF11dsSfyi" --active true`
  </action>
  <verify>
    # Can't easily curl the webhook from here as it's external, 
    # but we can verify deployment success via tool output.
    echo "Deployment complete - User should test chat manually."
  </verify>
  <done>Workflow updated on server</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed Web API Router (Async Save + Error Handling)</what-built>
  <how-to-verify>
    1. Send a message to the bot: "Hello, testing async save."
    2. Check if response is fast (< 5s).
    3. Check if "Memory Saved" appears in logs/Supabase later.
    4. Send a "break me" message or check logs for error resilience.
  </how-to-verify>
  <resume-signal>Type "approved" if chat works smoothly.</resume-signal>
</task>

</tasks>

<verification>
- [ ] Memory saving happens without blocking response
- [ ] Errors are caught and handled gracefully
</verification>

<success_criteria>
- Web API Router updated with fixes
- Chat response remains fast
- No dropped errors
</success_criteria>

<output>
After completion, create .planning/quick/001-fix-router-saving-issues/001-SUMMARY.md
</output>
