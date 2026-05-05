import React, { useState, useEffect, useCallback } from "react";

// ───────────────────────────────────────────────
// VIBE DECODER — Vanilla Logic (Zero-Cost / No API)
// ───────────────────────────────────────────────

interface DecodedResult {
  plainEnglish: string;
  analogy: string;
  jargon: Record<string, string>;
}

interface VibeEntry {
  plainEnglish: string;
  analogy: string;
  jargon: Record<string, string>;
}

const vibeLibrary: Record<string, VibeEntry> = {
  "Using canonical pf_* ids so answers hydrate businessProfile": {
    plainEnglish:
      "Giving the first few questions specific ID tags so the app can build a profile of your business and use that to skip irrelevant questions later.",
    analogy:
      "Like a restaurant host asking if you have a reservation so they can take you straight to your table instead of making you wait in line.",
    jargon: {
      Canonical: "Standardized",
      Hydrate: "Fill with data",
      Profile: "The saved folder",
    },
  },
  "Evaluate rule fires when main condition passes and no exception condition passes": {
    plainEnglish:
      "A rule only happens if the main trigger is 'Yes' and there isn't a special reason (exception) to stop it.",
    analogy:
      "A plumber goes to a job if a leak is reported, UNLESS the customer already called to cancel.",
    jargon: {
      Evaluate: "Check the math",
      Exception: "The 'Unless' clause",
      Fires: "Triggers the action",
    },
  },
  "Upserting triad JSON into Supabase with owner-context filters": {
    plainEnglish:
      "Saving your business rules to the cloud and making sure the system only shows you YOUR data, not another company's.",
    analogy:
      "Locking your blueprints in a secure job-site safe that only your key can open.",
    jargon: {
      Upsert: "Update or Insert",
      Triad: "The 3-part rule",
      "Owner-Context": "Privacy wall",
    },
  },
};

// ───────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ───────────────────────────────────────────────

const STORAGE_KEY = "vibe-decoder-brain";

interface SavedDecode {
  id: string;
  rawInput: string;
  result: DecodedResult;
  savedAt: string;
}

