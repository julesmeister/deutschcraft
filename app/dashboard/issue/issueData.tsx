import { IssueData } from '@/components/ui/issue/IssueDetail';
import {
  TagIcon,
  StatusIcon,
  PriorityIcon,
  UserIcon,
  CalendarIcon,
} from './issueIcons';
import { IssueDescription } from './issueDescription';
import { commentsTabContent, attachmentsTabContent } from './issueTabContents';
import { timelineData } from './issueTimelineData';

export const sampleIssueData: IssueData = {
  id: 'TASK-234',
  title: 'Unable to upload file',
  tag: '#TASK-234',
  description: <IssueDescription />,
  fields: {
    label: {
      icon: <TagIcon />,
      value: (
        <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-full text-sm">
          Bug
        </span>
      ),
      onClick: () => console.log('Edit label clicked'),
    },
    status: {
      icon: <StatusIcon />,
      value: (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-semibold rounded-full text-sm">
          In Progress
        </span>
      ),
      onClick: () => console.log('Edit status clicked'),
    },
    priority: {
      icon: <PriorityIcon />,
      value: (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 font-semibold rounded-full text-sm">
          High
        </span>
      ),
      onClick: () => console.log('Edit priority clicked'),
    },
    assignedTo: {
      icon: <UserIcon />,
      value: (
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full bg-purple-200 flex items-center justify-center">
            <span className="text-gray-900 font-bold text-xs">MM</span>
          </div>
          <span className="font-semibold text-gray-900">Max Mustermann</span>
        </div>
      ),
      onClick: () => console.log('Edit assignee clicked'),
    },
    dueDate: {
      icon: <CalendarIcon />,
      value: <span className="font-semibold text-gray-900">August 05, 2024</span>,
      onClick: () => console.log('Edit due date clicked'),
    },
  },
  tabs: [
    {
      id: 'comments',
      label: 'Comments',
      badge: 3,
      content: commentsTabContent,
    },
    {
      id: 'attachments',
      label: 'Attachments',
      badge: 2,
      content: attachmentsTabContent,
    },
  ],
  timeline: timelineData,
  currentUser: {
    name: 'You',
    initials: 'YO',
    color: 'bg-blue-200',
  },
  onAddComment: (comment) => {
    console.log('New comment:', comment);
  },
};
