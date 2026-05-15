export function BrainShapeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg
        className="h-[82%] max-h-[680px] w-[86%] max-w-[1080px] opacity-95"
        viewBox="0 0 900 620"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="brainFill" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f9fbfa" />
            <stop offset="48%" stopColor="#dcebf1" />
            <stop offset="100%" stopColor="#f7eee6" />
          </linearGradient>
          <filter id="brainShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="20" stdDeviation="24" floodColor="#17211d" floodOpacity="0.13" />
          </filter>
        </defs>
        <path
          d="M222 146C257 78 347 58 417 96C470 48 565 64 605 131C692 128 768 195 765 282C821 338 797 447 711 477C681 557 570 576 509 517C458 558 371 557 321 503C242 522 159 468 155 386C78 340 85 226 168 188C181 169 198 155 222 146Z"
          fill="url(#brainFill)"
          filter="url(#brainShadow)"
          stroke="#ffffff"
          strokeWidth="10"
        />
        <path
          d="M291 163C250 188 230 222 235 266C192 284 184 342 220 374M405 124C368 168 365 214 397 261C359 287 346 331 361 382M536 124C574 160 584 206 560 257C604 283 625 324 613 377M685 190C643 208 622 240 626 286C671 303 690 342 671 384M299 486C337 443 389 431 444 452C492 420 550 423 593 463"
          fill="none"
          stroke="#8ab2a5"
          strokeLinecap="round"
          strokeWidth="7"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}