function loadBrain(): SavedDecode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToBrain(entry: SavedDecode): void {
  const existing = loadBrain();
  const updated = [entry, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function deleteFromBrain(id: string): void {
  const existing = loadBrain();
  const updated = existing.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ───────────────────────────────────────────────
// UI COMPONENTS
// ───────────────────────────────────────────────

const OutlinedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  subtext?: string;
  className?: string;
}> = ({ children, onClick, disabled, type = "button", subtext, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex flex-col items-center justify-center
        border-2 border-[#ffffff] bg-[#000000] text-[#000000]
        rounded-[10px] px-[30px] py-[30px]
        transition-all duration-200
        hover:bg-[#ffffff] hover:text-[#000000]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#000000] disabled:hover:text-[#000000]
        ${className}
      `}
    >
      <span
        className="font-medium text-[30px] leading-[1.2] tracking-[-0.6px]"
        style={{ fontFamily: "'Staatliches', 'IPM', ui-sans-serif, system-ui, sans-serif" }}
      >
        {children}
      </span>
      {subtext && (
        <span
          className="mt-[10px] text-[13px] leading-[1.2] text-[#666666] font-normal"
          style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
        >
          {subtext}
        </span>
      )}
    </button>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    className="text-[16px] font-medium leading-[1.4] text-[#ff5c00] mb-[17px]"
    style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
  >
    {children}
  </p>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`border-2 border-[#ffffff] rounded-[10px] p-[30px] ${className}`}>
    {children}
  </div>
);

const JargonBadge: React.FC<{ term: string; definition: string }> = ({ term, definition }) => (
  <div className="border border-[#666666] rounded-[10px] px-[17px] py-[11px]">
    <span
      className="text-[#ff5c00] text-[13px] font-normal leading-[1.2]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      {term}
    </span>
    <span
      className="text-[#666666] text-[13px] font-normal leading-[1.2] mx-[10px]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      —
    </span>
    <span
      className="text-[#ffffff] text-[13px] font-normal leading-[1.2]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      {definition}
    </span>
  </div>
);

// ───────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────

export default function VibeDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [matchedKey, setMatchedKey] = useState<string>("");
  const [brain, setBrain] = useState<SavedDecode[]>([]);
  const [showBrain, setShowBrain] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load brain on mount
  useEffect(() => {
    setBrain(loadBrain());
  }, []);

  // Clear "just saved" state after delay
  useEffect(() => {
    if (justSaved) {
      const t = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [justSaved]);

  const handleDecode = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Exact match first
    if (vibeLibrary[trimmed]) {
      setResult(vibeLibrary[trimmed]);
      setMatchedKey(trimmed);
      return;
    }

    // Fuzzy match: check if input contains any library key
    for (const key of Object.keys(vibeLibrary)) {
      if (trimmed.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed.toLowerCase())) {
        setResult(vibeLibrary[key]);
        setMatchedKey(key);
        return;
      }
    }

    // No match
    setResult(null);
    setMatchedKey("");
  }, [input]);

  const handleSave = useCallback(() => {
    if (!result || !matchedKey) return;
    const entry: SavedDecode = {
      id: crypto.randomUUID(),
      rawInput: input,
      result,
      savedAt: new Date().toISOString(),
    };
    saveToBrain(entry);
    setBrain(loadBrain());
    setJustSaved(true);
  }, [result, matchedKey, input]);

  const handleDelete = useCallback((id: string) => {
    deleteFromBrain(id);
    setBrain(loadBrain());
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleDecode();
    }
  };

  return (
    <div
      className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col items-center"
      style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Decorative corner brackets */}
      <div className="fixed top-[30px] left-[30px] w-[35px] h-[35px] border-l-2 border-t-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed top-[30px] right-[30px] w-[35px] h-[35px] border-r-2 border-t-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed bottom-[30px] left-[30px] w-[35px] h-[35px] border-l-2 border-b-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed bottom-[30px] right-[30px] w-[35px] h-[35px] border-r-2 border-b-2 border-[#ffffff] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-[720px] mt-[156px] mb-[35px] px-[30px] text-center">
        <h1
          className="text-[60px] font-medium leading-[1.3] tracking-[-1.2px] text-[#ffffff] mb-[25px]"
          style={{ fontFamily: "'Staatliches', 'IPM', ui-sans-serif, system-ui, sans-serif" }}
        >
          VIBE DECODER
        </h1>
        <p className="text-[16px] font-medium leading-[1.4] text-[#ff5c00]">
          PASTE THE JARGON. GET THE TRUTH.
        </p>
      </header>

      {/* Input Section */}
      <main className="w-full max-w-[720px] px-[30px] flex flex-col gap-[10px]">
        <Card>
          <SectionLabel>INPUT RAW CODE / JARGON</SectionLabel>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your corporate gibberish here..."
            className="w-full bg-[#000000] border-2 border-[#ffffff] rounded-[10px] p-[17px] text-[16px] font-medium leading-[1.4] text-[#ffffff] placeholder-[#666666] resize-none focus:outline-none focus:border-[#ff5c00] transition-colors"
            style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
            rows={4}
          />
          <div className="flex items-center justify-between mt-[17px]">
            <span
              className="text-[10px] leading-[1] text-[#666666]"
              style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
            >
              {input.length} CHARS · CMD+ENTER TO DECODE
            </span>
            <div className="flex gap-[10px]">
              <OutlinedButton
                onClick={() => {
                  setInput("");
                  setResult(null);
                  setMatchedKey("");
                }}
                subtext="CLEAR"
              >
                RESET
              </OutlinedButton>
              <OutlinedButton onClick={handleDecode} subtext="TRANSLATE">
                DECODE
              </OutlinedButton>
            </div>
          </div>
        </Card>

        {/* Result Section */}
        {result && (
          <div className="mt-[35px] flex flex-col gap-[10px]">
            <Card>
              <SectionLabel>PLAIN ENGLISH</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#ffffff] mb-[25px]"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                {result.plainEnglish}
              </p>

              <SectionLabel>REAL-WORLD ANALOGY</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#ffffff] mb-[25px] italic"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                “{result.analogy}”
              </p>

              <SectionLabel>JARGON BREAKDOWN</SectionLabel>
              <div className="flex flex-wrap gap-[10px] mb-[25px]">
                {Object.entries(result.jargon).map(([term, definition]) => (
                  <JargonBadge key={term} term={term} definition={definition} />
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#666666] pt-[17px]">
                <span
                  className="text-[10px] leading-[1] text-[#666666]"
                  style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                >
                  MATCHED: {matchedKey.slice(0, 40)}
                  {matchedKey.length > 40 ? "…" : ""}
                </span>
                <OutlinedButton
                  onClick={handleSave}
                  subtext={justSaved ? "SAVED ✓" : "LOCALSTORAGE"}
                  className={justSaved ? "border-[#ff5c00]" : ""}
                >
                  {justSaved ? "SAVED" : "SAVE TO BRAIN"}
                </OutlinedButton>
              </div>
            </Card>
          </div>
        )}

        {/* No Match State */}
        {result === null && input.trim() && (
          <div className="mt-[35px]">
            <Card>
              <SectionLabel>NO MATCH FOUND</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#666666]"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                That phrase isn't in our dictionary yet. Try pasting one of the known phrases exactly, or check the Brain for saved decodes.
              </p>
            </Card>
          </div>
        )}

        {/* Brain Toggle */}
        <div className="mt-[35px] flex justify-center">
          <OutlinedButton
            onClick={() => setShowBrain((s) => !s)}
            subtext={`${brain.length} ENTRIES`}
          >
            {showBrain ? "HIDE BRAIN" : "VIEW BRAIN"}
          </OutlinedButton>
        </div>

        {/* Brain Section */}
        {showBrain && (
          <div className="mt-[10px] mb-[156px] flex flex-col gap-[10px]">
            {brain.length === 0 ? (
              <Card>
                <p
                  className="text-[16px] font-medium leading-[1.4] text-[#666666] text-center"
                  style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
                >
                  Your Brain is empty. Decode something and save it.
                </p>
              </Card>
            ) : (
              brain.map((entry) => (
                <Card key={entry.id} className="relative">
                  <div className="flex items-start justify-between gap-[17px]">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] leading-[1] text-[#666666] mb-[11px]"
                        style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {new Date(entry.savedAt).toLocaleString()}
                      </p>
                      <p
                        className="text-[13px] font-normal leading-[1.2] text-[#ffffff] mb-[11px] truncate"
                        style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {entry.rawInput}
                      </p>
                      <p
                        className="text-[16px] font-medium leading-[1.4] text-[#ff5c00]"
                        style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {entry.result.plainEnglish}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="shrink-0 border border-[#666666] rounded-[10px] px-[11px] py-[11px] text-[10px] text-[#666666] hover:border-[#ff5c00] hover:text-[#ff5c00] transition-colors"
                      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                    >
                      DELETE
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer spacer for spacious density */}
      <div className="h-[156px]" />
    </div>
  );
}
