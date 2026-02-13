/** Horizontal lane divider lines for Pacman game area */
export function LaneGuides({ laneCount }: { laneCount: number }) {
  return (
    <>
      {Array.from({ length: laneCount }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-b border-gray-700/30"
          style={{ top: `${((i + 1) / laneCount) * 100}%` }}
        />
      ))}
    </>
  );
}
