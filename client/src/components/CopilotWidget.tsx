import { useEffect, useRef, useState } from "react";
import "./copilot.css";

const BRAND = {
  navy: "#163B66",
  sky:  "#5DB6FF",
  text: "#0B2545"
};

export default function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open, minimized]);

  return (
    <>
      {/* Floating launcher: C + tick */}
      <button
        className="ccb-launcher"
        aria-label={open ? "Hide CoreComplai Buddy" : "Open CoreComplai Buddy"}
        onClick={() => { setOpen(v => !v); setMinimized(false); }}
      >
        <LogoCTick size={28} />
      </button>

      {/* Chat panel */}
      {open && (
        <section
          className="ccb-panel"
          role="dialog"
          aria-modal="true"
          aria-label="CoreComplai Buddy chat panel"
        >
          <header className="ccb-header">
            <span className="ccb-logo-chip"><LogoCTick size={20} /></span>
            <h1 className="ccb-title">
              <span className="ccb-title-core">CoreCompl</span>
              <span className="ccb-title-ai">ai</span> Buddy
            </h1>
            <div className="ccb-header-actions">
              <IconButton
                ariaLabel="Minimize"
                onClick={() => setMinimized(m => !m)}
              >
                <MinIcon />
              </IconButton>
              <IconButton ariaLabel="Close" onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
          </header>

          {!minimized && (
            <>
              <div className="ccb-messages">
                <SystemMessage>
                  Hi! I'm your CoreComplai Buddy. I can help you navigate frameworks,
                  explain control statuses, or draft evidence notes.
                </SystemMessage>
                <UserMessage>Show me APGF-MS controls not started yet.</UserMessage>
                <AssistantMessage>
                  There are <strong>0</strong> controls not started. Most are compliant;
                  10 in progress, 6 pending evidence.
                </AssistantMessage>
              </div>

              <footer className="ccb-composer">
                <form onSubmit={(e) => e.preventDefault()} className="ccb-form">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    className="ccb-input"
                    placeholder="Ask CoreComplai Buddy… (e.g., 'summarise recent activity')"
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 160) + "px";
                    }}
                  />
                  <button type="submit" className="ccb-send">Send</button>
                </form>
              </footer>
            </>
          )}

          {minimized && (
            <div className="ccb-min-note">Collapsed — click the round launcher to reopen</div>
          )}
        </section>
      )}
    </>
  );
}

/* ———— Message bubbles ———— */
function SystemMessage({ children }: { children: React.ReactNode }) {
  return <div className="ccb-bubble ccb-bubble-system">{children}</div>;
}
function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="ccb-bubble ccb-bubble-user">{children}</div>;
}
function AssistantMessage({ children }: { children: React.ReactNode }) {
  return <div className="ccb-bubble ccb-bubble-assistant">{children}</div>;
}

/* ———— Buttons & Icons ———— */
function IconButton({ ariaLabel, onClick, children }: { ariaLabel: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button aria-label={ariaLabel} onClick={onClick} className="ccb-icon-btn">
      {children}
    </button>
  );
}
function MinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M5 12h14" stroke={BRAND.navy} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={BRAND.navy} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ———— Brand C + Tick ———— */
function LogoCTick({ size = 32 }: { size?: number }) {
  const s = size, r = s / 2, stroke = Math.max(2, Math.round(s * 0.16));
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      <defs>
        <mask id="ccb-c-gap">
          <rect x="0" y="0" width={s} height={s} fill="white" />
          {/* gap to form the 'C' */}
          <rect x={s * 0.65} y={s * 0.1} width={s * 0.4} height={s * 0.8} fill="black" rx={s * 0.1} />
        </mask>
      </defs>
      <circle cx={r} cy={r} r={r - stroke} fill="none" stroke={BRAND.sky} strokeWidth={stroke} mask="url(#ccb-c-gap)" />
      <path d={`M ${s*0.28} ${s*0.55} L ${s*0.45} ${s*0.70} L ${s*0.75} ${s*0.35}`}
            fill="none" stroke={BRAND.navy} strokeWidth={stroke*0.9}
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
