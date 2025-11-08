'use client';

import { ReactNode } from 'react';
import { IssueDetailField } from './IssueDetailField';
import { Timeline, TimelineItem } from './Timeline';
import { CommentSection, Comment } from './CommentSection';
import { TabSystem, Tab } from './TabSystem';

export interface IssueData {
  id: string;
  title: string;
  tag?: string;
  description?: ReactNode;
  fields: {
    label?: {
      icon: ReactNode;
      value: ReactNode;
      onClick?: () => void;
    };
    status?: {
      icon: ReactNode;
      value: ReactNode;
      onClick?: () => void;
    };
    priority?: {
      icon: ReactNode;
      value: ReactNode;
      onClick?: () => void;
    };
    assignedTo?: {
      icon: ReactNode;
      value: ReactNode;
      onClick?: () => void;
    };
    dueDate?: {
      icon: ReactNode;
      value: ReactNode;
      onClick?: () => void;
    };
    [key: string]: {
      icon: ReactNode;
      label?: string;
      value: ReactNode;
      onClick?: () => void;
    } | undefined;
  };
  tabs?: Tab[];
  comments?: Comment[];
  timeline?: TimelineItem[];
  currentUser?: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  onAddComment?: (comment: string) => void;
}

interface IssueDetailProps {
  issue: IssueData;
  className?: string;
}

export function IssueDetail({ issue, className = '' }: IssueDetailProps) {
  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Main Content */}
      <div className="flex-1">
        {/* Issue Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-gray-900">{issue.title}</h1>
            {issue.tag && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                {issue.tag}
              </span>
            )}
          </div>
        </div>

        {/* Issue Fields */}
        <div className="mb-8">
          {issue.fields.label && (
            <IssueDetailField
              icon={issue.fields.label.icon}
              label="Label"
              value={issue.fields.label.value}
              onClick={issue.fields.label.onClick}
            />
          )}
          {issue.fields.status && (
            <IssueDetailField
              icon={issue.fields.status.icon}
              label="Status"
              value={issue.fields.status.value}
              onClick={issue.fields.status.onClick}
            />
          )}
          {issue.fields.priority && (
            <IssueDetailField
              icon={issue.fields.priority.icon}
              label="Priority"
              value={issue.fields.priority.value}
              onClick={issue.fields.priority.onClick}
            />
          )}
          {issue.fields.assignedTo && (
            <IssueDetailField
              icon={issue.fields.assignedTo.icon}
              label="Assigned to"
              value={issue.fields.assignedTo.value}
              onClick={issue.fields.assignedTo.onClick}
            />
          )}
          {issue.fields.dueDate && (
            <IssueDetailField
              icon={issue.fields.dueDate.icon}
              label="Due date"
              value={issue.fields.dueDate.value}
              onClick={issue.fields.dueDate.onClick}
            />
          )}
          {/* Custom fields */}
          {Object.entries(issue.fields).map(([key, field]) => {
            if (
              !field ||
              ['label', 'status', 'priority', 'assignedTo', 'dueDate'].includes(key)
            ) {
              return null;
            }
            return (
              <IssueDetailField
                key={key}
                icon={field.icon}
                label={field.label || key}
                value={field.value}
                onClick={field.onClick}
              />
            );
          })}
        </div>

        {/* Description */}
        {issue.description && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <div className="text-gray-700 leading-relaxed">{issue.description}</div>
          </div>
        )}

        {/* Tabs Section */}
        {issue.tabs && issue.tabs.length > 0 && (
          <div className="mb-8">
            <TabSystem tabs={issue.tabs} />
          </div>
        )}

        {/* Comments Section (if no tabs) */}
        {!issue.tabs && issue.comments && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Comments ({issue.comments.length})
            </h2>
            <CommentSection
              comments={issue.comments}
              currentUser={issue.currentUser}
              onAddComment={issue.onAddComment}
            />
          </div>
        )}
      </div>

      {/* Sidebar */}
      {issue.timeline && issue.timeline.length > 0 && (
        <div className="w-[350px]">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>
            <Timeline items={issue.timeline} />
          </div>
        </div>
      )}
    </div>
  );
}
