import React, { useEffect, useMemo, useRef, useState } from "react";

const DEMO_ITEMS = [
  { id: "apgf-ms", name: "Australian Payroll Governance Management System" },
  { id: "iso-9001", name: "ISO 9001" },
  { id: "iso-27001", name: "ISO/IEC 27001" },
];

export default function ActiveFrameworkDropdown({
  value,
  onChange,
  items = DEMO_ITEMS,
  label = "Active Framework",
  className = "",
}: {
  value?: string;
  onChange?: (id: string, item: any) => void;
  items?: { id: string; name: string }[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => items.find(i => i.id === value) || items[0], [items, value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
      if (e.key === "Tab") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!open) return;
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function selectItem(item: { id: string; name: string }) {
    onChange?.(item.id, item);
    setOpen(false);
    btnRef.current?.focus();
  }

  return (
    <div className={`${className}`}>
      <div className="relative">
        <button
          ref={btnRef}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="group w-80 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm transition-all select-none flex items-center gap-2 hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          data-testid="select-active-framework"
        >
          <span className="grid place-items-center h-4 w-4 rounded-full bg-primary/10 shrink-0">
            <CWithTick size={14} />
          </span>

          <div className="flex-1 truncate text-left font-medium">
            {selected?.name}
          </div>

          <CaretDown aria-hidden className="h-4 w-4 opacity-50 shrink-0" />
        </button>

        {open && (
          <div
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 w-80 rounded-md border bg-background shadow-lg overflow-hidden animate-fadeIn"
          >
            <ul className="py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    role="option"
                    aria-selected={selected?.id === item.id}
                    onClick={() => selectItem(item)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover-elevate active-elevate-2 transition-all duration-150 text-left"
                    data-testid={`select-framework-${item.id}`}
                  >
                    <span className="font-medium truncate">{item.name}</span>
                    {selected?.id === item.id && <CheckSmall />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CWithTick({ size = 40 }: { size?: number }) {
  const s = size;
  const r = s / 2;
  const stroke = Math.max(2, Math.round(s * 0.11));
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden className="text-primary">
      <defs>
        <mask id="c-gap2">
          <rect x="0" y="0" width={s} height={s} fill="white" />
          <rect x={s * 0.68} y={s * 0.08} width={s * 0.34} height={s * 0.84} fill="black" rx={s * 0.08} />
        </mask>
      </defs>
      <circle cx={r} cy={r} r={r - stroke} fill="none" stroke="currentColor" strokeWidth={stroke} mask="url(#c-gap2)" />
      <path d={`M ${s*0.28} ${s*0.52} L ${s*0.44} ${s*0.68} L ${s*0.72} ${s*0.34}`} fill="none" stroke="currentColor" strokeWidth={stroke * 0.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaretDown({ className = "", color = "currentColor", ...props }: { className?: string; color?: string; [key: string]: any }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckSmall({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-primary" aria-hidden>
      <path d="M5 10.5l3 3 7-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
