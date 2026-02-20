ProjectPulse AI

Reliability-First Project Intelligence Platform

Built for LOOP Hackathon 2026
Track: Build for Failure & Reliability

PART 1 — DEMO BUILD (Hackathon Prototype Scope)

This section defines the minimum working prototype required for submission.

The demo must clearly demonstrate:

Reliability Score calculation

Risk detection

Failure simulation

AI recovery recommendation

Real-time update behavior

The demo does NOT require full enterprise features. Only core logic + visible intelligence.

1. Demo Objective

Build a working web application where:

A project has tasks assigned to team members.

The system calculates a Reliability Score (0–100).

The system detects risks automatically.

The user can simulate failure scenarios.

AI generates a recovery recommendation.

Score updates live when changes are applied.

This demo must be fully functional.

2. Demo Architecture Overview

The demo system consists of 4 layers:

Layer 1 — Data Layer
MongoDB models for Users, Projects, Tasks.

Layer 2 — Real-Time Engine
Socket.io to emit score updates instantly.

Layer 3 — Predictive Logic Engine
Health Score + Reliability Score calculation logic.

Layer 4 — AI Layer
OpenAI API for recovery plan + risk explanation.

3. Demo Feature Requirements
3.1 Authentication (Minimal)

Required:

Email/password login

JWT authentication

One demo user seeded automatically

No role-based complexity required for demo.

3.2 Core Models (Minimal Schema)

User:

name

email

passwordHash

Project:

name

deadline

healthScore

reliabilityScore

Task:

title

status (todo | inprogress | blocked | done)

assigneeId

dueDate

estimatedHours

actualHours

updatedAt

3.3 Reliability Score Engine (CORE)

The reliability score must be calculated using:

Velocity Consistency

Calculate tasks completed per day (last 5 days)

Compute standard deviation

Higher variance → lower reliability

Blocker Frequency

Count tasks in "blocked" state

Higher percentage → lower reliability

Overload Ratio

If any user has > 5 active tasks

Apply penalty

Stagnation Rate

Tasks not updated for > 48 hours

Apply penalty

Formula (for demo simplicity):

Reliability Score =
100

(blockerPenalty * 20)

(stagnationPenalty * 15)

(velocityVariancePenalty * 25)

(overloadPenalty * 20)

Clamp result between 0–100.

Recalculate on:

Task status change

Task assignment change

Failure simulation trigger

3.4 Risk Detection (Automatic)

When reliabilityScore < 65:

Create Risk Alert object:

{
type: "reliability_drop",
reason: "High blocker frequency and stagnation detected",
confidence: 0.82,
recommendedAction: "Reassign blocked tasks and reduce overload"
}

Display alert on dashboard.

3.5 Failure Simulation Mode (DEMO CRITICAL FEATURE)

This must work fully.

UI:

Three sliders:

Remove Team Member (0 or 1)

Reduce Deadline (0–5 days)

Increase Blocked Tasks (%)

When sliders move:

Clone project state in memory

Modify according to simulation

Recalculate reliability score

Call AI endpoint with simulation result

Display:

New reliability score

New forecast

AI recovery recommendation

Simulation must NOT modify real DB data.

Use in-memory simulation logic.

3.6 AI Recovery Recommendation

Endpoint:
POST /api/ai/recovery

Input:
{
reliabilityScore,
blockerCount,
stagnationCount,
overloadMembers,
daysRemaining
}

Prompt must instruct GPT:

"You are a project reliability assistant. Provide a concise recovery plan with specific task reassignments and prioritization advice."

Output format required:

{
summary: "...",
actionItems: [
"...",
"..."
]
}

Store AI response temporarily for display.

3.7 Dashboard (Demo UI Requirements)

Dashboard must show:

Reliability Score (large, animated number)

Color indicator:
Green (>=75)
Yellow (50–74)
Red (<50)

Active Risk Alerts

Workload summary (simple grid)

"Simulate Failure" button

3.8 Real-Time Updates

Use Socket.io.

When:

Task updated

Simulation applied

Emit:
{
reliabilityScore,
healthScore
}

All connected clients must see score change instantly.

3.9 Demo Seed Data

Seed script must create:

1 Workspace

1 Project

6 Users

30 Tasks

5 blocked

3 stagnant

4 overloaded under one member

Some done tasks for velocity data

Initial reliability score should be around 65–70.

This makes simulation visually impactful.

PART 2 — FULL PROJECT BUILD (Post-Selection Scope)

This section defines the complete system if shortlisted.

It expands demo to full product scale.

1. Expanded Features

Add:

Full RBAC (Owner/Manager/Member)

Sprint management

Gantt view

Analytics dashboard

Burndown charts

Reliability trend graph

Incident replay

Natural language task creation

Auto daily standup (cron job)

Blocker explainer

Retrospective generator

Workload heatmap

Contributor report

Deadline compression stress test

2. Expanded AI Layer

Implement:

Early warning cron detection

AI explanation for every alert

Confidence scoring model

Apply recommendation button (auto reassign tasks)

Caching AI results

Fallback logic if OpenAI unavailable

3. Scalable Architecture Improvements

Redis adapter for Socket.io scaling

Background job queue (BullMQ)

Score calculation worker

Rate limiting middleware

OpenAI response caching

Aggregation pipelines for analytics

4. Production Hardening

Input validation (Joi/Zod)

Error boundaries

Unit tests for score engine

Integration tests for AI endpoints

Environment-based logging

API rate limiting

5. Future Roadmap

GitHub integration

Slack alerts

Jira import

AI sprint planning assistant

Predictive burn-out detection

Multi-project dependency graph

FINAL INSTRUCTIONS FOR KIRO IDE AI

When building:

Implement Demo Scope first.

Do not build full enterprise features until demo is complete.

Focus on reliability score + simulation working perfectly.

Ensure clean folder structure separation:

models

controllers

services

utils

ai

Use modular score calculation functions.

Write pure functions for reliability engine for testability.

Demo Success Criteria

The demo is successful if:

Reliability score visibly changes

Simulation mode works

AI generates real recovery plan

Score updates live via Socket.io

Dashboard looks polished

No runtime errors during demo