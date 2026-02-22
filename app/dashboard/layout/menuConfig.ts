export const studentMenuConfig = {
  trigger: 'Student',
  columns: [
    {
      title: 'Practice',
      items: [
        { label: 'Flashcards', href: '/dashboard/student/flashcards' },
        { label: 'Grammatik', href: '/dashboard/student/grammatik' },
        { label: 'Writing', href: '/dashboard/student/writing' },
        { label: 'Audios', href: '/dashboard/student/audios' },
        { label: 'Playground', href: '/dashboard/playground' },
        { label: 'Notebook', href: '/dashboard/notebook' },
      ],
    },
    {
      title: 'Progress',
      items: [
        { label: 'Achievements', href: '/dashboard/achievements' },
        { label: 'Answer Hub', href: '/dashboard/student/answer-hub' },
        { label: 'Writings', href: '/dashboard/student/writings' },
        { label: 'Syllabus', href: '/dashboard/student/syllabus' },
        { label: 'Schedule', href: '/dashboard/schedule' },
        { label: 'Analytics', href: '/dashboard/analytics' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Dictionary', href: '/dashboard/dictionary' },
        { label: 'Grammar Guide', href: '/dashboard/student/grammar' },
        { label: 'Vocabulary', href: '/dashboard/student/vocabulary' },
        { label: 'Redemittel', href: '/dashboard/student/redemittel' },
        { label: 'Prepositions', href: '/dashboard/student/prepositions' },
        { label: 'Letter Writing', href: '/dashboard/student/letters' },
        { label: 'Videos', href: '/dashboard/student/videos' },
        { label: 'Help Center', href: '/help', external: true },
      ],
    },
  ],
};

export const teacherMenuConfig = {
  trigger: 'Teacher',
  columns: [
    {
      title: 'Management',
      items: [
        { label: 'Students', href: '/dashboard/teacher' },
        { label: 'Enrollments', href: '/dashboard/teacher/enrollments' },
        { label: 'Writing Review', href: '/dashboard/teacher/writing' },
        { label: 'Answer Hub', href: '/dashboard/student/answer-hub' },
        { label: 'Analytics', href: '/dashboard/analytics' },
        { label: 'Assignments', href: '/dashboard/assignments' },
        { label: 'Playground', href: '/dashboard/playground' },
        { label: 'Notebook', href: '/dashboard/notebook' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { label: 'Tasks', href: '/dashboard/tasks' },
        { label: 'Schedule', href: '/dashboard/schedule' },
        { label: 'Calendar', href: '/dashboard/calendar' },
        { label: 'Course Pricing', href: '/dashboard/teacher/pricing' },
        { label: 'Reports', href: '/dashboard/reports' },
        { label: 'Role Management', href: '/dashboard/teacher/roles' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Dictionary', href: '/dashboard/dictionary' },
        { label: 'Redemittel', href: '/dashboard/student/redemittel' },
        { label: 'Videos', href: '/dashboard/student/videos' },
        { label: 'Materials', href: '/resources/materials' },
        { label: 'Templates', href: '/resources/templates' },
        { label: 'Help Center', href: '/help', external: true },
      ],
    },
  ],
};
