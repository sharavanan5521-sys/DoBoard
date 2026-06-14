# DoBoard — Collaborative To-Do PWA

> **Claude Code context file.** Read this before every phase. Update task checkboxes and phase status as you complete work.

---

## Project Overview

A real-time collaborative to-do list PWA. Users create boards (categories), add tasks, invite teammates, and collaborate live (like Google Docs). Each board has a progress tracker with charts and insights. Built to be installable as a PWA on desktop and mobile.

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Database | Firebase Firestore (real-time) |
| Auth | Firebase Auth (Google sign-in) |
| Routing | React Router v6 |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Dates | date-fns |
| PWA | vite-plugin-pwa |
| Hosting | Vercel |

## Folder Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── boards/
│   │   ├── BoardCard.tsx
│   │   ├── BoardGrid.tsx
│   │   └── CreateBoardModal.tsx
│   ├── tasks/
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskDetailPanel.tsx
│   │   └── AddTaskInput.tsx
│   ├── insights/
│   │   └── InsightsPanel.tsx
│   └── shared/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── ProgressBar.tsx
│       └── Skeleton.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useBoards.ts
│   ├── useTasks.ts
│   └── usePresence.ts
├── lib/
│   ├── firebase.ts
│   └── utils.ts
├── pages/
│   ├── Dashboard.tsx
│   └── BoardDetail.tsx
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Firestore Data Model

### `users/{userId}`
```ts
{
  uid: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Timestamp
}
```

