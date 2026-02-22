/**
 * PanelResizeHandle
 * Custom styled resize handle (Separator) between panels
 */

"use client";

import { Separator } from "react-resizable-panels";

export function PanelResizeHandle() {
  return (
    <Separator className="group relative w-2 mx-0.5 flex items-center justify-center data-[separator]:cursor-col-resize">
      <div className="w-[3px] h-12 rounded-full bg-gray-200 transition-all duration-150 group-hover:bg-brand-purple/40 group-hover:h-16 group-data-[resize-handle-active]:bg-brand-purple/60 group-data-[resize-handle-active]:h-20" />
    </Separator>
  );
}
