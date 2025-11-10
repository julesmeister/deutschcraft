# FileCard Components

Reusable file manager components for displaying files and folders in a grid layout.

## Components

### `<FileCard />` - File/Folder Card
Displays a file or folder with icon, name, size, and optional menu button.

### `<FileGrid />` - Responsive Grid
Responsive grid container (1-4 columns based on screen size).

### `<FileSection />` - Section with Header
Groups files/folders under a section heading.

### `<ViewToggle />` - Grid/List Toggle
Segmented control to switch between grid and list views.

### File Icons
Pre-built icons for common file types: Folder, PDF, DOCX, XLSX, PPTX, Images, Figma.

---

## Basic Usage

### Simple File Grid

```tsx
import { FileCard, FileGrid, FileSection, FolderIcon, PDFIcon } from '@/components/ui/FileCard';

export function FileManager() {
  return (
    <FileSection title="Folders">
      <FileGrid>
        <FileCard
          icon={<FolderIcon />}
          name="Project_Files"
          size="21.8 MB"
          onClick={() => console.log('Folder clicked')}
          onMenuClick={() => console.log('Menu clicked')}
        />
        <FileCard
          icon={<PDFIcon />}
          name="Tech_design.pdf"
          size="2.2 MB"
          onClick={() => console.log('File clicked')}
          onMenuClick={() => console.log('Menu clicked')}
        />
      </FileGrid>
    </FileSection>
  );
}
```

### With View Toggle

```tsx
import { useState } from 'react';
import { ViewToggle } from '@/components/ui/FileCard';

export function FileManagerHeader() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-bold">File Manager</h3>
      <ViewToggle view={view} onViewChange={setView} />
    </div>
  );
}
```

### Multiple Sections

```tsx
<div>
  <FileSection title="Folders">
    <FileGrid>
      {folders.map((folder) => (
        <FileCard key={folder.id} icon={<FolderIcon />} {...folder} />
      ))}
    </FileGrid>
  </FileSection>

  <FileSection title="Files" className="mt-8">
    <FileGrid>
      {files.map((file) => (
        <FileCard key={file.id} icon={getFileIcon(file.type)} {...file} />
      ))}
    </FileGrid>
  </FileSection>
</div>
```

---

## API Reference

### FileCard Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `ReactNode` | ✅ | File/folder icon |
| `name` | `string` | ✅ | File/folder name |
| `size` | `string` | ✅ | File size display (e.g., "2.2 MB") |
| `onClick` | `() => void` | ❌ | Click handler for the card |
| `onMenuClick` | `() => void` | ❌ | Click handler for menu button |
| `className` | `string` | ❌ | Additional CSS classes |

### FileGrid Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | ✅ | Grid content (FileCards) |
| `className` | `string` | ❌ | Additional CSS classes |

**Grid Breakpoints:**
- Mobile: 1 column
- sm (640px+): 2 columns
- lg (1024px+): 3 columns
- 2xl (1536px+): 4 columns

### FileSection Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Section heading |
| `children` | `ReactNode` | ✅ | Section content |
| `className` | `string` | ❌ | Additional CSS classes |

### ViewToggle Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `view` | `'grid' \| 'list'` | ✅ | Current view mode |
| `onViewChange` | `(view) => void` | ✅ | View change handler |
| `className` | `string` | ❌ | Additional CSS classes |

---

## File Icons

Pre-built SVG icons for common file types:

```tsx
import {
  FolderIcon,
  PDFIcon,
  DOCXIcon,
  XLSXIcon,
  PPTXIcon,
  ImageIcon,
  FigmaIcon,
} from '@/components/ui/FileCard';

// Usage
<FileCard icon={<FolderIcon />} name="Documents" size="10.5 MB" />
<FileCard icon={<PDFIcon />} name="Report.pdf" size="2.2 MB" />
<FileCard icon={<DOCXIcon />} name="Proposal.docx" size="987.7 kB" />
```

**Available Icons:**
- `FolderIcon` - Yellow folder icon
- `PDFIcon` - Red PDF document
- `DOCXIcon` - Blue Word document
- `XLSXIcon` - Green Excel spreadsheet
- `PPTXIcon` - Orange PowerPoint
- `ImageIcon` - Green image file
- `FigmaIcon` - Dark Figma file with colored dots

---

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import {
  FileCard,
  FileGrid,
  FileSection,
  ViewToggle,
  FolderIcon,
  PDFIcon,
  DOCXIcon,
  ImageIcon,
} from '@/components/ui/FileCard';

export default function FileManagerPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: '1', name: 'Project_Files', size: '21.8 MB' },
    { id: '2', name: 'Documents', size: '10.5 MB' },
    { id: '3', name: 'Team_Resources', size: '783.1 kB' },
  ];

  const files = [
    { id: '1', name: 'Tech_design.pdf', size: '2.2 MB', icon: <PDFIcon /> },
    { id: '2', name: 'Project_Summary.docx', size: '987.7 kB', icon: <DOCXIcon /> },
    { id: '3', name: 'Modern_Laputa.jpg', size: '139.2 kB', icon: <ImageIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="md:flex-row md:items-center flex flex-col justify-between gap-y-4 gap-x-4">
            <h3 className="text-neutral-900 text-2xl font-bold leading-snug">
              File Manager
            </h3>
            <div className="flex items-center gap-x-2">
              <ViewToggle view={view} onViewChange={setView} />
              <button className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <FileSection title="Folders">
          <FileGrid>
            {folders.map((folder) => (
              <FileCard
                key={folder.id}
                icon={<FolderIcon />}
                name={folder.name}
                size={folder.size}
                onClick={() => console.log('Folder:', folder.name)}
                onMenuClick={() => console.log('Menu:', folder.name)}
              />
            ))}
          </FileGrid>
        </FileSection>

        <FileSection title="Files" className="mt-8">
          <FileGrid>
            {files.map((file) => (
              <FileCard
                key={file.id}
                icon={file.icon}
                name={file.name}
                size={file.size}
                onClick={() => console.log('File:', file.name)}
                onMenuClick={() => console.log('Menu:', file.name)}
              />
            ))}
          </FileGrid>
        </FileSection>
      </div>
    </div>
  );
}
```

---

## Design Features

- **Clean Cards** - White background, subtle border, hover shadow
- **Responsive Grid** - 1-4 columns based on screen size
- **Icon + Text Layout** - Icon on left, name + size on right
- **Menu Button** - Three-dot menu with hover effect
- **View Toggle** - Segmented control with active state
- **Consistent Spacing** - Gap utilities for even spacing

---

## Best Practices

✅ **DO:**
- Use appropriate icons for file types
- Keep file names concise (truncate long names)
- Display human-readable file sizes (MB, KB)
- Provide both click and menu interactions

❌ **DON'T:**
- Mix different icon styles
- Use overly long file names without truncation
- Forget to handle click events
- Override the responsive grid breakpoints unnecessarily
