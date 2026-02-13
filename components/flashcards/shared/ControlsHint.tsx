/** Mobile/desktop controls hint text below the game area */
export function ControlsHint() {
  return (
    <div className="text-center text-gray-500 text-xs mt-3 sm:mt-4">
      <span className="sm:hidden">Drag up/down to move Pacman</span>
      <span className="hidden sm:inline">Arrow Keys or W/S to move Pacman</span>
    </div>
  );
}
