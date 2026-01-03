import { CommentSection } from '@/components/ui/issue/CommentSection';
import { FileIcon } from './issueIcons';

export const commentsTabContent = (
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
);

export const attachmentsTabContent = (
  <div className="space-y-3">
    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
        <FileIcon />
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
        <FileIcon />
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
);
