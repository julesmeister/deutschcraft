# Role-Based Features Documentation

## Overview
This document describes the role-based features implemented in the DeutschCraft Web V2 application, specifically for the Tasks page and Student Dashboard.

## Changes Made

### 1. Student Dashboard (`app/dashboard/student/page.tsx`)

#### Stats Grid Update
- **Removed**: "Success Rate" stat (4th position)
- **Added**: "Current CEFR Level" stat showing the student's current level (A1-C2)
  - Displays as text instead of animated number
  - Shows student's actual CEFR level from Firebase

#### Sidebar Update
- **Removed**: "Your Level" card (showing level progression)
- **Added**: "Recent Tasks" card using Activity components
  - Shows the 5 most recent writing tasks assigned to the student
  - Displays real-time data from Firebase
  - Features:
    - Task status icons (✓ for completed, 📝 for in-progress, 📖 for new)
    - Task titles
    - Category tags (Essay, Letter, Story, etc.)
    - CEFR level tags
    - Due date information (Due today, Due tomorrow, Due in X days, Overdue)
    - Time ago (created timestamp)
    - Empty state when no tasks assigned
    - "View All Tasks" button linking to `/dashboard/tasks`

#### New Hook Created
**File**: `lib/hooks/useStudentTasks.ts`
- `useStudentTasks(studentId)`: Fetches all tasks assigned to a student
- `useRecentStudentTasks(studentId)`: Fetches only the 5 most recent tasks
- Uses Firestore `collectionGroup` to search across all teachers/batches
- Automatically filters tasks by `assignedStudents` array

### 2. Tasks Page (`app/dashboard/tasks/page.tsx`)

#### Role Detection
- Detects user role from session: `STUDENT` or `TEACHER`
- Shows role badge in header (Student View / Teacher View)

#### Teacher-Only Features
When `userRole === 'TEACHER'`:
- **BatchSelector** visible in header
- Can create, edit, and delete tasks
- Can assign tasks to students
- Can add members to tasks
- View student avatars and assignments
- Full task management capabilities

Features enabled:
- `onAddTask` - Create new tasks
- `onDeleteTask` - Delete tasks
- `onUpdateTask` - Edit task details
- `onAddMember` - Assign students to tasks
- `showMembers={true}` - Display student avatars
- `showAddTask={true}` - Show "Add Task" button

#### Student-Only Features
When `userRole === 'STUDENT'`:
- **No BatchSelector** (hidden)
- **Read-only view** of assigned tasks
- Can toggle task completion (mark as done)
- Cannot create, edit, or delete tasks
- Cannot assign tasks to others
- View only tasks assigned to them

Features disabled:
- `onAddTask={undefined}` - Cannot create tasks
- `onDeleteTask={undefined}` - Cannot delete tasks
- `onUpdateTask={undefined}` - Cannot edit tasks
- `onAddMember={undefined}` - Cannot assign tasks
- `showMembers={false}` - Hide member avatars
- `showAddTask={false}` - Hide "Add Task" button

#### Data Flow

**Teachers**:
```typescript
// Fetch tasks from specific batch
useTeacherBatchTasks(teacherId, batchId)
// Returns all tasks in the selected batch
```

**Students**:
```typescript
// Fetch tasks assigned to student
useStudentTasks(studentId)
// Returns only tasks where studentId is in assignedStudents array
```

#### UI Differences

**Header (Teachers)**:
```
Writing Tasks 📝 [Teacher View]
Manage writing assignments for [Batch Name]
[BatchSelector Dropdown]
```

**Header (Students)**:
```
Writing Tasks 📝 [Student View]
View and complete your writing assignments
[No BatchSelector]
```

## Technical Implementation

### Firestore Structure

**Teacher's Tasks Path**:
```
users/{teacherId}/batches/{batchId}/writing_tasks/{taskId}
```

**Student Task Query**:
```typescript
// Uses collectionGroup to search all writing_tasks
// Filters by: task.assignedStudents.includes(studentId)
```

### Components Used

1. **ActivityCard** (`components/ui/activity/ActivityCard.tsx`)
   - Container for activity content
   - Supports header, subtitle, actions
   - Clean border styling

2. **ActivityTimeline** (`components/ui/activity/ActivityTimeline.tsx`)
   - Displays chronological list of activities
   - Shows icons, titles, descriptions, tags, timestamps
   - Vertical connector lines between items
   - Supports custom icon colors

3. **TaskBoard** (`components/ui/TaskBoard/`)
   - Main task management interface
   - Supports role-based props (optional callbacks)
   - Conditionally shows/hides features based on props

## Benefits

### For Students
- Clear visibility of assigned tasks
- Easy access to recent tasks from dashboard
- Simple completion tracking
- Cannot accidentally delete or modify tasks
- Focused on learning, not administration

### For Teachers
- Full task management control
- Batch-based organization
- Student assignment capabilities
- Detailed tracking and analytics
- Professional task creation workflow

## Future Enhancements

1. **Student Submissions**
   - Add submission interface for students
   - File upload support
   - Draft saving functionality

2. **Teacher Grading**
   - Grade submission interface
   - Feedback and comments
   - Rubric-based scoring

3. **Notifications**
   - Task assignment notifications
   - Due date reminders
   - Submission confirmations

4. **Task Filters**
   - Filter by status (pending, in-progress, completed)
   - Filter by priority
   - Filter by due date
   - Search functionality

5. **Analytics**
   - Student completion rates
   - Average scores
   - Time tracking
   - Performance trends

## Testing

To test the role-based features:

1. **As a Teacher**:
   - Log in with a teacher account
   - Navigate to `/dashboard/tasks`
   - Verify BatchSelector is visible
   - Verify "Add Task" buttons are present
   - Create a new task and assign to students

2. **As a Student**:
   - Log in with a student account
   - Navigate to `/dashboard/student`
   - Verify "Recent Tasks" card shows assigned tasks
   - Navigate to `/dashboard/tasks`
   - Verify BatchSelector is hidden
   - Verify no "Add Task" buttons
   - Verify can only view and toggle completion

## Files Modified

1. `app/dashboard/student/page.tsx` - Student dashboard with real task data
2. `app/dashboard/tasks/page.tsx` - Role-based task management
3. `lib/hooks/useStudentTasks.ts` - New hook for student task queries

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `firebase/firestore` - Database queries (collectionGroup)
- `components/ui/activity/*` - Activity display components
- `components/ui/TaskBoard/*` - Task management components
