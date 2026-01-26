# GSD Project State

## Current Status
- **Project**: Daily Briefing Enhancement
- **Phase**: 01 (Daily Briefing Refactoring)
- **Plan**: 02-core-loop (Deployed)
- **Status**: In progress
- **Last activity**: 2026-01-27 - Deployed workflow mBFd8G3ujZjK7-N

## Project Overview
Refactoring the Daily Briefing workflow to support dynamic user scaling and on-demand execution.

## Phase Structure
1. **Phase 01**: Daily Briefing Refactoring
   - **01 Analysis**: Architecture Design & Validation (Completed)
   - **02 Core Loop**: Implement Monolithic Loop Architecture (Deployed)
   - **03 Integration**: Connect to Web API Router
   - **04 Testing**: Migration and Verification

## Key Decisions
- **Architecture**: Adopt Master/Worker pattern (Pattern 2 + 3).
- **Data Flow**: Use Sub-workflow for single-user processing to maintain context.
- **On-Demand**: Worker workflow will be exposed as a Tool for the Chat Router.

## Next Steps
1. Execute Plan 03: Integration with Web API Router.
2. Test with sample users.

## Current System State

### Architecture Overview
- **Frontend:** Next.js with TypeScript and Tailwind CSS
- **Backend:** n8n workflows hosted at https://admin.orcadigital.online  
- **Database:** Supabase with PostgreSQL
- **Authentication:** JWT-based system
- **Notifications:** ntfy service for push notifications

### Active Workflows
- **Web API Router (Main Brain):** ID `o5t83JWF11dsSfyi` - Routes user messages
- **Ops Secretary:** ID `M9qgqvtsa5nuHUQ3` - Task management
- **Business Strategist:** ID `DvvZiJ0n2HvbkAax` - Business analysis
- **Market Intel Agent:** ID `Td29kBFdqAqSxBpo` - Web search
- **Daily Briefing (Enhanced V2):** ID `mBFd8G3ujZjK7-N` - **DEPLOYED** (Dynamic user scheduling)
- **Task Manager:** ID `JWwLi4Zo4Zqh7igS` - Task CRUD operations
- **Calendar Manager:** ID `GTRv70JqhEekrbLN` - Google Calendar integration
- **Contact Manager:** ID `M61NswfHOOsFxrL6` - Contact operations
- **Preference Manager:** ID `7g0eMB0yVqi8yMmQ` - User preferences
- **Memory Tools:** Save and Retrieve knowledge
- **Social Scout:** ID `HCV-51qLaCdcxHGx2yBcO` - Facebook scraping
- **Voice Pipeline:** ID `JuKoBjeKk5F-e6KNVtR4t` - Audio processing
- **Auth System:** ID `OPF7ii_KCDkOlZiJqT-BE` - User validation
- **Idea Manager:** ID `rk_RR1SePy-TNVo68mZRu` - Ideas CRUD

### Database Schema
- **Users:** 5 active users (current)
- **Tasks:** ~50 total tasks
- **Ideas:** User-generated business ideas
- **Contacts:** Contact management
- **Preferences:** User settings and configurations
- **Knowledge Base:** Vector embeddings with pgvector
- **Conversations:** Chat history and thread management

---

## Current Priorities

### Priority A: Response Speed Optimization
**Status:** Not Started  
**Goal:** Reduce response time from 10-20 seconds to 3-5 seconds

**Problems:**
- Memory auto-save blocks response (adds 3-5 sec)
- AI Agent classifies every message (even simple ones)
- No caching for common queries

**Tasks:**
- [ ] Make "Save to Long-term Memory" async
- [ ] Add pre-classification Switch node for simple commands
- [ ] Reduce `contextWindowLength` from 10 to 5-6
- [ ] Add caching for gold price, dollar rate queries

### Priority B: Daily Briefing Dynamic Architecture (CURRENT)
**Status:** Phase 01 In Progress  
**Goal:** Eliminate hardcoded user chains with scalable loop-based system

**Problems:**
- Hardcoded user_ids (5 users = 30+ duplicate nodes)
- Not callable from main chat interface
- Only schedule-triggered

**Tasks:**
- [x] Analyze current workflow and design V2 architecture (Phase 01-01)
- [x] Refactor to single dynamic workflow with Loop (Phase 01-02)
- [ ] Add `daily_briefing` tool to Web API Router (Phase 01-03)
- [ ] Support on-demand requests via chat (Phase 01-03)

### Priority C: Reminder System
**Status:** Not Started  
**Goal:** Users can set specific time reminders via chat

**Requirements:**
- Add `reminders` table or `reminder_time` column
- New workflow: Reminder Checker (every 5 mins)
- Integration with ops_secretary for time extraction
- Push notifications via ntfy

---

## Technical Debt Assessment

### High Priority Issues
1. **Daily Briefing Hardcoding:** 30+ nodes for 5 users
2. **Response Speed:** 10-20 second response times
3. **Memory Blocking:** Synchronous save operations

