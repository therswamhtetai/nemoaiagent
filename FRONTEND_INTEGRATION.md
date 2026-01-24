# FRONTEND_INTEGRATION.md - NemoAI API Reference

## 🖥️ Overview

**Base URL**: `https://admin.orcadigital.online/webhook/`

---

## 🔌 API Endpoints

### Chat
`POST /webhook/chat`
```typescript
// Request
{ user_id: string, message: string, thread_id?: string, name?: string }
// Response
{ content: string, thread_id: string }
```

### Voice Chat
`POST /webhook/voice-chat` (multipart/form-data)
```typescript
// Request
{ user_id: string, thread_id?: string, audio: File }
// Response
{ reply: string }
```

### Auth
`GET /webhook/auth/login?username=...&password=...`
```typescript
// Response
{ success: boolean, user_id?: string, full_name?: string }
```

### Competitor Monitor
`POST /webhook/monitor-competitor`
```typescript
// Request
{ trigger: 'manual_refresh', user_id: string, link: string }
// Response
{ output: string }
```

---

## 📊 Database Schemas

```typescript
interface User {
  id: string; username: string; full_name: string;
  email: string | null; is_active: boolean;
  created_at: string; updated_at: string;
}

interface Task {
  id: string; user_id: string; title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string; updated_at: string;
}

interface Idea {
  id: string; user_id: string; title: string;
  description: string;
  type: 'business' | 'content' | 'marketing' | 'product';
  status: 'draft' | 'in_review' | 'approved' | 'archived';
  tags: string[] | null;
  created_at: string; updated_at: string;
}

interface Contact {
  id: string; user_id: string; name: string;
  email: string | null; phone: string | null;
  company: string | null; role: string | null;
  created_at: string;
}

interface Competitor {
  id: string; user_id: string; name: string;
  platform: string; url: string;
  last_scraped_at: string | null;
}

interface SocialStats {
  id: string; competitor_id: string;
  follower_count: number; viral_score: number;
  summary_analysis: string; is_running_ads: boolean;
  scraped_at: string;
}

interface Conversation {
  id: string; user_id: string; thread_id: string;
  role: 'user' | 'assistant'; content: string;
  created_at: string;
}

interface QuickPrompt {
  id: string; user_id: string; icon: string;
  text: string; sort_order: number;
}
```

---

## 🆕 Reminders Module (Planned)

### Schema
```typescript
interface Reminder {
  id: string;
  user_id: string;
  task_id: string | null;     // Optional link
  title: string;
  remind_at: string;          // ISO timestamp
  location: string | null;
  category: 'work' | 'personal' | 'meeting' | 'deadline';
  is_sent: boolean;
  is_cancelled: boolean;
  created_at: string;
}
```

### UI Design: Minimal Timeline

**Reference Style:**
```
Today, Jan 24

◐ 10:30 AM  Meeting with Karla              ← past (faded)
  │         Anomali Coffee
  │         LIFE
  │
● 1:00 PM   Project Review                   ← current (highlighted)
  │         In 18 minutes
  │         Room 3111
  │         WORK
  │
○ 3:00 PM   Team Standup                     ← upcoming
  │         Google Meet
  │         MEETING

Tomorrow, Jan 25

○ 9:00 AM   Submit Report
  │         DEADLINE
```

**Design Elements:**
| Element | Style |
|---------|-------|
| Timeline | Vertical line with dots |
| Past items | ◐ faded/grayed out |
| Current | ● highlighted, bold title |
| Upcoming | ○ normal |
| Time | Left side, subtle gray |
| Title | Primary text, bold for current |
| Location | Secondary gray text |
| Category | Colored badge pill |
| Relative time | "In 18 minutes" for imminent |

**Category Colors:**
- `WORK` → Blue #3B82F6
- `PERSONAL` → Green #10B981
- `MEETING` → Purple #8B5CF6
- `DEADLINE` → Red #EF4444

### API
```typescript
// Direct Supabase
const { data } = await supabase
  .from('reminders')
  .select('*')
  .eq('user_id', userId)
  .eq('is_cancelled', false)
  .order('remind_at', { ascending: true });

// Or webhook: POST /webhook/reminders
{ action: 'list' | 'create' | 'cancel', user_id: string, ... }
```

---

*v2.0 | January 2026*
