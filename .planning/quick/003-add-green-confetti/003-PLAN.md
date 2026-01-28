---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - app/tasks/page.tsx
  - package.json
autonomous: true

must_haves:
  truths:
    - "Green confetti animation plays when task is marked complete"
    - "Confetti does NOT play when task is unmarked (uncompleted)"
    - "Confetti disappears after ~3 seconds"
  artifacts:
    - path: "app/tasks/page.tsx"
      provides: "Confetti integration with toggle logic"
      contains: "react-confetti"
  key_links:
    - from: "toggleTask function"
      to: "showConfetti state"
      via: "conditional trigger on completion only"
      pattern: "!completed.*setShowConfetti\\(true\\)"
---

<objective>
Add celebratory green confetti animation when a task is completed in the Tasks page.

Purpose: Enhance user experience with visual feedback for task completion
Output: Tasks page with react-confetti integration triggered on task completion
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
@~/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/tasks/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install react-confetti package</name>
  <files>package.json</files>
  <action>
    Run `npm install react-confetti` to add the confetti animation library.
    This library provides a canvas-based confetti component that is responsive and performant.
  </action>
  <verify>`npm ls react-confetti` shows the package is installed</verify>
  <done>react-confetti appears in package.json dependencies</done>
</task>

<task type="auto">
  <name>Task 2: Integrate confetti animation into Tasks page</name>
  <files>app/tasks/page.tsx</files>
  <action>
    Modify app/tasks/page.tsx to add green confetti on task completion:

    1. Add imports at top:
       - `import Confetti from 'react-confetti'`
       - `import { useWindowSize } from 'react-use'` OR track window size manually with useState/useEffect

    2. Add state for confetti visibility (after line 23):
       ```typescript
       const [showConfetti, setShowConfetti] = useState(false)
       ```

    3. Add window size tracking (for responsive canvas):
       ```typescript
       const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
       
       useEffect(() => {
         setWindowSize({ width: window.innerWidth, height: window.innerHeight })
         const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
         window.addEventListener('resize', handleResize)
         return () => window.removeEventListener('resize', handleResize)
       }, [])
       ```

    4. Modify toggleTask function (lines 54-60) to trigger confetti ONLY when completing:
       ```typescript
       const toggleTask = async (id: string, completed: boolean) => {
         const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", id)

         if (!error) {
           setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !completed } : task)))
           
           // Trigger confetti only when marking task as complete (not when uncompleting)
           if (!completed) {
             setShowConfetti(true)
             setTimeout(() => setShowConfetti(false), 3000)
           }
         }
       }
       ```

    5. Add Confetti component inside the outer div (after line 71, before header):
       ```tsx
       {showConfetti && (
         <Confetti
           width={windowSize.width}
           height={windowSize.height}
           recycle={false}
           numberOfPieces={200}
           colors={['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac']}
         />
       )}
       ```

    Green color palette uses Tailwind green shades (500, 600, 700, 800, 400, 300) for cohesive theming.
  </action>
  <verify>
    1. Run `npm run build` - no TypeScript errors
    2. Run dev server and complete a task - green confetti appears
    3. Uncheck a completed task - NO confetti appears
    4. Confetti stops after ~3 seconds
  </verify>
  <done>
    - Completing a task triggers green confetti burst
    - Uncompleting a task does NOT trigger confetti
    - Confetti automatically stops after 3 seconds
    - No console errors or TypeScript issues
  </done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. Manual test: Check off a task → green confetti explodes
3. Manual test: Uncheck a task → no confetti
4. Confetti respects window dimensions on resize
</verification>

<success_criteria>
- react-confetti installed and imported
- Green confetti (6 shades) triggers on task completion only
- Confetti auto-hides after 3 seconds
- No performance issues or console errors
</success_criteria>

<output>
After completion, create `.planning/quick/003-add-green-confetti/003-SUMMARY.md`
</output>
