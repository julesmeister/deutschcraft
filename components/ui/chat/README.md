# Chat Components

Reusable chat components for AI conversations, teacher-student messaging, and more.

## Components

### `<Chat />` - Main Container
The all-in-one chat interface with messages, input, and optional sidebar.

### `<ChatMessage />` - Individual Message
Displays a single message with avatar, content, and action buttons.

### `<ChatInput />` - Input Area
Text input with send button and optional file attachments.

### `<ChatSidebar />` - Conversation History
Sidebar showing previous conversations with search.

### `<Avatar />` - User/AI Avatar
Circular avatar component with image or fallback text.

## Basic Usage

```tsx
'use client';

import { useState } from 'react';
import { Chat, Message, ChatHistoryItem } from '@/components/ui/chat';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you learn German today?',
      role: 'assistant',
      timestamp: Date.now(),
    },
  ]);
  const [conversations, setConversations] = useState<ChatHistoryItem[]>([
    {
      id: 'conv-1',
      title: 'German Grammar',
      preview: 'Can you explain the dative case?',
      timestamp: Date.now() - 3600000,
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is an AI response. In a real app, call your AI API here.',
        role: 'assistant',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId('');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    // Load messages for this conversation from your database
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  return (
    <div className="h-screen">
      <Chat
        messages={messages}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSendMessage={handleSendMessage}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        placeholder="Ask me anything about German..."
        allowAttachments={false}
        showSidebar={true}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## Individual Component Usage

### ChatMessage Only

```tsx
import { ChatMessage, Message } from '@/components/ui/chat';

const message: Message = {
  id: '1',
  content: 'Hello!',
  role: 'user',
  timestamp: Date.now(),
  avatarSrc: '/avatars/user.jpg',
};

<ChatMessage
  message={message}
  onCopy={(content) => console.log('Copied:', content)}
  onLike={(id) => console.log('Liked:', id)}
  onDislike={(id) => console.log('Disliked:', id)}
/>
```

### ChatInput Only

```tsx
import { ChatInput } from '@/components/ui/chat';

<ChatInput
  onSendMessage={(message, attachments) => {
    console.log('Message:', message);
    console.log('Attachments:', attachments);
  }}
  placeholder="Type your message..."
  allowAttachments={true}
  disabled={false}
/>
```

### ChatSidebar Only

```tsx
import { ChatSidebar, ChatHistoryItem } from '@/components/ui/chat';

const conversations: ChatHistoryItem[] = [
  {
    id: '1',
    title: 'Conversation 1',
    preview: 'This is a preview...',
    timestamp: Date.now(),
  },
];

<ChatSidebar
  conversations={conversations}
  activeConversationId="1"
  onSelectConversation={(id) => console.log('Selected:', id)}
  onNewChat={() => console.log('New chat')}
  onDeleteConversation={(id) => console.log('Delete:', id)}
/>
```

## Props

### Chat Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `messages` | `Message[]` | Yes | Array of chat messages |
| `onSendMessage` | `(message: string, attachments?: File[]) => void` | Yes | Callback when user sends a message |
| `conversations` | `ChatHistoryItem[]` | No | Array of conversation history |
| `activeConversationId` | `string` | No | ID of currently active conversation |
| `onSelectConversation` | `(id: string) => void` | No | Callback when conversation is selected |
| `onNewChat` | `() => void` | No | Callback for new chat button |
| `onDeleteConversation` | `(id: string) => void` | No | Callback to delete conversation |
| `placeholder` | `string` | No | Input placeholder text |
| `allowAttachments` | `boolean` | No | Enable file attachments (default: false) |
| `showSidebar` | `boolean` | No | Show conversation sidebar (default: true) |
| `isLoading` | `boolean` | No | Show loading indicator (default: false) |

### Message Type

```typescript
interface Message {
  id: string;
  content: string; // Can include HTML
  role: 'user' | 'assistant';
  timestamp: number;
  avatarSrc?: string;
}
```

### ChatHistoryItem Type

```typescript
interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
}
```

## Styling

All components use Tailwind CSS and follow the project's design system:
- **Primary color**: Blue (#3B82F6)
- **Text colors**: Neutral scale
- **Borders**: Neutral-200
- **Backgrounds**: White and Neutral-100

## Features

✅ Responsive design (desktop and mobile)
✅ Auto-scroll to latest message
✅ Copy message to clipboard
✅ Like/dislike messages
✅ File attachments support
✅ Conversation search
✅ Loading states
✅ Empty states
✅ Keyboard shortcuts (Enter to send)
✅ HTML content rendering (with sanitization recommended)

## Use Cases

- **AI Tutoring**: Student asks questions, AI responds with German lessons
- **Teacher-Student Chat**: Direct messaging between teachers and students
- **Flashcard Practice**: AI-powered conversational flashcard practice
- **Sentence Builder**: Interactive AI-assisted sentence construction

## Security Notes

⚠️ **HTML Content**: The ChatMessage component uses `dangerouslySetInnerHTML`. In production:
1. Sanitize HTML content with a library like DOMPurify
2. Or convert markdown to safe HTML
3. Never render user input as HTML without sanitization

⚠️ **File Uploads**: When using `allowAttachments={true}`:
1. Validate file types and sizes on the server
2. Scan for malware
3. Store in secure cloud storage (not in database)

## Future Enhancements

- [ ] Markdown rendering instead of raw HTML
- [ ] Voice input
- [ ] Real-time typing indicators
- [ ] Message reactions (beyond like/dislike)
- [ ] Code syntax highlighting
- [ ] Image message support
- [ ] Edit sent messages
- [ ] Message threading
