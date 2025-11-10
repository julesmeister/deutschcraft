'use client';

interface TaskDetailsRowProps {
  task: any;
}

export function TaskDetailsRow({ task }: TaskDetailsRowProps) {
  if (!task.instructions) return null;

  return (
    <tr className="bg-gray-50">
      <td colSpan={7} className="px-6 py-4">
        <div className="ml-12">
          <h5 className="font-bold text-gray-900 mb-2">Instructions</h5>
          <p className="text-gray-700 mb-3">{task.instructions}</p>

          <div className="grid grid-cols-4 gap-4 text-sm">
            {(task.minWords || task.maxWords) && (
              <div>
                <span className="font-semibold text-gray-600">Word Count: </span>
                <span className="text-gray-900">
                  {task.minWords && `Min ${task.minWords}`}
                  {task.minWords && task.maxWords && ' - '}
                  {task.maxWords && `Max ${task.maxWords}`}
                </span>
              </div>
            )}

            {(task.minParagraphs || task.maxParagraphs) && (
              <div>
                <span className="font-semibold text-gray-600">Paragraphs: </span>
                <span className="text-gray-900">
                  {task.minParagraphs && `Min ${task.minParagraphs}`}
                  {task.minParagraphs && task.maxParagraphs && ' - '}
                  {task.maxParagraphs && `Max ${task.maxParagraphs}`}
                </span>
              </div>
            )}

            {task.tone && (
              <div>
                <span className="font-semibold text-gray-600">Tone: </span>
                <span className="text-gray-900 capitalize">{task.tone}</span>
              </div>
            )}

            {task.perspective && (
              <div>
                <span className="font-semibold text-gray-600">Perspective: </span>
                <span className="text-gray-900 capitalize">{task.perspective}</span>
              </div>
            )}

            {task.totalPoints && (
              <div>
                <span className="font-semibold text-gray-600">Points: </span>
                <span className="text-gray-900">{task.totalPoints}</span>
              </div>
            )}
          </div>

          {(task.requireIntroduction || task.requireConclusion || task.requireExamples) && (
            <div className="mt-3">
              <span className="font-semibold text-gray-600 text-sm">Structure Requirements: </span>
              <div className="flex gap-2 mt-1">
                {task.requireIntroduction && (
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                    Introduction Required
                  </span>
                )}
                {task.requireConclusion && (
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
                    Conclusion Required
                  </span>
                )}
                {task.requireExamples && (
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800">
                    Examples Required
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
