/**
 * Difficulty Icons
 * Icons for flashcard difficulty ratings
 */

import React from 'react';

interface IconProps {
  className?: string;
}

export const ForgottenIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.5 5.5C4.5 4.67157 5.17157 4 6 4C6.82843 4 7.5 4.67157 7.5 5.5C7.5 6.32843 6.82843 7 6 7C5.17157 7 4.5 6.32843 4.5 5.5ZM10 4C9.17157 4 8.5 4.67157 8.5 5.5C8.5 6.32843 9.17157 7 10 7C10.8284 7 11.5 6.32843 11.5 5.5C11.5 4.67157 10.8284 4 10 4ZM5.25 10C5.25 9.58579 5.58579 9.25 6 9.25H10C10.4142 9.25 10.75 9.58579 10.75 10C10.75 11.5188 9.51878 12.75 8 12.75C6.48122 12.75 5.25 11.5188 5.25 10Z"
    />
  </svg>
);

export const HardIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.5 5.5C4.5 4.67157 5.17157 4 6 4C6.82843 4 7.5 4.67157 7.5 5.5C7.5 6.32843 6.82843 7 6 7C5.17157 7 4.5 6.32843 4.5 5.5ZM10 4C9.17157 4 8.5 4.67157 8.5 5.5C8.5 6.32843 9.17157 7 10 7C10.8284 7 11.5 6.32843 11.5 5.5C11.5 4.67157 10.8284 4 10 4ZM5.5 9.75C5.5 9.33579 5.83579 9 6.25 9H9.75C10.1642 9 10.5 9.33579 10.5 9.75C10.5 9.88807 10.3881 10 10.25 10H5.75C5.61193 10 5.5 9.88807 5.5 9.75Z"
    />
  </svg>
);

export const GoodIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.5 5.5C4.5 4.67157 5.17157 4 6 4C6.82843 4 7.5 4.67157 7.5 5.5C7.5 6.32843 6.82843 7 6 7C5.17157 7 4.5 6.32843 4.5 5.5ZM10 4C9.17157 4 8.5 4.67157 8.5 5.5C8.5 6.32843 9.17157 7 10 7C10.8284 7 11.5 6.32843 11.5 5.5C11.5 4.67157 10.8284 4 10 4ZM5.25 11C5.25 10.5858 5.58579 10.25 6 10.25H10C10.4142 10.25 10.75 10.5858 10.75 11C10.75 11.4142 10.4142 11.75 10 11.75H6C5.58579 11.75 5.25 11.4142 5.25 11Z"
    />
  </svg>
);

export const EasyIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4.5 5.5C4.5 4.67157 5.17157 4 6 4C6.82843 4 7.5 4.67157 7.5 5.5C7.5 6.32843 6.82843 7 6 7C5.17157 7 4.5 6.32843 4.5 5.5ZM10 4C9.17157 4 8.5 4.67157 8.5 5.5C8.5 6.32843 9.17157 7 10 7C10.8284 7 11.5 6.32843 11.5 5.5C11.5 4.67157 10.8284 4 10 4ZM5.75 10C5.33579 10 5 10.3358 5 10.75C5 11.7165 5.7835 12.5 6.75 12.5H9.25C10.2165 12.5 11 11.7165 11 10.75C11 10.3358 10.6642 10 10.25 10H5.75Z"
    />
  </svg>
);

export const DifficultyIcons = {
  Forgotten: ForgottenIcon,
  Hard: HardIcon,
  Good: GoodIcon,
  Easy: EasyIcon,
};
