# Daily Briefing Dynamic Workflow Architecture

## Project State Analysis

**Date**: January 27, 2026
**Project**: NemoAI Personal Assistant System
**Current Phase**: 01-daily-briefing-refactor

---

## Current State Assessment

### Existing Daily Briefing Workflow
- **Workflow ID**: `mBFd8G3ujZjK7-N`
- **Type**: Standalone scheduled workflow
- **Trigger**: Schedule (8 AM, 9 AM per user)
- **Architecture**: Hardcoded user_id chains

### Current Problems Identified
1. **Hardcoded Users**: 5 users = 30+ duplicate nodes (6 nodes per user)
2. **No Chat Integration**: Not callable from Web API Router
3. **Maintenance Burden**: Adding users requires manual workflow updates
4. **Scalability Issues**: Linear growth in nodes with user count

### Existing Node Chain Per User
```
Schedule Trigger → Supabase Get Tasks → Code Categorize → LLM Generate → HTTP ntfy → (repeat per user)
```

---

## Target Architecture Design

### New Dynamic Workflow Structure
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Schedule      │    │   Manual/Webhook │    │   Web API Router │
│   Trigger       │    │   Trigger        │    │   Tool Call      │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └───────────┬──────────┴───────────────────────┘
                      ▼
              ┌─────────────────┐
              │  Get Active     │
              │  Users Query    │
              └─────────┬───────┘
                      ▼
              ┌─────────────────┐
              │  Split In       │
              │  Batches Loop   │
              └─────────┬───────┘
                      ▼
              ┌─────────────────┐
              │  Process User    │
              │  Briefing       │
              └─────────┬───────┘
                      ▼
              ┌─────────────────┐
              │  Send via ntfy  │
              └─────────┬───────┘
                      ▼
              ┌─────────────────┐
              │  Log Execution  │
              └─────────────────┘
```

### Key Improvements
1. **Dynamic User Iteration**: Single query → loop over active users
2. **Multi-Trigger Support**: Schedule + Manual + Webhook integration
3. **Scalable Architecture**: Constant node count regardless of user count
4. **Chat Integration**: Tool callable from main router

---

## Detailed Implementation Plan

### Phase 1: Database Analysis & User Query Design

**Objective**: Design efficient user queries and understand current data structure

**Tasks**:
1. **Query Active Users Schema**
   - Analyze users table structure
   - Identify active user criteria (is_active=true)
   - Test query performance for user iteration

2. **Task Query Optimization**
   - Review current task fetching logic
   - Optimize for batch processing
   - Design query for user-specific task filtering

**Expected Outputs**:
- SQL queries for user iteration
- Task fetching optimization
- Performance benchmarks

### Phase 2: Core Loop Architecture

**Objective**: Build the main loop structure with user iteration

**Tasks**:
1. **Multi-Trigger Integration**
   - Schedule trigger (maintain existing timing)
   - Manual trigger (testing/ad-hoc execution)
   - Webhook trigger (integration point for chat)

2. **User Fetch & Batch Setup**
   - Supabase query: `SELECT id, username, full_name, preferences FROM users WHERE is_active = true`
   - Split In Batches node: Process 1 user per batch
   - Error handling for query failures

3. **Loop Structure Implementation**
   - Process User Briefing sub-workflow
   - Batch processing with individual user handling
   - Loop completion and aggregation

**Expected Outputs**:
- Dynamic user iteration workflow
- Batch processing configuration
- Error handling patterns

### Phase 3: Briefing Generation Refactor

**Objective**: Migrate briefing logic to work with dynamic user context

**Tasks**:
1. **Task Fetching Adaptation**
   - Parameterize user_id in task queries
   - Maintain existing task categorization logic
   - Preserve output format for consistency

2. **LLM Generation Enhancement**
   - Context-aware prompting with user info
   - Maintain existing briefing structure
   - Add user preference integration

3. **Notification System Update**
   - Dynamic ntfy channel per user
   - User-specific message formatting
   - Error handling for notification failures

**Expected Outputs**:
- Refactored briefing generation
- User-aware notification system
- Consistent output formatting

### Phase 4: Web API Router Integration

**Objective**: Add daily briefing as callable tool from main chat system

**Tasks**:
1. **Tool Registration**
   - Add daily briefing tool to Web API Router AI Agent
   - Define tool description and parameters
   - Handle both "briefing" and "today's summary" triggers

2. **Sub-workflow Creation**
   - Execute Workflow trigger for daily briefing
   - Parameter passing (user_id, format preferences)
   - Response formatting for chat interface

3. **Error Handling & Validation**
   - User authentication checks
   - Rate limiting for on-demand briefings
   - Graceful error responses

**Expected Outputs**:
- Integrated chat tool
- Sub-workflow execution pattern
- Robust error handling

### Phase 5: Testing & Migration

**Objective**: Comprehensive testing and safe migration from old workflow

**Tasks**:
1. **Parallel Testing**
   - Deploy new workflow alongside existing
   - Compare outputs for consistency
   - Performance benchmarking

2. **User Validation**
   - Test with actual user data
   - Verify notification delivery
   - Validate chat integration

3. **Migration Procedure**
   - Backup existing workflow configuration
   - Scheduled trigger migration timing
   - Rollback plan documentation

**Expected Outputs**:
- Test results and validation
- Migration checklist
- Rollback procedures

---

## Technical Specifications

### Database Queries

**Active Users Query**:
```sql
SELECT id, username, full_name, email, 
       (SELECT preference_value FROM user_preferences WHERE user_id = users.id AND preference_key = 'notification_channel') as notification_channel,
       (SELECT preference_value FROM user_preferences WHERE user_id = users.id AND preference_key = 'briefing_time') as briefing_time