### Medium Priority Issues
1. **Error Handling:** Inconsistent across workflows
2. **Monitoring:** Limited visibility into performance
3. **User Preferences:** Limited configuration options

### Low Priority Issues
1. **Documentation:** Some workflows lack documentation
2. **Testing:** Limited automated testing coverage
3. **Code Duplication:** Some repeated patterns

---

## Current Development Environment

### Available Tools and Frameworks
- **n8n MCP Tools:** Workflow management and validation
- **n8n Skills Repository:** 7 complementary skills for development
- **Supabase Client:** Database operations and real-time features
- **Google Gemini:** LLM integration for AI responses
- **ntfy Service:** Push notification delivery

### Development Infrastructure
- **Version Control:** Git repository with workflow files
- **Development Planning:** GSD planner with structured phases
- **Documentation:** Comprehensive CLAUDE.md with system details
- **Testing:** Manual testing framework with validation procedures

### External Integrations
- **Google Calendar:** Event management
- **Apify:** Facebook page scraping
- **Tavily:** Web search API
- **Google Gemini:** AI model provider

---

## User Base Analysis

### Current Users
- **Active Users:** 5
- **Primary Language:** Myanmar (with some English)
- **Usage Patterns:** Daily briefings, task management, business analysis
- **Feedback:** Request for faster response times

### Growth Potential
- **Target Market:** Personal productivity and business management
- **Scaling Needs:** Support unlimited users without manual workflow changes
- **Feature Requests:** Voice interface, advanced analytics, team features

---

## Performance Metrics

### Current Performance
- **Daily Briefing:** Works but inefficient (hardcoded users)
- **Chat Response Time:** 10-20 seconds (needs improvement)
- **Task Management:** Functional but slow
- **Notification Delivery:** Reliable via ntfy

### Target Performance
- **Daily Briefing:** < 5 minutes total execution
- **Chat Response Time:** 3-5 seconds
- **Task Management:** < 2 seconds per operation
- **Notification Delivery:** < 10 seconds

---

## Risk Assessment

### Technical Risks
1. **Scaling Limitations:** Hardcoded user management
2. **Performance Degradation:** As user base grows
3. **API Rate Limits:** LLM and external service limits

### Operational Risks
1. **Single Point of Failure:** n8n instance dependency
2. **Data Integrity:** Limited backup procedures
3. **User Experience:** Response time issues

### Business Risks
1. **Competition:** AI assistant market growing
2. **User Retention:** Performance issues may impact retention
3. **Development Resources:** Limited team for maintenance

---

## Opportunities

### Technical Opportunities
1. **Architecture Improvements:** Dynamic workflows, better caching
2. **Performance Optimization:** Async operations, smart routing
3. **Feature Expansion:** Voice interface, team collaboration

### Business Opportunities
1. **Market Expansion:** Personal productivity, small business
2. **Service Integration:** More third-party integrations
3. **AI Enhancement:** Advanced AI models and capabilities

---

## Current Development Focus

### Daily Briefing Refactoring (Phase 01)
**Status:** Execution Started (Plan 02 Deployed)

**Key Benefits:**
- Eliminate hardcoded user chains
- Support unlimited users without workflow changes
- Add on-demand briefing capability
- Improve system maintainability

**Implementation Approach:**
- Database query optimization
- Dynamic user iteration with Split In Batches
- Multi-trigger support (schedule + manual + webhook)
- Integration with Web API Router for chat access

**Success Criteria:**
- Zero missed briefings during migration
- Performance maintained or improved
- On-demand briefing functionality working
- Scalable architecture supporting unlimited users

---

## Next Steps

### Immediate (This Week)
1. **Execute Phase 01-02:** Core loop architecture development (DEPLOYED)
2. **Execute Phase 01-03:** Briefing generation refactor
3. **Execute Phase 01-04:** Web API Router integration
4. **Execute Phase 01-05:** Testing and migration

### Short-term (Next Week)
1. **Monitor:** Post-migration system stability
2. **Collect:** User feedback and performance metrics
3. **Execute Phase 02-01:** Response speed optimization (Priority A)
4. **Execute Phase 02-02:** Reminder system implementation (Priority C)

### Medium-term (Next Month)
1. **Phase 03:** Reliability and Monitoring
2. **Phase 04:** Advanced features implementation
3. **Phase 05:** Deployment and user feedback integration

---

## Resource Allocation

### Development Focus
- **60%** Daily Briefing Refactoring (current priority)
- **25%** Response Speed Optimization (next priority)
- **15%** Technical Debt Resolution (ongoing)

### Infrastructure Investment
- Database optimization and monitoring
- Workflow performance tools
- Automated testing framework
- User experience analytics

---

*State Analysis Complete: Ready for Phase Execution*  
*Last Updated: January 27, 2026*  
*Next Review: February 1, 2026*
