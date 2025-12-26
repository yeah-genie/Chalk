# PM Assessment: Chalk App Current State

## 1. Executive Summary
**Status**: 🚨 Critical Misalignment
**Verdict**: The codebase currently suffers from a split personality. While the frontend Landing Page (`src/app/page.tsx`) and Product Spec (`docs/PRODUCT_SPEC.md`) correctly reflect the **Chalk** vision (Tutor feedback app), the backend infrastructure, database schema, and state management are legacy artifacts from a different product ("Briefix" - an idea management tool).

Immediate refactoring is required before any new feature development can proceed.

## 2. Gap Analysis

### ✅ What is aligned
- **Product Specification**: `docs/PRODUCT_SPEC.md` clearly defines the Chalk value proposition, features, and roadmap.
- **Landing Page**: The Next.js app (`src/app/page.tsx`) correctly implements the Chalk landing page.
- **Curriculum Service**: `src/services/curriculum-sync` appears to be a new module designed for Chalk's curriculum features.

### ❌ Critical Issues (Tech Debt)
1.  **Database Schema Mismatch**:
    -   `supabase-schema.sql` defines tables for `teams`, `ideas`, `evaluations` (Briefix).
    -   **Missing**: `students`, `lessons`, `reports`, `curriculums` (Chalk requirements).
2.  **State Management Mismatch**:
    -   `src/app/store/ideas.ts` manages "Ideas" and "Kanban status", which is irrelevant to Chalk.
    -   **Missing**: Stores for managing Tutors, Students, and active Lesson sessions.
3.  **Dependency Bloat**:
    -   Packages like `@dnd-kit` (Drag and Drop) and `@google/generative-ai` are present. We need to verify if `@dnd-kit` is needed for Chalk (maybe for curriculum reordering?) or if it's legacy.
4.  **Application Logic**:
    -   `src/app/app/page.tsx` redirects to home. There is no actual "App" interface for the tutor yet.

## 3. Action Plan (Priority High)

### Phase 1: Clean Slate (Technical Foundation)
1.  **Purge Legacy Code**: Remove `supabase-schema.sql`, `src/app/store/ideas.ts`, and related types (`src/app/types`).
2.  **Establish Chalk Schema**: Create a new SQL schema focusing on:
    -   `Profiles` (Tutors)
    -   `Students` (linked to Tutors)
    -   `Lessons` (Date, Topic, Feedback, Images)
    -   `Curriculum` (Topics, Progress)
3.  **Core Store Setup**: Implement `useStudentStore` and `useLessonStore`.

### Phase 2: MVP Features (Tutor Experience)
1.  **Dashboard**: Simple view to see list of students.
2.  **Lesson Mode**: A mobile-first view to:
    -   Select a student.
    -   Check off curriculum topics.
    -   Record a quick memo/voice note.
3.  **Report Generation**: A service to transform the lesson data into the "Parent Report" format described in the spec.

## 4. Conclusion
We are currently at **Stage 0** of the actual application development. The landing page is ready, but the "App" behind the login does not exist yet. We need to pivot the backend/state immediately to match the Product Spec.
