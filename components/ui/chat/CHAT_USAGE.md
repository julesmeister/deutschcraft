# Chat Components Usage Guide

Complete chat interface components with sidebar, messages, and input.

## Components

- **ChatLayout** - Container for sidebar + chat window
- **ChatSidebar** - Contacts list with tabs and search
- **ChatContactItem** - Individual contact/conversation item
- **ChatWindow** - Main chat area with header and input
- **ChatMessage** - Individual message bubbles

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import {
  ChatLayout,
  ChatSidebar,
  ChatContactItem,
  ChatWindow,
  ChatMessage,
} from '@/components/ui/chat';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedContact, setSelectedContact] = useState('shannon');

  const contacts = [
    {
      id: 'shannon',
      name: 'Shannon Baker',
      avatar: '/avatars/shannon.jpg',
      lastMessage: 'Will do. Appreciate it!',
      time: '12:39 PM',
      hasUnread: true,
    },
    {
      id: 'jessica',
      name: 'Jessica Wells',
      avatar: '/avatars/jessica.jpg',
      lastMessage: "Perfect. I'll pack some snacks",
      time: '10:39 PM',
      hasUnread: true,
    },
  ];

  const messages = [
    { id: 1, message: 'Hey, can I ask you something?', isSent: true },
    { id: 2, message: 'Sure, what's up?', isSent: false, avatar: '/avatars/shannon.jpg' },
    { id: 3, message: "I'm thinking about applying for a new job", isSent: true },
  ];

  return (
    <ChatLayout
      sidebar={
        <ChatSidebar
          title="Chat"
          onSearchClick={() => console.log('Search')}
          tabs={[
            {
              label: 'Personal',
              icon: <PersonIcon />,
              active: activeTab === 'personal',
              onClick: () => setActiveTab('personal'),
            },
            {
              label: 'Groups',
              icon: <GroupIcon />,
              active: activeTab === 'groups',
              onClick: () => setActiveTab('groups'),
            },
          ]}
          onNewChat={() => console.log('New chat')}
        >
          {contacts.map((contact) => (
            <ChatContactItem
              key={contact.id}
              {...contact}
              isActive={selectedContact === contact.id}
              onClick={() => setSelectedContact(contact.id)}
            />
          ))}
        </ChatSidebar>
      }
      chatWindow={
        <ChatWindow
          contactName="Shannon Baker"
          contactAvatar="/avatars/shannon.jpg"
          statusText="last seen recently"
          onSendMessage={(msg) => console.log('Send:', msg)}
          onFileUpload={(file) => console.log('Upload:', file)}
          onMenuClick={() => console.log('Menu')}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
        </ChatWindow>
      }
    />
  );
}
```

## Individual Components

### ChatLayout

Container for sidebar + chat window.

```tsx
<ChatLayout
  sidebar={<ChatSidebar>...</ChatSidebar>}
  chatWindow={<ChatWindow>...</ChatWindow>}
/>
```

### ChatSidebar

```tsx
<ChatSidebar
  title="Chat"
  onSearchClick={() => {}}
  tabs={[
    {
      label: 'Personal',
      icon: <svg>...</svg>,
      active: true,
      onClick: () => {},
    },
  ]}
  onNewChat={() => {}}
  newChatText="New chat"
>
  {/* ChatContactItem components */}
</ChatSidebar>
```

### ChatContactItem

```tsx
<ChatContactItem
  name="Shannon Baker"
  avatar="/avatar.jpg"
  lastMessage="Will do. Appreciate it!"
  time="12:39 PM"
  hasUnread={true}
  isActive={false}
  onClick={() => {}}
/>
```

### ChatWindow

```tsx
<ChatWindow
  contactName="Shannon Baker"
  contactAvatar="/avatar.jpg"
  statusText="last seen recently"
  inputPlaceholder="Enter a message"
  onSendMessage={(message) => console.log(message)}
  onFileUpload={(file) => console.log(file)}
  onMenuClick={() => {}}
>
  {/* ChatMessage components */}
</ChatWindow>
```

### ChatMessage

```tsx
// Sent message (right side, no avatar)
<ChatMessage
  message="Hey, how are you?"
  isSent={true}
/>

// Received message (left side, with avatar)
<ChatMessage
  message="I'm good, thanks!"
  isSent={false}
  avatar="/avatar.jpg"
  senderName="Shannon"
/>
```

## Props Reference

### ChatLayoutProps
- `sidebar`: Sidebar component
- `chatWindow`: Chat window component

### ChatSidebarProps
- `title`: Title text (default: "Chat")
- `onSearchClick`: Search button handler
- `tabs`: Array of tab objects
- `children`: ContactItem components
- `onNewChat`: New chat button handler
- `newChatText`: Button text (default: "New chat")

### ChatContactItemProps
- `name`: Contact name
- `avatar`: Avatar URL
- `lastMessage`: Preview text
- `time`: Time string
- `hasUnread`: Show unread badge
- `isActive`: Active state
- `onClick`: Click handler

### ChatWindowProps
- `contactName`: Contact name
- `contactAvatar`: Avatar URL
- `statusText`: Status (default: "last seen recently")
- `children`: Message components
- `inputPlaceholder`: Input placeholder
- `onSendMessage`: (message: string) => void
- `onFileUpload`: (file: File) => void
- `onMenuClick`: Menu button handler

### ChatMessageProps
- `message`: Message text
- `isSent`: Sent (true) or received (false)
- `avatar`: Avatar URL (for received)
- `senderName`: Sender name (accessibility)

## Features

- ✅ Responsive sidebar (hidden on mobile)
- ✅ Tab switching (Personal/Groups)
- ✅ Search functionality
- ✅ Contact list with avatars
- ✅ Unread message indicators
- ✅ Active contact highlighting
- ✅ Message bubbles (sent/received)
- ✅ Message input with Enter key support
- ✅ File upload button
- ✅ Auto-scroll to bottom (implement with ref)
- ✅ Hover effects throughout

## State Management Example

```tsx
const [contacts, setContacts] = useState([]);
const [messages, setMessages] = useState([]);
const [selectedContact, setSelectedContact] = useState(null);

const handleSendMessage = (message: string) => {
  setMessages([...messages, {
    id: Date.now(),
    message,
    isSent: true,
    timestamp: new Date(),
  }]);
};
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line (implement with textarea)

## Customization

All components use Tailwind classes and can be customized via:
- Tailwind config for colors
- Component props for behavior
- CSS classes for styling
