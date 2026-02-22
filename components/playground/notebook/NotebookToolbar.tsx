/**
 * NotebookToolbar — Yoopta toolbar/tools configuration
 * Exports plugin, mark, and tool configs for the Yoopta editor
 */

"use client";

// Plugins
import Paragraph from "@yoopta/paragraph";
import Headings from "@yoopta/headings";
import Lists from "@yoopta/lists";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Table from "@yoopta/table";
import Divider from "@yoopta/divider";

// Marks
import { Bold, Italic, Underline, Strike, CodeMark, Highlight } from "@yoopta/marks";

export const YOOPTA_PLUGINS = [
  Paragraph,
  Headings.HeadingOne,
  Headings.HeadingTwo,
  Headings.HeadingThree,
  Lists.BulletedList,
  Lists.NumberedList,
  Lists.TodoList,
  Blockquote,
  Callout,
  Code,
  Table,
  Divider,
] as any[];

export const YOOPTA_MARKS = [Bold, Italic, Underline, Strike, CodeMark, Highlight];
