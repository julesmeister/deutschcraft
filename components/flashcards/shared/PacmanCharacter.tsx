/** Pacman SVG character with animated mouth */
export function PacmanCharacter({ mouthOpen }: { mouthOpen: boolean }) {
  const angle = mouthOpen ? 25 : 5;
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={`M50,50 L${50 + 45 * cos},${50 - 45 * sin} A45,45 0 1,0 ${50 + 45 * cos},${50 + 45 * sin} Z`}
          fill="#FACC15"
        />
        <circle cx="55" cy="25" r="6" fill="#000" />
      </svg>
    </div>
  );
}
