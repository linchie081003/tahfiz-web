type P = { size?: number; className?: string };
const base = (size = 24) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true as const });

export const NavHome = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" /></svg>
);
export const NavMic = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
);
export const NavSprout = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M11 21v-8M11 13C11 9 8 7 4 7c0 4 2.5 6 7 6zM13 15c0-3.5 2.5-6 7-6 0 4-2.5 6.500-7 6z" /></svg>
);
export const NavBook = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 4.5A2.500 2.500 0 0 1 6.500 2H20v16H6.500A2.500 2.500 0 0 0 4 20.500zM4 20.500A2.500 2.500 0 0 0 6.500 23H20v-3" /></svg>
);
export const NavChart = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="4" y="11" width="4" height="9" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><rect x="16" y="8" width="4" height="12" rx="1" /></svg>
);
export const NavSliders = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 8h9M17 8h3M4 16h3M11 16h9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /><circle cx="15" cy="8" r="2.400" /><circle cx="9" cy="16" r="2.400" /></svg>
);
export const NavFlame = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 2c1 4 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" /></svg>
);
export const NavStar = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 2l3 6.500 7 .9-5.200 4.800 1.400 7-6.200-3.500-6.200 3.500 1.400-7L2 9.400l7-.9z" /></svg>
);
export const NavDrop = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 3c3.500 4.500 6 7.500 6 11a6 6 0 0 1-12 0c0-3.500 2.500-6.500 6-11z" /></svg>
);
export const NavPlay = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M7 4l13 8-13 8z" /></svg>
);
export const NavCheck = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12.500l4.500 4.500L19 7.500" fill="none" stroke="currentColor" strokeWidth="3.200" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const NavUser = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.500 3.500-7 8-7s8 2.500 8 7z" /></svg>
);
export const NavLock = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" /></svg>
);