FROM users 
WHERE is_active = true 
ORDER BY created_at ASC;
```

**User Tasks Query**:
```sql
SELECT id, title, description, status, priority, due_date, created_at, updated_at
FROM tasks 
WHERE user_id = $1 
  AND status IN ('pending', 'in_progress')
  AND (due_date IS NULL OR due_date >= CURRENT_DATE)
ORDER BY priority DESC, due_date ASC;
```

### Workflow Node Configuration

**Split In Batches**:
- Batch size: 1 (process one user at a time)
- Options: Reset for each batch, Continue on fail

**Supabase Node Configuration**:
- Operation: Run Query
- Credential: NemoAIDatabase (JbItbwVcQiGCLFAC)
- Query: Parameterized with user_id from batch

**LLM Configuration**:
- Model: models/gemini-3-flash-preview
- Credential: Google Gemini (qJ3tJlGTxwiZCORz)
- System Prompt: ZERO MARKDOWN policy maintained

### Notification Integration

**ntfy Configuration**:
- Base URL: https://ntfy.sh
- Topic per user: nemo-{{username}} (dynamic)
- Priority: high for scheduled, default for on-demand
- Tags: briefcase, calendar

### Error Handling Patterns

**Database Errors**:
- Log query errors with context
- Continue with next user on individual failures
- Aggregate error summary at completion

**Notification Errors**:
- Retry failed notifications (max 3 attempts)
- Fallback to email if ntfy fails
- Log delivery status per user

**LLM Errors**:
- Fallback to template-based briefing
- Log generation failures
- Continue with next user

---

## Success Criteria

### Functional Requirements
- [ ] Dynamic user iteration working for unlimited users
- [ ] Scheduled execution maintains existing timing
- [ ] On-demand briefing accessible via chat ("Today's briefing")
- [ ] Notification delivery to correct user channels
- [ ] Consistent briefing format and quality

### Performance Requirements
- [ ] Response time < 30 seconds per user
- [ ] Workflow execution completes within 5 minutes for all users
- [ ] Database queries optimized for concurrent access
- [ ] Memory usage stays within n8n limits

### Maintainability Requirements
- [ ] Adding new users requires no workflow changes
- [ ] Briefing template easily modifiable
- [ ] Error monitoring and logging comprehensive
- [ ] Documentation for troubleshooting

### Migration Requirements
- [ ] Zero downtime during migration
- [ ] Existing user preferences preserved
- [ ] Historical briefing data accessible
- [ ] Rollback procedure tested and documented

---

## Risk Assessment & Mitigation

### High Risk Items

**Database Query Performance**:
- **Risk**: User iteration query slows with many users
- **Mitigation**: Add pagination, optimize indexes, implement caching

**LLM Rate Limits**:
- **Risk**: Gemini API rate limiting during bulk execution
- **Mitigation**: Implement delays, batch processing, rate limit monitoring

**Notification Delivery**:
- **Risk**: ntfy failures or rate limiting
- **Mitigation**: Retry logic, email fallback, delivery tracking

### Medium Risk Items

**Workflow Complexity**:
- **Risk**: Increased complexity introduces bugs
- **Mitigation**: Incremental testing, error handling, monitoring

**User Preference Migration**:
- **Risk**: Existing user settings lost during migration
- **Mitigation**: Comprehensive backup, validation scripts

### Low Risk Items

**Chat Integration**:
- **Risk**: Tool integration conflicts with existing router
- **Mitigation**: Isolated testing, gradual rollout

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
1. Deactivate new daily briefing workflow
2. Reactivate original workflow (ID: mBFd8G3ujZjK7-N)
3. Remove daily briefing tool from Web API Router
4. Verify scheduled execution resumes

### Full Rollback (< 30 minutes)
1. Restore workflow configurations from backup
2. Revert Web API Router to previous version
3. Clear any cached user data in new workflow
4. Test all user briefing deliveries
5. Monitor system stability for 1 hour

### Data Recovery
- User data: No modification required (read-only operations)
- Preferences: Backed up before migration
- Execution logs: Preserved in both systems
- Notification history: Maintained in ntfy service

---

## Implementation Timeline

### Week 1: Foundation (Phases 1-2)
- Day 1-2: Database analysis and query optimization
- Day 3-4: Core loop architecture implementation
- Day 5: Initial testing and validation

### Week 2: Integration (Phases 3-4)
- Day 1-3: Briefing generation refactor
- Day 4-5: Web API Router integration

### Week 3: Testing & Migration (Phase 5)
- Day 1-2: Comprehensive testing
- Day 3: User validation
- Day 4: Migration execution
- Day 5: Monitoring and optimization

---

## Next Steps

1. **Immediate**: Export current daily briefing workflow for analysis
2. **Week 1 Start**: Begin database query optimization
3. **Parallel**: Set up development environment for testing
4. **Continuous**: Document progress and update this plan

---

*Last Updated: January 27, 2026*
*Architect: Daily Briefing Refactoring Team*