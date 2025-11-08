'use client';

import { IssueDetail, IssueData } from '@/components/ui/issue/IssueDetail';
import { CommentSection } from '@/components/ui/issue/CommentSection';

export default function IssuePage() {
  const issueData: IssueData = {
    id: 'TASK-234',
    title: 'Unable to upload file',
    tag: '#TASK-234',
    description: (
      <div className="space-y-4">
        <p>
          Users are experiencing issues when trying to upload files larger than 5MB. The upload
          process starts but gets stuck at around 80% completion.
        </p>
        <p>
          <strong>Steps to reproduce:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Navigate to the file upload section</li>
          <li>Select a file larger than 5MB</li>
          <li>Click the upload button</li>
          <li>Observe the progress bar getting stuck at ~80%</li>
        </ol>
        <p>
          <strong>Expected behavior:</strong> Files should upload successfully regardless of size
          (up to the 50MB limit).
        </p>
        <p>
          <strong>Actual behavior:</strong> Upload process hangs and eventually times out for
          files larger than 5MB.
        </p>
      </div>
    ),
    fields: {
      label: {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        ),
        value: (
          <span className="px-3 py-1 bg-red-100 text-red-700 font-semibold rounded-full text-sm">
            Bug
          </span>
        ),
        onClick: () => console.log('Edit label clicked'),
      },
      status: {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        value: (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-semibold rounded-full text-sm">
            In Progress
          </span>
        ),
        onClick: () => console.log('Edit status clicked'),
      },
      priority: {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        value: (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 font-semibold rounded-full text-sm">
            High
          </span>
        ),
        onClick: () => console.log('Edit priority clicked'),
      },
      assignedTo: {
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ),
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
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        value: <span className="font-semibold text-gray-900">August 05, 2024</span>,
        onClick: () => console.log('Edit due date clicked'),
      },
    },
    tabs: [
      {
        id: 'comments',
        label: 'Comments',
        badge: 3,
        content: (
          <CommentSection
            comments={[
              {
                id: '1',
                user: {
                  name: 'Anna Schmidt',
                  initials: 'AS',
                  color: 'bg-cyan-200',
                },
                time: '2 hours ago',
                content: (
                  <p>
                    I've investigated this issue and it seems to be related to the chunk size
                    configuration in our upload handler. Files larger than 5MB are not being
                    properly chunked, causing the timeout.
                  </p>
                ),
              },
              {
                id: '2',
                user: {
                  name: 'Thomas Weber',
                  initials: 'TW',
                  color: 'bg-green-200',
                },
                time: '1 hour ago',
                content: (
                  <p>
                    Good find! I can work on increasing the chunk size and implementing better
                    error handling. Should have a fix ready by end of day.
                  </p>
                ),
              },
              {
                id: '3',
                user: {
                  name: 'Max Mustermann',
                  initials: 'MM',
                  color: 'bg-purple-200',
                },
                time: '30 minutes ago',
                content: (
                  <div>
                    <p className="mb-2">Great! Please also add:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Progress bar accuracy improvements</li>
                      <li>Retry mechanism for failed chunks</li>
                      <li>Better user feedback during upload</li>
                    </ul>
                  </div>
                ),
              },
            ]}
            currentUser={{
              name: 'You',
              initials: 'YO',
              color: 'bg-blue-200',
            }}
            onAddComment={(comment) => console.log('New comment:', comment)}
          />
        ),
      },
      {
        id: 'attachments',
        label: 'Attachments',
        badge: 2,
        content: (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">error-screenshot.png</p>
                <p className="text-sm text-gray-500">2.4 MB • Uploaded 3 hours ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-semibold">
                Download
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">network-logs.txt</p>
                <p className="text-sm text-gray-500">156 KB • Uploaded 2 hours ago</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-semibold">
                Download
              </button>
            </div>
          </div>
        ),
      },
    ],
    timeline: [
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
    ],
    currentUser: {
      name: 'You',
      initials: 'YO',
      color: 'bg-blue-200',
    },
    onAddComment: (comment) => {
      console.log('New comment:', comment);
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Issue Details 🐛</h1>
              <p className="text-gray-600 mt-1">Track and manage issue progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <IssueDetail issue={issueData} />
      </div>
    </div>
  );
}
