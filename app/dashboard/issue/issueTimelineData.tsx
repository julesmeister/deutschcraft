export const timelineData = [
  {
    id: '1',
    user: {
      name: 'Max Mustermann',
      initials: 'MM',
      color: 'bg-purple-200',
    },
    time: '5 hours ago',
    action: <span className="text-gray-700">created this issue</span>,
  },
  {
    id: '2',
    user: {
      name: 'Max Mustermann',
      initials: 'MM',
      color: 'bg-purple-200',
    },
    time: '5 hours ago',
    action: (
      <span className="text-gray-700">
        added label{' '}
        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-semibold rounded text-sm">
          Bug
        </span>
      </span>
    ),
  },
  {
    id: '3',
    user: {
      name: 'Sarah Fischer',
      initials: 'SF',
      color: 'bg-yellow-200',
    },
    time: '4 hours ago',
    action: (
      <span className="text-gray-700">
        changed priority from{' '}
        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-semibold rounded text-sm">
          Medium
        </span>{' '}
        to{' '}
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-semibold rounded text-sm">
          High
        </span>
      </span>
    ),
  },
  {
    id: '4',
    user: {
      name: 'Sarah Fischer',
      initials: 'SF',
      color: 'bg-yellow-200',
    },
    time: '4 hours ago',
    action: (
      <span className="text-gray-700">
        assigned to <strong>Max Mustermann</strong>
      </span>
    ),
  },
  {
    id: '5',
    user: {
      name: 'Anna Schmidt',
      initials: 'AS',
      color: 'bg-cyan-200',
    },
    time: '2 hours ago',
    action: <span className="text-gray-700">added a comment</span>,
  },
  {
    id: '6',
    user: {
      name: 'Thomas Weber',
      initials: 'TW',
      color: 'bg-green-200',
    },
    time: '1 hour ago',
    action: (
      <span className="text-gray-700">
        changed status to{' '}
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 font-semibold rounded text-sm">
          In Progress
        </span>
      </span>
    ),
  },
];
