# NemoAI Project Roadmap

**Project:** Personal AI Assistant System with n8n Workflows  
**Architecture:** Next.js Frontend + n8n Backend + Supabase Database  
**Current Focus:** Reminder System Implementation (Phase 03)  

---

## Phase 01: Daily Briefing Dynamic Workflow Architecture

**Status:** Completed
**Goal:** Eliminate hardcoded user chains by implementing dynamic loop-based daily briefing workflow that scales to unlimited users.

**Current Problems:**
- Hardcoded user_ids (5 users = 30+ duplicate nodes)
- Not callable from main chat interface
- Only schedule-triggered, no on-demand capability
- Linear scaling - each new user adds 6 nodes

**Target State:**
- Single dynamic workflow with loop iteration
- Constant node count regardless of user count
- Both scheduled and on-demand execution
- Integrated with Web API Router for chat access
- Scalable to unlimited users without workflow changes

**Plans:** 1 active plan (analysis), others TBD

- [ ] 01-daily-briefing-v2/01-analysis-PLAN.md — Analyze and Architect V2

### Plan Structure

| Wave | Plans | Description |
|------|-------|-------------|
| Wave 1 | 01-01, 01-02 | Foundation: Database optimization + Core loop architecture |
| Wave 2 | 01-03, 01-04 | Integration: Briefing generation + Web API Router |
| Wave 3 | 01-05 | Migration: Testing + Safe deployment |

### Plan Details

**Phase 01-01: Database Analysis & Query Optimization** (Wave 1)
- Analyze current users and tasks table structure
- Optimize queries for dynamic user iteration
- Design efficient task fetching and categorization
- Performance benchmarking for scaling

**Phase 01-02: Core Loop Architecture** (Wave 1)
- Build multi-trigger workflow (schedule + manual + webhook)
- Implement dynamic user iteration with Split In Batches
- Add error handling and batch processing
- Create aggregation and completion logic

**Phase 01-03: Briefing Generation Refactor** (Wave 2)
- Migrate task categorization to dynamic context
- Integrate user-aware LLM briefing generation
- Implement personalized notification delivery
- Add retry logic and email fallback

**Phase 01-04: Web API Router Integration** (Wave 2)
- Create on-demand briefing sub-workflow
- Add daily briefing tool to main chat router
- Implement authentication and rate limiting
- Enable "Today's briefing" chat commands

**Phase 01-05: Testing & Migration** (Wave 3)
- Parallel testing and output validation
- Performance benchmarking comparison
- Zero-downtime migration execution
- Post-migration monitoring and optimization

### Success Metrics

**Functional Requirements:**
- [ ] Dynamic user iteration supporting unlimited users
- [ ] Multi-trigger execution (scheduled + on-demand + chat)
- [ ] Consistent briefing quality and format
- [ ] Reliable notification delivery to user channels

**Performance Requirements:**
- [ ] < 30 seconds per user briefing generation
- [ ] < 5 minutes total execution for all users
- [ ] Database queries < 100ms response time
- [ ] Zero missed briefings during migration

**Architecture Improvements:**
- [ ] Node count: 30+ → ~15 (constant)
- [ ] User scaling: Linear → Dynamic (unlimited)
- [ ] Maintenance: Manual updates → Automatic
- [ ] Integration: Standalone → Chat-integrated

---

## Future Phases (Planned)

### Phase 02: Response Speed Optimization
**Priority:** High
**Status:** Completed
**Goal:** Reduce response time from 10-20 seconds to 3-5 seconds

**Completed:**
- [x] Reduced context windows (10 → 6) - reduces token processing
- [x] Fixed expression syntax in Save to Long-term Memory
- [x] Deployed optimized workflow to n8n

**Reverted (incompatible with frontend architecture):**
- [~] Async memory saving - frontend reads from Supabase, not webhook
- [~] Pre-classification - requires DB save before response

**Future consideration:**
- [ ] Smart caching for common queries (separate initiative)

### Phase 03: Reminder System Implementation
**Priority:** Medium  
**Goal:** Users can set specific time reminders via chat

**Key Initiatives:**
- Database schema design (reminders table)
- Reminder checker workflow (5-minute intervals)
- Integration with ops-secretary for time extraction
- Multi-channel notifications (ntfy, email)

### Phase 04: Advanced Features & Integrations
**Priority:** Medium  
**Goal:** Enhance system capabilities with new features

**Key Initiatives:**
- Voice input/output improvements
- Multi-language support expansion
- Advanced AI model integration
- Third-party service integrations

---

## Technical Debt & Improvements

### Current Known Issues

**High Priority:**
- Response speed optimization needed
- Memory auto-save blocking main flows
- Daily briefing hardcoded structure (being addressed)

**Medium Priority:**
- Limited error handling in some workflows
- No comprehensive monitoring system
- Limited user preference controls

**Low Priority:**
- Documentation gaps in some workflows
- Limited testing coverage
- Performance monitoring gaps

### Infrastructure Improvements

**Database:**
- Add performance monitoring indexes
- Implement query optimization
- Add connection pooling for scale

**n8n Workflows:**
- Standardize error handling patterns
- Add comprehensive logging
- Implement workflow monitoring

**Frontend:**
- Add loading states for long operations
- Improve error message handling
- Add user preference management

---

## Risk Assessment

### High Risk Areas
- **Daily Briefing Migration:** Risk of missed notifications
  - **Mitigation:** Parallel testing, zero-downtime migration
- **Response Speed Degradation:** As user base grows
  - **Mitigation:** Caching, async operations, optimization

### Medium Risk Areas
- **LLM API Rate Limits:** During bulk operations
  - **Mitigation:** Rate limiting, retries, fallbacks
- **Database Performance:** With increased query volume
  - **Mitigation:** Indexing, query optimization, monitoring

### Low Risk Areas
- **Workflow Complexity:** As features added
  - **Mitigation:** Modular design, documentation, testing
- **User Preference Storage:** Migration and management
  - **Mitigation:** Backward compatibility, gradual rollout

---

## Success Metrics Dashboard

### User Experience
- Briefing delivery success rate: Target > 99%
- Chat response time: Target < 5 seconds
- System availability: Target > 99.5%
- User satisfaction: Monitor feedback

### Technical Performance
- Workflow execution time: Monitor trends
- Database query performance: < 100ms
- API response times: < 2 seconds
- Error rates: < 1%

### Business Metrics
- User engagement growth: Monthly active users
- Feature adoption rates: On-demand briefings usage
- System scalability: Users supported without degradation
- Maintenance overhead: Time spent on system management

---

## Project Timeline

### Q1 2026 (Current Focus)
- **January:** Daily Briefing Dynamic Architecture (Phase 01)
- **February:** Response Speed Optimization (Phase 02)
- **March:** Reminder System Implementation (Phase 03)

### Q2 2026
- **April:** Advanced Features Planning
- **May:** Voice Input/Output Improvements
- **June:** Multi-language Support

### Q3 2026
- **July:** Third-party Integrations
- **August:** Performance Monitoring System
- **September:** User Experience Enhancements

### Q4 2026
- **October:** Advanced AI Features
- **November:** System Scalability Improvements
- **December:** Year-end Review & Planning

---

## Resource Allocation

### Development Focus
- 40% Performance Optimization
- 30% Feature Development
- 20% Technical Debt Resolution
- 10% Documentation & Testing

### Infrastructure Investment
- Database optimization and monitoring
- Workflow performance tools
- Automated testing infrastructure
- User experience analytics

---

*Last Updated: January 28, 2026*
*Next Review: February 15, 2026*
*Document Owner: NemoAI Development Team*