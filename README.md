# AI Interview Preparation Platform

An AI-powered platform that helps candidates prepare for interviews with a strategy tailored to a specific role. By comparing a job description with a resume or self-description, it creates a clear, actionable preparation plan instead of a generic question list.


## What It Does

The platform translates a candidate's experience and a target job description into useful interview-preparation material. It identifies the skills that matter for the role, suggests how to prepare, and keeps generated plans available for later review.

## Core Features

- **Personalized interview plans** — generates content around the role the candidate is applying for.
- **Flexible profile input** — accepts either a resume upload or a written self-description.
- **Technical questions** — helps candidates prepare for role-specific concepts and problem-solving discussions.
- **Behavioral questions** — includes the intent behind each question and a model-answer direction.
- **Match score** — gives a simple view of alignment between the profile and job requirements.
- **Skill-gap analysis** — highlights areas that need more preparation.
- **Preparation roadmap** — converts insights into a structured day-by-day study plan.
- **Report history** — lets users revisit previously generated interview plans.
- **PDF export** — provides a downloadable version of each plan.
- **Responsive interface** — designed to work across desktop, tablet, and mobile screens.

## How the Experience Flows

```text
Job Description + Resume / Self-Description
                    ↓
             AI Role Analysis
                    ↓
Questions · Match Score · Skill Gaps · Roadmap
                    ↓
          Personalized Interview Plan
```

## Built With

| Area | Technology |
| --- | --- |
| User interface | React, Vite, Sass |
| API | Node.js, Express |
| Data | MongoDB, Mongoose |
| Authentication | JWT with HTTP-only cookies |
| AI generation | Google Gemini |
| Documents | PDF parsing and PDF report generation |

## Why This Project

Interview preparation is often scattered across job listings, notes, question banks, and generic advice. This project brings those inputs together and turns them into one role-focused preparation experience—helping candidates understand what to study, what to expect, and where to improve.

## Privacy & Security

The project keeps sensitive configuration outside version control. The visual preview above uses sample content only and does not expose user information, database details, API keys, or application secrets.

