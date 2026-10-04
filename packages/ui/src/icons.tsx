/** Ícones próprios da plataforma: traço 1.75, grade 24, cantos arredondados. */
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const IconHome = (p: P) => (<svg {...base(p)}><path d="M3.5 10.5 12 4l8.5 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5h4v5" /></svg>);
export const IconCases = (p: P) => (<svg {...base(p)}><rect x="3.5" y="6.5" width="17" height="13" rx="2.5" /><path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" /><path d="M3.5 12h17" /></svg>);
export const IconPlay = (p: P) => (<svg {...base(p)}><path d="M7 5.5v13l11-6.5z" /></svg>);
export const IconChart = (p: P) => (<svg {...base(p)}><path d="M4 4v16h16" /><path d="m7.5 14 3.5-4 3 2.5L19 7" /></svg>);
export const IconBell = (p: P) => (<svg {...base(p)}><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg>);
export const IconLibrary = (p: P) => (<svg {...base(p)}><rect x="4" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><path d="m16.5 5.2 3.6 14.3" /></svg>);
export const IconTeam = (p: P) => (<svg {...base(p)}><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9.5" r="2.3" /><path d="M16 14.6a4.5 4.5 0 0 1 5 4.4" /></svg>);
export const IconSettings = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>);
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></svg>);
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const IconX = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconMinus = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const IconCloudOff = (p: P) => (<svg {...base(p)}><path d="M7.5 18.5h9.8a3.7 3.7 0 0 0 1-7.3A6 6 0 0 0 7 9.2a4.7 4.7 0 0 0 .5 9.3z" /><path d="m4 4 16 16" /></svg>);
export const IconCloudCheck = (p: P) => (<svg {...base(p)}><path d="M7.5 18.5h9.8a3.7 3.7 0 0 0 1-7.3A6 6 0 0 0 7 9.2a4.7 4.7 0 0 0 .5 9.3z" /><path d="m9.5 13.5 2 2 3.5-3.5" /></svg>);
export const IconChevronRight = (p: P) => (<svg {...base(p)}><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>);
export const IconChevronLeft = (p: P) => (<svg {...base(p)}><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>);
export const IconArrowRight = (p: P) => (<svg {...base(p)}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></svg>);
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const IconNote = (p: P) => (<svg {...base(p)}><path d="M6 3.5h8.5L19 8v12.5H6z" /><path d="M14 3.5V8h5M9 12.5h7M9 16h5" /></svg>);
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 3.5 5 6v5.5c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>);
export const IconLock = (p: P) => (<svg {...base(p)}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>);
export const IconTablet = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M17.5 12h.01" /></svg>);
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M14 4.5H6.5v15H14" /><path d="M10.5 12H20M16.5 8.5 20 12l-3.5 3.5" /></svg>);
export const IconPause = (p: P) => (<svg {...base(p)}><path d="M8.5 5.5v13M15.5 5.5v13" /></svg>);
export const IconStop = (p: P) => (<svg {...base(p)}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>);
export const IconSpark = (p: P) => (<svg {...base(p)}><path d="M12 3.5 13.8 9 19.5 10.5 13.8 12.2 12 18l-1.8-5.8-5.7-1.7L10.2 9z" /><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>);
export const IconTarget = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></svg>);
export const IconLayers = (p: P) => (<svg {...base(p)}><path d="m12 4 8.5 4.5L12 13 3.5 8.5z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" /></svg>);
export const IconUser = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconAlert = (p: P) => (<svg {...base(p)}><path d="M12 4 21 19.5H3z" /><path d="M12 10v4M12 16.8h.01" /></svg>);
export const IconInfo = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></svg>);
export const IconBook = (p: P) => (<svg {...base(p)}><path d="M4.5 5.5A2 2 0 0 1 6.5 4H19v14.5H6.5a2 2 0 0 0-2 2z" /><path d="M4.5 20.5V5.5" /></svg>);
export const IconFlask = (p: P) => (<svg {...base(p)}><path d="M9.5 3.5h5M10 3.5v6L4.8 18a1.7 1.7 0 0 0 1.5 2.5h11.4a1.7 1.7 0 0 0 1.5-2.5L14 9.5v-6" /><path d="M7.5 14.5h9" /></svg>);
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 19.5s-7.5-4.4-7.5-9.7A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6c0 5.3-7.5 9.7-7.5 9.7z" /></svg>);
export const IconEye = (p: P) => (<svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></svg>);
export const IconSun = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>);
export const IconMoon = (p: P) => (<svg {...base(p)}><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /></svg>);
export const IconFile = (p: P) => (<svg {...base(p)}><path d="M6 3.5h8.5L19 8v12.5H6z" /><path d="M14 3.5V8h5" /></svg>);
export const IconRoute = (p: P) => (<svg {...base(p)}><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" /></svg>);
export const IconUndo = (p: P) => (<svg {...base(p)}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v1a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>);
export const IconCommand = (p: P) => (<svg {...base(p)}><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>);
export const IconFilter = (p: P) => (<svg {...base(p)}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
export const IconPrinter = (p: P) => (<svg {...base(p)}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>);
export const IconList = (p: P) => (<svg {...base(p)}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>);
export const IconGrid = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>);
export const IconCalendar = (p: P) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
export const IconSmile = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>);
export const IconSliders = (p: P) => (<svg {...base(p)}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>);

