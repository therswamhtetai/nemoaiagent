---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - components/NotificationCenter.tsx
autonomous: true

must_haves:
  truths:
    - "Notification titles are readable at text-base size"
    - "Notification body text is readable at text-sm size"
    - "Timestamps are readable at text-xs size"
    - "Clicking a notification opens a modal overlay with full details"
    - "Modal can be closed via X button or clicking outside"
  artifacts:
    - path: "components/NotificationCenter.tsx"
      provides: "Enhanced notifications with larger fonts and modal popup"
      contains: "Dialog"
  key_links:
    - from: "notification click handler"
      to: "Dialog component"
      via: "open state controls Dialog visibility"
      pattern: "<Dialog open="
---

<objective>
Improve notification readability and UX by increasing font sizes and replacing inline expansion with a modal popup.

Purpose: Users have complained that notification text is too small and the inline expansion is cramped.
Output: Enhanced NotificationCenter with larger fonts and modal dialog for viewing notification details.
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@components/NotificationCenter.tsx
@components/ui/dialog.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Increase notification font sizes</name>
  <files>components/NotificationCenter.tsx</files>
  <action>
Update the following Tailwind classes for better readability:

1. Line 415 - Title font: Change `text-sm` to `text-base`
   ```tsx
   <h3 className={`text-base font-medium leading-tight ...
   ```

2. Line 419 - Timestamp: Change `text-[10px]` to `text-xs`
   ```tsx
   <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
   ```

3. Line 424 - Body text: Change `text-xs` to `text-sm`
   ```tsx
   <p className={`text-sm mt-1 transition-all ...
   ```

4. Line 432 - Type label in expanded view: Change `text-[10px]` to `text-xs`
   ```tsx
   <span className="text-xs uppercase tracking-wider text-white/30">
   ```
  </action>
  <verify>
Visual inspection: Font sizes should be noticeably larger in the notification list.
  </verify>
  <done>
All notification text elements use larger, more readable font sizes (text-base for titles, text-sm for body, text-xs for metadata).
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace inline expansion with modal popup</name>
  <files>components/NotificationCenter.tsx</files>
  <action>
1. Add Dialog import at top of file:
   ```tsx
   import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
     DialogDescription,
   } from '@/components/ui/dialog'
   ```

2. Rename state variable for clarity (line 64):
   - Change `expandedId` to `selectedNotification`
   - Change type from `string | null` to `Notification | null`

3. Update `toggleNotification` function (lines 250-259):
   - Instead of toggling expandedId, find the full notification object and set it
   - Keep the markAsRead behavior for unread notifications
   ```tsx
   const openNotificationModal = (notification: Notification) => {
     setSelectedNotification(notification)
     if (!notification.is_read) {
       markAsRead(notification.id)
     }
   }
   
   const closeNotificationModal = () => {
     setSelectedNotification(null)
   }
   ```

4. Update the notification click handler (line 396):
   - Change from `onClick={() => toggleNotification(notification.id, notification.is_read)}`
   - To: `onClick={() => openNotificationModal(notification)}`

5. Remove the inline expansion logic:
   - Remove `const isExpanded = expandedId === notification.id` (line 391)
   - Remove the conditional styling based on `isExpanded` in the card className
   - Remove the inline expanded content section (lines 429-441)
   - Keep body text as single-line preview with `line-clamp-1`

6. Add Dialog modal at the end of the component (before the closing `</div>` of the main container, around line 449):
   ```tsx
   {/* Notification Detail Modal */}
   <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && closeNotificationModal()}>
     <DialogContent className="bg-[#1C1917] border-white/10 text-white max-w-md">
       <DialogHeader>
         <div className="flex items-center gap-3 mb-2">
           {selectedNotification && (() => {
             const IconComponent = typeIcons[selectedNotification.type] || Bell
             const iconColor = typeColors[selectedNotification.type] || 'text-white/60'
             return (
               <div className={`p-2 rounded-lg bg-white/10 ${iconColor}`}>
                 <IconComponent className="w-5 h-5" />
               </div>
             )
           })()}
           <span className="text-xs uppercase tracking-wider text-white/40">
             {selectedNotification?.type}
           </span>
         </div>
         <DialogTitle className="text-lg font-semibold text-white">
           {selectedNotification?.title}
         </DialogTitle>
         <DialogDescription className="text-sm text-white/70 whitespace-pre-wrap mt-2">
           {selectedNotification?.body}
         </DialogDescription>
       </DialogHeader>
       <div className="pt-4 border-t border-white/10 flex items-center justify-between">
         <span className="text-xs text-white/40">
           {selectedNotification && formatTimeAgo(selectedNotification.created_at)}
         </span>
         {selectedNotification && !selectedNotification.is_read && (
           <span className="text-xs text-green-400 flex items-center gap-1">
             <Check className="w-3 h-3" /> Marked as read
           </span>
         )}
       </div>
     </DialogContent>
   </Dialog>
   ```

7. Simplify the notification card styling (remove isExpanded conditional):
   ```tsx
   className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
     notification.is_read
       ? 'bg-transparent border-transparent hover:bg-white/5'
       : 'bg-white/[0.03] border-white/10 hover:border-white/20'
   }`}
   ```
  </action>
  <verify>
1. Click a notification - modal should open with full details
2. Click X button - modal should close
3. Click outside modal (on overlay) - modal should close
4. Unread notifications should still be marked as read when opened
  </verify>
  <done>
Notifications open in a centered modal dialog instead of inline expansion. Modal shows title, body, type icon, and timestamp with proper dark theme styling. Click-outside and X button both close the modal.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` - TypeScript compilation passes
2. Visual check: Notification list items have larger, more readable text
3. Functional check: Click any notification to open modal, close via X or click outside
4. State check: Unread notifications marked as read when modal opens
</verification>

<success_criteria>
- All font sizes increased (title: text-base, body: text-sm, timestamp/type: text-xs)
- Modal popup replaces inline expansion
- Modal displays: type icon, type label, title, body, timestamp
- Modal closes via X button and click-outside
- Unread → read transition still works when opening modal
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/002-notification-font-size-and-popup-modal/002-SUMMARY.md`
</output>