### `boards/{boardId}`
```ts
{
  name: string
  color: string               // hex e.g. "#378ADD"
  members: string[]           // array of userIds
  createdBy: string           // userId
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `tasks/{taskId}`
```ts
{
  boardId: string
  title: string
  description: string | null
  done: boolean
  doneAt: Timestamp | null
  assignee: string | null     // userId
  priority: 'low' | 'medium' | 'high' | null
  dueDate: Timestamp | null
  archived: boolean
  createdBy: string           // userId
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `presence/{userId}_{boardId}`
```ts
{
  userId: string
  boardId: string
  lastSeen: Timestamp
}
```

## Firestore Security Rules

Apply these rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /boards/{boardId} {
      allow read: if request.auth != null
        && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && request.auth.uid in resource.data.members;
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.createdBy;
    }

    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    match /presence/{presenceId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Phase Progress

| Phase | Name | Status |
|---|---|---|
| 0 | Setup & Foundation | ✅ Done |
| 1 | Auth & User Profile | ✅ Done |
| 2 | Boards Dashboard | ✅ Done |
| 3 | Tasks — Core CRUD + Real-time | ✅ Done |
| 4 | Task Enhancements | ⬜ Todo |
| 5 | Collaboration | ⬜ Todo |
| 6 | Progress Tracker & Insights | ⬜ Todo |
| 7 | PWA + Polish | ⬜ Todo |

---

## Phase 0 — Setup & Foundation

**Goal:** Scaffold the full project with all dependencies, folder structure, Firebase config, routing, and placeholder pages. After this phase the app should start without errors.

### Tasks
- [x] Init Vite + React + TypeScript: `npm create vite@latest . -- --template react-ts`
- [x] Install dependencies:
  ```
  npm install firebase react-router-dom recharts react-hot-toast date-fns
  npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
  npx tailwindcss init -p
  ```
- [x] Configure `tailwind.config.js` — set content paths to `./src/**/*.{ts,tsx}`
- [x] Add Tailwind directives to `src/index.css`
- [x] Create `src/lib/firebase.ts` — init Firebase app, export `auth`, `db` using `import.meta.env.VITE_FIREBASE_*` variables
- [x] Create `src/types/index.ts` — export TypeScript interfaces: `User`, `Board`, `Task`, `Presence`
- [x] Create `src/lib/utils.ts` — helper: `getInitials(name: string): string`, `formatRelativeDate(date: Date): string`
- [x] Set up React Router v6 in `App.tsx` — routes: `/login`, `/` (Dashboard), `/board/:boardId` (BoardDetail), `/join/:boardId` (Join board)
- [x] Create placeholder components: `LoginPage.tsx`, `Dashboard.tsx`, `BoardDetail.tsx` — each just renders its name in an `<h1>`
- [x] Create `ProtectedRoute.tsx` — redirect to `/login` if no auth user
- [x] Create `.env.example` with all `VITE_FIREBASE_*` variable names, empty values
- [x] Verify `npm run dev` starts without errors
- [x] Update Phase 0 status in this file to ✅ Done
- [x] Commit: `git add . && git commit -m "feat: Phase 0 — project setup and foundation"`

---

## Phase 1 — Auth & User Profile

**Goal:** Google sign-in flow, auth context, protected routes, user document in Firestore.

### Tasks
- [x] Create `src/contexts/AuthContext.tsx`:
  - State: `currentUser` (Firebase User | null), `loading`
  - Functions: `signInWithGoogle()`, `signOut()`
  - On sign-in: create `users/{uid}` doc in Firestore if it doesn't exist (setDoc with merge)
  - Export `useAuth()` hook
- [x] Wrap `App.tsx` with `<AuthProvider>`
- [x] Build `LoginPage.tsx`:
  - Centered layout, app name "DoBoard", tagline
  - "Sign in with Google" button (use Google logo SVG inline)
  - Show loading spinner while signing in
- [x] Wire `ProtectedRoute.tsx` — show loading spinner while `loading === true`, redirect to `/login` if no user
- [x] Update `Dashboard.tsx` to show `currentUser.displayName` in the header with sign out button
- [x] Verify: visit `/`, redirected to `/login`, sign in works, redirected back to `/`, user name appears
- [x] Update Phase 1 status in this file to ✅ Done
- [x] Commit: `git add . && git commit -m "feat: Phase 1 — Firebase Auth with Google sign-in"`

---

## Phase 2 — Boards Dashboard

**Goal:** Full board CRUD, responsive card grid, color picker, member avatars, progress bar on card.

### Tasks
- [x] Create `src/hooks/useBoards.ts`:
  - `onSnapshot` query on `boards` where `members array-contains currentUser.uid`
  - Returns `{ boards, loading }`
- [x] Create `src/hooks/useTasks.ts` (basic version — count only):
  - For each boardId, query tasks where `boardId == id` and `archived == false`
  - Returns task counts per board (total and done) — used for progress bars on cards
- [x] Create `src/components/shared/ProgressBar.tsx` — props: `value` (0–100), `color` (hex)
- [x] Create `src/components/shared/Avatar.tsx` — shows initials circle, props: `name`, `size`, `color`, optional `online` (green dot)
- [x] Create `src/components/boards/BoardCard.tsx`:
  - Color dot + board name
  - "X of Y done" text
  - `ProgressBar` component
  - Stacked member avatars (max 3 shown, then "+N")
  - Click navigates to `/board/:boardId`
  - Hover: subtle lift effect
- [x] Create `src/components/boards/CreateBoardModal.tsx`:
  - Text input for board name
  - 8 preset color swatches to pick from
  - Create button → adds board to Firestore with `members: [currentUser.uid]`
  - Cancel/close
- [x] Build `Dashboard.tsx` full layout:
  - Header: "DoBoard" logo, "+ New Board" button (opens modal), user avatar + sign out
  - Responsive 2-col card grid (1-col on mobile)
  - Empty state: "No boards yet — create one to get started"
  - Loading skeleton (3 gray card placeholders while loading)
- [x] Verify: can create board, see it on dashboard with progress bar, click to navigate
- [x] Update Phase 2 status in this file to ✅ Done
- [x] Commit: `git add . && git commit -m "feat: Phase 2 — boards dashboard with CRUD"`

---

## Phase 3 — Tasks — Core CRUD + Real-time

**Goal:** Full task list with live onSnapshot updates, add/complete/delete, filter tabs.

### Tasks
- [x] Upgrade `src/hooks/useTasks.ts` to full version:
  - `onSnapshot` on tasks where `boardId == id` and `archived == false`
  - Sorted by `createdAt` ascending
  - Returns `{ tasks, loading, addTask, toggleDone, deleteTask }`
- [x] Create `src/components/tasks/AddTaskInput.tsx`:
  - Text input at top of list
  - Press Enter or click "Add" button to create task
  - Clear input after adding
  - Focus on load
- [x] Create `src/components/tasks/TaskItem.tsx`:
  - Animated checkbox — on check, title gets strikethrough + opacity fade
  - Task title text
  - Delete button (trash icon, visible on hover)
  - Clicking the row will later open TaskDetailPanel (stub for now)
- [x] Create `src/components/tasks/TaskList.tsx`:
  - Filter tabs: All / Active / Done — show count badge on each
  - Renders filtered `TaskItem` list
  - Empty state per filter ("No tasks yet", "Nothing active", "Nothing done yet")
- [x] Build `BoardDetail.tsx` full layout:
  - Back button (→ Dashboard)
  - Board name as page title
  - Board color accent
  - Member avatars row (header area)
  - `AddTaskInput` at top
  - `TaskList` below
- [x] Verify: add tasks, check them off, see live updates (open in two tabs to test real-time)
- [x] Update Phase 3 status in this file to ✅ Done
- [x] Commit: `git add . && git commit -m "feat: Phase 3 — tasks CRUD with real-time onSnapshot"`

---

## Phase 4 — Task Enhancements

**Goal:** Assignee, due dates, priority, notes, archive — all editable in a slide-in task detail panel.

### Tasks
- [ ] Create `src/components/tasks/TaskDetailPanel.tsx` — slides in from right (or bottom on mobile) when a task row is clicked:
  - Editable title input
  - Textarea for description/notes
  - Assignee picker: dropdown list of board members (name + avatar)
  - Due date input (`<input type="date">`) — shows "2 days left" or "Overdue — X days ago" using `date-fns`
  - Priority selector: three buttons Low (gray) / Medium (amber) / High (red)
  - All changes save to Firestore with `updateDoc` on change (debounced 500ms)
  - Close button (X)
- [ ] Update `TaskItem.tsx`:
  - Show priority badge (Low/Medium/High colored pill) if set
  - Show due date chip — red + "Overdue" if past due and not done
  - Show assignee avatar (small, right-aligned)
  - Click row → open `TaskDetailPanel`
- [ ] Add archive button in `TaskDetailPanel` (and bulk "Archive all done" button in `BoardDetail` header)
- [ ] Add "Archived" filter tab to `TaskList`
- [ ] Archived tasks query: separate hook call with `archived == true`
- [ ] Update Phase 4 status in this file to ✅ Done
- [ ] Commit: `git add . && git commit -m "feat: Phase 4 — task enhancements: assignee, due dates, priority, archive"`

---

## Phase 5 — Collaboration

**Goal:** Invite members by link or email, online presence, member management.

### Tasks
- [ ] Create `src/hooks/usePresence.ts`:
  - On BoardDetail mount: write `presence/{uid}_{boardId}` with `lastSeen: serverTimestamp()` every 30s using `setInterval`
  - Clean up interval on unmount
  - Listen to all presence docs for current board's members
  - Return `onlineUserIds: string[]` (lastSeen within 60 seconds)
- [ ] Update `BoardCard.tsx`: show "X online" green badge if `onlineUserIds.length > 0`
- [ ] Update `BoardDetail.tsx` header: show member avatars with green dot overlay for online users
- [ ] Invite by link:
  - "Invite" button in BoardDetail header → opens invite modal
  - Generate shareable URL: `${window.location.origin}/join/${boardId}`
  - "Copy link" button (uses `navigator.clipboard.writeText`)
  - Toast: "Link copied!"
- [ ] Join board page (`/join/:boardId`):
  - If not logged in → redirect to login, then return here
  - If already a member → redirect to `/board/:boardId`
  - If new → show "You've been invited to [Board Name]" with "Join Board" button
  - On join: `arrayUnion(currentUser.uid)` on board's `members` field
- [ ] Invite by email:
  - In invite modal: email input → search `users` collection by email
  - If found: add their uid to `members[]` with `arrayUnion`
  - If not found: show "User not found — they need to sign in first"
- [ ] Member management (in board settings modal):
  - List all members (name + avatar + "online" badge)
  - Board creator can remove members (`arrayRemove`)
  - Leave board option for non-creators
- [ ] Update Phase 5 status in this file to ✅ Done
- [ ] Commit: `git add . && git commit -m "feat: Phase 5 — collaboration: invite, presence, member management"`

---

## Phase 6 — Progress Tracker & Insights

**Goal:** Per-board insights tab with charts, stats, and a health summary.

### Tasks
- [ ] Add "Insights" tab to `BoardDetail.tsx` filter bar (next to All/Active/Done/Archived)
- [ ] Create `src/components/insights/InsightsPanel.tsx`
- [ ] Stat cards row (4 cards):
  - Total tasks
  - Done (count + %)
  - Active (not done, not archived)
  - Overdue (due < now, not done)
- [ ] Completion rate donut chart (Recharts `PieChart`):
  - Done (board color) vs Remaining (gray)
  - Center label: "X% done"
- [ ] Tasks completed over last 7 days (Recharts `BarChart` or `LineChart`):
  - X axis: last 7 days (Mon, Tue... formatted with `date-fns format(day, 'EEE')`)
  - Y axis: count of tasks where `doneAt` falls on that day
  - Bar color: board color
- [ ] Priority breakdown (Recharts `BarChart`, horizontal):
  - Three bars: High / Medium / Low
  - Colors: red / amber / gray
  - Label: count on each bar
- [ ] Member contribution (Recharts `BarChart`):
  - X axis: member names (initials or first name)
  - Y axis: tasks completed by that member (where `done == true` and `createdBy` or `assignee == uid`)
- [ ] Board health summary text block at top of InsightsPanel:
  - If 0 overdue: "All on track"
  - If overdue > 0: "X tasks are overdue"
  - If completion > 80%: "Great progress on this board!"
  - If all done: "Board complete!"
- [ ] Verify all charts render correctly with real data
- [ ] Update Phase 6 status in this file to ✅ Done
- [ ] Commit: `git add . && git commit -m "feat: Phase 6 — progress tracker and insights with charts"`

---

## Phase 7 — PWA + Polish

**Goal:** Installable PWA, offline support, toast notifications, loading states, mobile polish.

### Tasks
- [ ] Configure `vite-plugin-pwa` in `vite.config.ts`:
  ```ts
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'DoBoard',
      short_name: 'DoBoard',
      theme_color: '#6366f1',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
  })
  ```
- [ ] Create simple app icons: `public/icon-192.png` and `public/icon-512.png` (use a simple colored square with "DB" text via Canvas or a placeholder)
- [ ] Add `react-hot-toast` `<Toaster>` to `App.tsx`
- [ ] Add toast notifications to all actions: task added, task deleted, board created, board deleted, member invited, link copied, error states
- [ ] Create `src/components/shared/Skeleton.tsx` — gray animated pulse blocks in card shape and row shape
- [ ] Use `Skeleton` in `BoardGrid` (while loading boards) and `TaskList` (while loading tasks)
- [ ] Empty states:
  - Dashboard: illustration + "Create your first board to get started"
  - Task list: "No tasks yet — add one above"
  - Insights: "Add some tasks to see insights"
- [ ] Mobile responsiveness audit:
  - Dashboard: 1-col on mobile, 2-col on md+
  - BoardDetail: full screen, bottom sheet for TaskDetailPanel on mobile
  - Touch targets: all interactive elements min 44×44px
  - Bottom padding on mobile for safe area
- [ ] Route-level code splitting: wrap all page imports in `React.lazy` + `<Suspense>`
- [ ] Final check: `npm run build` succeeds, `npm run preview` shows PWA
- [ ] Deploy to Vercel: `npx vercel --prod` (or via GitHub auto-deploy)
- [ ] Update Phase 7 status in this file to ✅ Done
- [ ] Commit: `git add . && git commit -m "feat: Phase 7 — PWA config, polish, and production build"`

---

## Notes & Decisions

_Add notes as the project evolves._

- Board deletion should also delete all tasks with that boardId (use a batch delete or Cloud Function)
- Task query uses `boardId` field — add a Firestore composite index on `(boardId, archived, createdAt)` if Firestore prompts for it
- Presence cleanup: docs are small, no need to delete on logout — TTL of 60s handles it
- Member contribution chart uses `assignee` field if set, otherwise `createdBy`
