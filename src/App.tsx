import { useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
import { TRAITS, ACTIONS, POLICIES } from './data/traits';
import { STATIC_LOCATIONS, LOC_HEXES } from './data/locations';
import { CHAINS } from './data/chains';

// ── Lib ───────────────────────────────────────────────────────────────────────
import { getSeason, effectSummary } from './lib/effects';
import { traitBonus, getAllBuildings, hasBldg } from './lib/helpers';
import {
  initState, processTurn, checkNextPhase,
  applyPolicyImmediate, hneighbours, revealAround,
  pickWeighted, applyOutcome, pick,
} from './lib/engine';

// ── Theme ─────────────────────────────────────────────────────────────────────
const C = {
  parchment:"#f5f0e8", parchmentDark:"#e8e0cc",
  ink:"#1a1410",       inkLight:"#3d3228",
  inkFaded:"#6b5a48",  inkGhost:"#a89880",
  stain:"#d4c9a8",     red:"#7a2020",
  green:"#1a4a2a",     gold:"#8a6a10",
};
const inkFont  = "'Georgia','Times New Roman',serif";
const sansInk  = "'Courier New','Lucida Console',monospace";

// ── Persistence ───────────────────────────────────────────────────────────────
const SAVE_KEY = "willowroot_v4";
const saveGame   = st  => { try { window.storage.set(SAVE_KEY, JSON.stringify(st)); } catch(e) {} };
const loadGame   = async () => { try { const r = await window.storage.get(SAVE_KEY); if (r?.value) return JSON.parse(r.value); } catch(e) {} return null; };
const deleteSave = async () => { try { await window.storage.delete(SAVE_KEY); } catch(e) {} };

// ── Hex map constants ─────────────────────────────────────────────────────────
const HS = 26, HCOLS = 9, HROWS = 7;
const VH = { c: 4, r: 3 };

function hcenter(c, r) { return { x: HS * 1.75 * c + 36, y: HS * Math.sqrt(3) * (r + (c % 2) * 0.5) + 36 }; }
function hcorners(cx, cy, r = HS) { return Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 180 * (60 * i); return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" "); }
function hterrain(c, r) { const v = (c * 7 + r * 13) % 17; if (v < 3) return "water"; if (v < 6) return "dense"; if (v < 9) return "meadow"; return "forest"; }
const TF = { fog:"#2C2C2A", water:"#d8e8f0", dense:"#c8d4b8", meadow:"#e8e4c8", forest:"#c0cca8", village:"#f5f0e8" };
const TS = { fog:"#3d3228", water:"#8aa8b8", dense:"#6b7a58", meadow:"#a89860", forest:"#5a7040", village:"#1a1410" };

// ── UI primitives ─────────────────────────────────────────────────────────────
function InkBox({ children, style = {}, fill = C.parchment }) {
  return <div style={{ background: fill, border: `2.5px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}`, padding: "11px 15px", position: "relative", ...style }}>{children}</div>;
}
function InkBtn({ children, onClick, disabled, active, style = {} }) {
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily: sansInk, fontSize: 13, fontWeight: "bold", letterSpacing: "0.04em", background: active ? C.ink : C.parchment, color: active ? C.parchment : C.ink, border: `2px solid ${C.ink}`, padding: "7px 13px", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, boxShadow: active ? `inset 1px 1px 0 ${C.inkLight}` : `2px 2px 0 ${C.ink}`, ...style }}>{children}</button>;
}
function Title({ children, size = 17, style = {} }) { return <div style={{ fontFamily: inkFont, fontSize: size, fontStyle: "italic", color: C.ink, fontWeight: "bold", lineHeight: 1.2, ...style }}>{children}</div>; }
function Label({ children, style = {} }) { return <div style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: C.inkFaded, ...style }}>{children}</div>; }
function Body({ children, style = {} })  { return <div style={{ fontFamily: inkFont, fontSize: 14, fontStyle: "italic", color: C.inkLight, lineHeight: 1.85, ...style }}>{children}</div>; }
function MouseSVG({ injured, lost }) {
  return <svg width="36" height="36" viewBox="0 0 34 34"><ellipse cx="17" cy="21" rx="11" ry="8" fill={C.parchment} stroke={C.ink} strokeWidth="1.5"/><circle cx="17" cy="13" r="7" fill={C.parchment} stroke={C.ink} strokeWidth="1.5"/><ellipse cx="10" cy="8" rx="3.5" ry="6" fill={C.parchment} stroke={C.ink} strokeWidth="1.2" transform="rotate(-18 10 8)"/><ellipse cx="24" cy="8" rx="3.5" ry="6" fill={C.parchment} stroke={C.ink} strokeWidth="1.2" transform="rotate(18 24 8)"/><circle cx="14.5" cy="13" r="1.2" fill={C.ink}/><circle cx="19.5" cy="13" r="1.2" fill={C.ink}/><path d="M14.5 17 Q17 19 19.5 17" fill="none" stroke={C.ink} strokeWidth="1.2"/>{injured && <path d="M5 5 L29 29 M29 5 L5 29" stroke={C.red} strokeWidth="1.5" opacity="0.45"/>}{lost && <path d="M17 5 L17 29 M5 17 L29 17" stroke={C.gold} strokeWidth="1.5" opacity="0.55"/>}</svg>;
}

// ── Hex Map component ─────────────────────────────────────────────────────────
function HexMap({ s, onHexClick }) {
  const revealed = new Set(s.hexMap?.revealed || []);
  const svgW = HS * 1.75 * HCOLS + 70, svgH = HS * Math.sqrt(3) * (HROWS + 0.5) + 60;
  const locByHex = {};
  STATIC_LOCATIONS.forEach(loc => { const pos = LOC_HEXES[loc.id]; if (pos) locByHex[`${pos.c},${pos.r}`] = loc; });
  const hexes = [];
  for (let c = 0; c < HCOLS; c++) for (let r = 0; r < HROWS; r++) {
    const key = `${c},${r}`, isRev = revealed.has(key), isV = c === VH.c && r === VH.r;
    const terrain = isV ? "village" : hterrain(c, r);
    const loc = locByHex[key], { x, y } = hcenter(c, r);
    const state = s.locationStates?.[loc?.id] || "calm";
    const visited = loc && (s.exploredLocs || []).includes(loc.id);
    hexes.push({ key, c, r, x, y, isRev, isV, terrain, loc, state, visited });
  }
  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: "block" }}>
      <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#3d3228" strokeWidth="0.8" opacity="0.4"/></pattern></defs>
      {hexes.map(h => {
        const fill = h.isRev ? TF[h.terrain] : TF.fog, stroke = h.isRev ? TS[h.terrain] : TS.fog, corners = hcorners(h.x, h.y);
        const stateCol = h.state === "corrupted" ? C.red : h.state === "disturbed" ? C.gold : "none";
        return (
          <g key={h.key} onClick={() => h.isRev && h.loc && onHexClick(h.loc)} style={{ cursor: h.isRev && h.loc ? "pointer" : "default" }}>
            <polygon points={corners} fill={fill} stroke={stroke} strokeWidth={h.isV ? "2" : "0.8"}/>
            {!h.isRev && <polygon points={corners} fill="url(#hatch)" stroke="none"/>}
            {h.isRev && h.state !== "calm" && h.loc && <polygon points={corners} fill="none" stroke={stateCol} strokeWidth="1.5" strokeDasharray="3,2"/>}
            {h.isV && h.isRev && <><circle cx={h.x} cy={h.y} r="7" fill={C.ink} opacity="0.9"/><text x={h.x} y={h.y + 4} textAnchor="middle" fontSize="8" fill={C.parchment} fontWeight="bold" fontFamily={sansInk}>W</text></>}
            {h.isRev && h.loc && !h.isV && <><circle cx={h.x} cy={h.y - 2} r="5" fill={h.loc.fluff ? C.stain : h.loc.danger ? C.red : C.green} stroke={C.ink} strokeWidth="0.8" opacity="0.9"/><text x={h.x} y={h.y + 1} textAnchor="middle" fontSize="6" fill={C.parchment} fontWeight="bold" fontFamily={sansInk}>{h.loc.fluff ? "~" : h.loc.danger ? "!" : "◎"}</text>{h.visited && <text x={h.x} y={h.y + 12} textAnchor="middle" fontSize="6" fill={C.inkFaded} fontFamily={sansInk}>{h.loc.name.slice(0, 9)}</text>}</>}
            {!h.isRev && <text x={h.x} y={h.y + 4} textAnchor="middle" fontSize="9" fill="#5a4a38" opacity="0.5" fontFamily={sansInk}>?</text>}
          </g>
        );
      })}
      {[["W", C.ink, "Village"], ["◎", C.green, "Location"], ["!", C.red, "Danger"], ["~", C.stain, "Fluff"]].map(([sym, col, lbl], i) => (
        <g key={lbl} transform={`translate(${8 + i * 65},${svgH - 18})`}>
          <circle cx="6" cy="6" r="5" fill={col} stroke={C.ink} strokeWidth="0.5" opacity="0.9"/>
          <text x="6" y="9.5" textAnchor="middle" fontSize="6" fill={C.parchment} fontWeight="bold" fontFamily={sansInk}>{sym}</text>
          <text x="14" y="10" fontSize="8" fill={C.inkFaded} fontFamily={sansInk}>{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Resource & status bars ────────────────────────────────────────────────────
function ResourceBar({ s }) {
  const season = getSeason(s.turn);
  const items = [
    { label:"FOOD",   val:s.food,   cap:s.foodCap, sym:"⁂" },
    { label:"WOOD",   val:s.wood,   cap:s.woodCap, sym:"⊞" },
    { label:"MATS",   val:s.mats,   cap:s.matsCap, sym:"◈" },
    { label:"MORALE", val:s.morale, cap:100,        sym:"♡" },
    { label:"THREAT", val:s.threat, cap:10,         sym:"!", danger:true },
  ];
  return (
    <div style={{ marginBottom: 10 }}>
      <Label style={{ fontSize: 13, color: s.turn <= 15 ? C.green : s.turn <= 30 ? C.gold : C.red, marginBottom: 5 }}>{season.label.toUpperCase()}</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
        {items.map(({ label, val, cap, sym, danger }) => (
          <InkBox key={label} style={{ padding: "8px 10px", textAlign: "center" }} fill={danger && val >= 7 ? C.parchmentDark : C.parchment}>
            <div style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", color: danger && val >= 7 ? C.red : C.inkFaded, marginBottom: 2 }}>{sym} {label}</div>
            <div style={{ fontFamily: inkFont, fontSize: 19, fontWeight: "bold", color: danger && val >= 7 ? C.red : C.ink }}>{Math.floor(val)}<span style={{ fontSize: 12, color: C.inkGhost }}>/{cap}</span></div>
            <div style={{ marginTop: 4, height: 4, background: C.stain }}><div style={{ height: "100%", width: `${Math.min(100, val / cap * 100)}%`, background: danger ? (val >= 7 ? C.red : C.inkFaded) : C.inkLight }}/></div>
          </InkBox>
        ))}
      </div>
    </div>
  );
}

function WinterCheck({ s }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
      {[{ label:"Food", val:s.food, req:30, sym:"⁂" }, { label:"Wood", val:s.wood, req:20, sym:"⊞" }, { label:"Mats", val:s.mats, req:15, sym:"◈" }, { label:"Morale", val:s.morale, req:30, sym:"♡" }].map(r => (
        <div key={r.label} style={{ textAlign: "center", padding: "8px 4px", border: `2px solid ${r.val >= r.req ? C.green : C.red}`, background: C.parchment, boxShadow: `2px 2px 0 ${r.val >= r.req ? C.green : C.red}` }}>
          <Label style={{ fontSize: 11 }}>{r.sym} {r.label}</Label>
          <div style={{ fontFamily: inkFont, fontSize: 17, fontWeight: "bold", color: r.val >= r.req ? C.green : C.red }}>{Math.floor(r.val)}<span style={{ fontSize: 11, opacity: 0.7 }}>/{r.req}</span></div>
        </div>
      ))}
    </div>
  );
}

function FactionBar({ factions }) {
  const rel = v => v <= -2 ? "hostile" : v === -1 ? "wary" : v === 0 ? "neutral" : v === 1 ? "friendly" : "allied";
  const col = v => v < 0 ? C.red : v === 0 ? C.inkFaded : v === 1 ? C.green : C.gold;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
      {[{ id:"spider", label:"Spider", sym:"◉" }, { id:"ants", label:"Ants", sym:"⋈" }, { id:"patrol", label:"Patrol", sym:"⊞" }, { id:"shrine", label:"Shrine", sym:"△" }].map(f => (
        <div key={f.id} style={{ textAlign: "center", padding: "6px 4px", border: `2px solid ${C.ink}`, background: C.parchment, boxShadow: `2px 2px 0 ${C.ink}` }}>
          <Label style={{ fontSize: 11 }}>{f.sym} {f.label.toUpperCase()}</Label>
          <div style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: col(factions[f.id]) }}>{rel(factions[f.id])}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function getActionYield(act, mouse, s) {
  const p = s.policies, allB = getAllBuildings(s);
  const fc = s.mice.filter(m => s.assignments[m.id] === "forage" && !m.lost).length;
  if (act.id === "forage") { let base = 2.5 + (allB.find(b => b.id === "seedlib" && b.built) ? 1 : 0) + (p.includes("forager_guild") ? 1 : 0); if (fc >= 4) base = Math.max(1, base - 0.5 * (fc - 3)); const b = traitBonus(mouse.trait, "forage"); return [`+${(base + b).toFixed(1)} food`, b > 0 ? `(+${b} ${TRAITS.find(t => t.id === mouse.trait)?.label})` : b < 0 ? `(${b})` : ""].join(" ").trim(); }
  if (act.id === "haul")    { const b = traitBonus(mouse.trait, "haul");    return `+${2 + b} wood${b > 0 ? ` (+${b})` : ""}`; }
  if (act.id === "gather")  return `+${2 + (s.policies.includes("deep_roots") ? 1 : 0)} mats`;
  if (act.id === "rest")    return mouse.injured ? "heals injury" : "+4 morale";
  if (act.id === "watch")   return `−${allB.find(b => b.id === "watchpost" && b.built) ? 3 : 1.5} threat`;
  if (act.id === "craft")   return hasBldg(s, "workshop") ? "mats→food+wood" : "needs workshop";
  if (act.id === "build")   return s.buildQueue ? `→ ${getAllBuildings(s).find(b => b.id === s.buildQueue)?.name || "?"}` : "queue a building first";
  if (act.id === "explore") { const b = traitBonus(mouse.trait, "explore"); return b > 0 ? `scout + threat −${1 + b}` : b < 0 ? "scout (risky)" : "discover location"; }
  return "";
}

function VillageTab({ s, availActions, assign }) {
  const [exp, setExp] = useState(null);
  return (
    <div>
      <Label style={{ marginBottom: 10 }}>Assign each mouse a task. Click a mouse to see details.</Label>
      {s.mice.filter(m => !m.lost).map(m => {
        const trait = TRAITS.find(t => t.id === m.trait) || { label: "?", glyph: "?", desc: "" };
        const isE = exp === m.id;
        return (
          <InkBox key={m.id} style={{ marginBottom: 9 }} fill={m.injured ? C.parchmentDark : C.parchment}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 9, cursor: "pointer" }} onClick={() => setExp(isE ? null : m.id)}>
              <MouseSVG injured={m.injured} lost={false}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                  <Title size={16}>{m.name}</Title>
                  <span style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", padding: "2px 8px", border: `2px solid ${C.ink}`, color: C.inkLight }}>{trait.glyph} {trait.label}</span>
                  {m.injured && <span style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", padding: "2px 8px", border: `2px solid ${C.red}`, color: C.red }}>✗ injured</span>}
                  <span style={{ fontFamily: sansInk, fontSize: 11, color: C.inkGhost, marginLeft: "auto" }}>{isE ? "▲" : "▼"}</span>
                </div>
                <Label style={{ fontSize: 12 }}>{trait.desc}</Label>
              </div>
            </div>
            {isE && (
              <div style={{ marginBottom: 10, padding: "10px 12px", background: C.parchmentDark, border: `1.5px solid ${C.stain}` }}>
                <Label style={{ marginBottom: 7, fontSize: 11 }}>ACTION YIELDS THIS TURN</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {availActions.filter(ac => !(m.injured && ac.id !== "rest")).map(act => (
                    <div key={act.id} style={{ fontFamily: sansInk, fontSize: 12, color: C.inkLight }}>
                      <span style={{ fontWeight: "bold" }}>{act.glyph} {act.label}:</span>{" "}
                      <span style={{ color: C.inkFaded }}>{getActionYield(act, m, s)}</span>
                    </div>
                  ))}
                </div>
                {(m.history || []).length > 0 && (
                  <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.stain}` }}>
                    <Label style={{ marginBottom: 4, fontSize: 11 }}>HISTORY</Label>
                    {m.history.map((h, i) => <Body key={i} style={{ fontSize: 13 }}>· {h}</Body>)}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {availActions.map(act => (
                <InkBtn key={act.id} active={s.assignments[m.id] === act.id} disabled={m.injured && act.id !== "rest"} onClick={() => assign(m.id, act.id)} style={{ fontSize: 12, padding: "6px 10px" }}>{act.glyph} {act.label}</InkBtn>
              ))}
            </div>
          </InkBox>
        );
      })}
      {s.mice.filter(m => m.lost).map(m => (
        <InkBox key={m.id} style={{ marginBottom: 9, opacity: 0.7 }} fill={C.parchmentDark}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MouseSVG injured={false} lost={true}/>
            <div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3 }}>
                <Title size={15}>{m.name}</Title>
                <span style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: C.gold, padding: "2px 8px", border: `2px solid ${C.gold}` }}>away</span>
              </div>
              <Label style={{ fontSize: 12 }}>{m.lostReason} — returns in ~{m.lostTurns} turn{m.lostTurns !== 1 ? "s" : ""}</Label>
            </div>
          </div>
        </InkBox>
      ))}
    </div>
  );
}

function BuildTab({ s, onQueue }) {
  const allB = getAllBuildings(s);
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <Label style={{ marginBottom: 10 }}>STRUCTURES & FACILITIES — click a name to read more</Label>
      {allB.map(b => {
        const can = s.wood >= b.cost.wood && s.mats >= b.cost.mats, queued = s.buildQueue === b.id, isExp = expanded === b.id;
        return (
          <InkBox key={b.id} style={{ marginBottom: 8, opacity: b.built ? 0.65 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: sansInk, fontSize: 20 }}>{b.icon}</span>
                  <span onClick={() => setExpanded(isExp ? null : b.id)} style={{ fontFamily: inkFont, fontSize: 16, fontWeight: "bold", fontStyle: "italic", color: C.ink, cursor: "pointer", borderBottom: `1.5px dotted ${C.inkFaded}`, lineHeight: 1.3 }}>{b.name}</span>
                  {b.built && <span style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: C.green }}>✓ built</span>}
                  <span onClick={() => setExpanded(isExp ? null : b.id)} style={{ fontFamily: sansInk, fontSize: 11, color: C.inkGhost, cursor: "pointer" }}>{isExp ? "▲" : "▼"}</span>
                </div>
                <Label style={{ fontSize: 12 }}>{b.desc} · ⊞{b.cost.wood} ◈{b.cost.mats}</Label>
                <Body style={{ fontSize: 13, marginTop: 3 }}>{b.flavor}</Body>
              </div>
              {!b.built && <InkBtn onClick={() => onQueue(b.id)} disabled={!can} active={queued} style={{ fontSize: 11, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{queued ? "queued" : "queue"}</InkBtn>}
            </div>
            {isExp && b.lore && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1.5px solid ${C.stain}` }}>
                <Body style={{ fontSize: 14 }}>{b.lore}</Body>
              </div>
            )}
          </InkBox>
        );
      })}
    </div>
  );
}

function MapTab({ s, selectedLoc, setSelectedLoc }) {
  return (
    <div>
      <Label style={{ marginBottom: 8 }}>
        Hexes reveal as scouts explore. Click a location for details.
        <span style={{ marginLeft: 8, color: C.gold }}>{(s.hexMap?.revealed || []).length}/{HCOLS * HROWS} revealed</span>
      </Label>
      <InkBox style={{ padding: "6px", overflow: "hidden" }}><HexMap s={s} onHexClick={setSelectedLoc}/></InkBox>
      {selectedLoc && (
        <InkBox style={{ marginTop: 9 }} fill={C.parchmentDark}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <Title size={15}>{selectedLoc.name}</Title>
                {selectedLoc.danger && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "2px 8px", border: `2px solid ${C.red}`,   color: C.red }}>DANGER</span>}
                {selectedLoc.fluff  && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "2px 8px", border: `2px solid ${C.stain}`, color: C.inkFaded }}>FLUFF</span>}
                {selectedLoc.chain  && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "2px 8px", border: `2px solid ${C.gold}`,  color: C.gold }}>CHAIN</span>}
              </div>
              <Label style={{ marginBottom: 7, fontSize: 12 }}>
                STATE: {(s.locationStates?.[selectedLoc.id] || "calm").toUpperCase()}
                {(s.exploredLocs || []).includes(selectedLoc.id) && <span style={{ marginLeft: 8, color: C.green }}>✓ visited</span>}
              </Label>
              <Body style={{ fontSize: 13 }}>{selectedLoc.desc?.[s.locationStates?.[selectedLoc.id] || "calm"] || selectedLoc.desc?.calm || ""}</Body>
            </div>
            <button onClick={() => setSelectedLoc(null)} style={{ background: "none", border: "none", color: C.inkFaded, cursor: "pointer", fontSize: 20, padding: "0 0 0 10px", lineHeight: 1 }}>×</button>
          </div>
        </InkBox>
      )}
    </div>
  );
}

function LogTab({ log }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 400, overflowY: "auto" }}>
      {[...log].reverse().map((e, i) => {
        const isO = open === i, isF = e.fluff;
        const bg = isF ? "#f0ece0" : e.good ? "#e8f0e0" : "#f0e0e0", bc = isF ? C.stain : e.good ? C.green : C.red;
        return (
          <div key={i} onClick={() => setOpen(isO ? null : i)} style={{ fontFamily: sansInk, fontSize: 13, fontWeight: "bold", padding: "8px 11px", background: bg, border: `2px solid ${bc}`, color: isF ? C.inkFaded : bc, cursor: "pointer", userSelect: "none", boxShadow: `1px 1px 0 ${bc}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              <span><span style={{ opacity: 0.55, marginRight: 7 }}>T{e.t}</span>{e.msg}</span>
              <span style={{ flexShrink: 0 }}>{isO ? "▲" : "▼"}</span>
            </div>
            {isO && (
              <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1.5px solid ${bc}` }}>
                {e.title && <Title size={15} style={{ marginBottom: 5, color: isF ? C.inkFaded : e.good ? C.inkLight : C.inkFaded }}>{e.title}</Title>}
                <Body style={{ fontSize: 14, color: isF ? C.inkFaded : e.good ? C.inkLight : C.inkFaded }}>{e.lore || "The day passed as days do."}</Body>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HelpTab() {
  const [open, setOpen] = useState(null);
  const secs = [
    { id:"goal",    title:"The Goal",         body:"Survive 50 turns and meet winter threshold: 30 food, 20 wood, 15 mats, 30 morale." },
    { id:"world",   title:"The World",        body:"Our world, seen from three inches up. Pocket knives are ancient swords. Cats are gods. Owls are older than gods. Rats are rivals. Frogs are sometimes allies." },
    { id:"season",  title:"Seasonal Pressure",items:[["Turns 1–15","Early Autumn — calm, low threat growth."],["Turns 16–30","Late Autumn — rising pressure."],["Turns 31–50","Pre-Winter — brutal threat. Prepare early."]] },
    { id:"map",     title:"World Map",        body:"The hex map reveals as scouts explore. Disturbed locations show amber borders, corrupted show red." },
    { id:"factions",title:"Factions",         body:"Spider, Ants, Patrol mice, Shrine keeper. Relations range from hostile to allied." },
    { id:"chains",  title:"Story Chains",     body:"Four multi-step arcs: The Spider's Debt, The Ant Accord, The Shrine Keeper's Trial, The Settlement Mystery." },
    { id:"fluff",   title:"Fluff Locations",  body:"Some locations have no mechanical effect — pure atmosphere. ~ marker on the map." },
    { id:"act",     title:"Actions",          items:ACTIONS.map(a => [`${a.glyph} ${a.label}`, a.desc]) },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {secs.map((sec, i) => {
        const isO = open === i;
        return (
          <InkBox key={sec.id} style={{ padding: "10px 14px" }}>
            <div onClick={() => setOpen(isO ? null : i)} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
              <Title size={15}>{sec.title}</Title>
              <span style={{ fontFamily: sansInk, fontSize: 13, fontWeight: "bold", color: C.inkFaded }}>{isO ? "▲" : "▼"}</span>
            </div>
            {isO && (
              <div style={{ marginTop: 10, borderTop: `1.5px solid ${C.stain}`, paddingTop: 10 }}>
                {sec.body  && <Label style={{ lineHeight: 1.75, fontSize: 13 }}>{sec.body}</Label>}
                {sec.items && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sec.items.map(([lbl, desc]) => (
                      <div key={lbl} style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontFamily: sansInk, fontSize: 13, fontWeight: "bold", color: C.ink, minWidth: 130, flexShrink: 0 }}>{lbl}</span>
                        <Label style={{ fontSize: 12, lineHeight: 1.65 }}>{desc}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </InkBox>
        );
      })}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function Modal({ children, wide = false }) {
  return (
    <div style={{ minHeight: 260, background: "rgba(26,20,16,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, marginTop: 12 }}>
      <div style={{ background: C.parchment, border: `3px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`, padding: 24, maxWidth: wide ? 570 : 470, width: "100%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 7, border: `1.5px solid ${C.stain}`, pointerEvents: "none" }}/>
        {children}
      </div>
    </div>
  );
}

function OutcomePreview({ outcomes, state, s }) {
  const pool = outcomes?.[state] || outcomes?.calm || [];
  if (!pool.length) return null;
  const good = pool.filter(o => o.type === "good" || o.type === "fluff"), bad = pool.filter(o => o.type === "bad");
  const tot = pool.reduce((a, o) => a + (typeof o.w === "function" ? o.w(s) : o.w), 0);
  const gPct = Math.round(good.reduce((a, o) => a + (typeof o.w === "function" ? o.w(s) : o.w), 0) / tot * 100);
  return (
    <div style={{ marginBottom: 13, padding: "9px 12px", background: C.parchmentDark, border: `2px solid ${C.stain}` }}>
      <Label style={{ marginBottom: 7, fontSize: 11 }}>POSSIBLE OUTCOMES — {gPct}% favourable</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {good.map((o, i) => <div key={i} style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: o.type === "fluff" ? C.inkFaded : C.green }}>{o.type === "fluff" ? "◦" : "✓"} {o.title}</div>)}
        {bad.map((o, i)  => <div key={i} style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: C.red }}>✗ {o.title}</div>)}
      </div>
    </div>
  );
}

function ExploreModal({ pendingExplore, onEnter, onRetreat, s }) {
  const { loc, state } = pendingExplore;
  const desc = loc.desc?.[state] || loc.desc?.calm || "";
  const safe = loc.safe?.[state] || loc.safe?.calm || "Your scouts retreat safely.";
  return (
    <Modal wide>
      <Label style={{ marginBottom: 5, letterSpacing: "0.1em" }}>— SCOUT REPORT — HEX {loc.id} — {state.toUpperCase()} —</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, flexWrap: "wrap" }}>
        <Title size={20}>{loc.name}</Title>
        {loc.danger && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "3px 9px", border: `2px solid ${C.red}`,   color: C.red }}>DANGEROUS</span>}
        {loc.fluff  && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "3px 9px", border: `2px solid ${C.stain}`, color: C.inkFaded }}>FLUFF</span>}
        {state === "corrupted" && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "3px 9px", border: `2px solid ${C.red}`,  color: C.red }}>CORRUPTED</span>}
        {state === "disturbed" && <span style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", padding: "3px 9px", border: `2px solid ${C.gold}`, color: C.gold }}>DISTURBED</span>}
      </div>
      <Body style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1.5px solid ${C.stain}` }}>{desc}</Body>
      {loc.outcomes && <OutcomePreview outcomes={loc.outcomes} state={state} s={s}/>}
      <Label style={{ marginBottom: 14 }}>Safe retreat: {safe}</Label>
      <div style={{ display: "flex", gap: 10 }}>
        <InkBtn onClick={onEnter}   style={{ flex: 1, padding: "13px 8px", fontSize: 13, textAlign: "center" }}>◎ Press Deeper</InkBtn>
        <InkBtn onClick={onRetreat} style={{ flex: 1, padding: "13px 8px", fontSize: 13, textAlign: "center", background: C.parchmentDark }}>☽ Retreat Safely</InkBtn>
      </div>
    </Modal>
  );
}

function ExploreResultModal({ pendingResult, onContinue }) {
  const { locName, outcome, retreated } = pendingResult;
  const isFluff = outcome.type === "fluff", isGood = outcome.type === "good";
  const borderCol = isFluff ? C.stain : isGood ? C.green : C.red;
  const bgCol     = isFluff ? "#f5f0e8" : isGood ? "#e8f0e0" : "#f0e0e0";
  const label  = retreated ? "— SCOUTS RETURN —" : isFluff ? "— DISCOVERY —" : isGood ? "— FORTUNE —" : "— ILL OMEN —";
  const sym    = retreated ? "☽" : isFluff ? "◦" : isGood ? "✓" : "✗";
  const summary = retreated ? outcome.lore : effectSummary(outcome);
  return (
    <Modal wide>
      <Label style={{ marginBottom: 5, letterSpacing: "0.1em" }}>{label}</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11, flexWrap: "wrap" }}>
        <Title size={20}>{retreated ? "Safe Return" : outcome.title}</Title>
        <span style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", color: C.inkFaded }}>@ {locName}</span>
      </div>
      {!retreated && (
        <div style={{ marginBottom: 15, padding: "10px 14px", background: bgCol, border: `2px solid ${borderCol}` }}>
          <span style={{ fontFamily: sansInk, fontSize: 14, fontWeight: "bold", color: borderCol }}>{sym} {summary}</span>
        </div>
      )}
      <Body style={{ marginBottom: 20 }}>{outcome.lore}</Body>
      <InkBtn onClick={onContinue} style={{ width: "100%", padding: "13px", fontSize: 14 }}>
        {retreated ? "— Back to the burrow —" : "— So it goes —"}
      </InkBtn>
    </Modal>
  );
}

function ChainModal({ pendingChain, onChoice }) {
  const chain = CHAINS[pendingChain.chain], step = chain.steps[pendingChain.step];
  return (
    <Modal wide>
      <Label style={{ marginBottom: 5 }}>— CHAPTER —</Label>
      <Title size={20} style={{ marginBottom: 12 }}>{step.title}</Title>
      <Body style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1.5px solid ${C.stain}` }}>{step.body}</Body>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {step.choices.map((c, i) => (
          <div key={i} onClick={() => onChoice(c)} style={{ border: `2.5px solid ${C.ink}`, padding: "13px 15px", cursor: "pointer", background: C.parchment, fontFamily: sansInk, fontSize: 14, fontWeight: "bold", color: C.ink, boxShadow: `2px 2px 0 ${C.ink}` }} onMouseEnter={e => e.currentTarget.style.background = C.parchmentDark} onMouseLeave={e => e.currentTarget.style.background = C.parchment}>{c.label}</div>
        ))}
      </div>
    </Modal>
  );
}

// ── Intro Screen ──────────────────────────────────────────────────────────────
function IntroScreen({ onContinue }) {
  const [page, setPage] = useState(0);
  const pages = [
    { body: `The world is very large.\n\nYou have always known this — in the way that a mouse always knows it, which is to say: in the bones, in the whiskers, in the particular quality of stillness that comes before running.\n\nThe world is very large, and most of it does not care about you.` },
    { body: `The Old Giants built it. Nobody remembers them, exactly, but their ruins are everywhere — vast flat plains of grey stone, towers of rusted metal, caverns of glass and wire that hum with something that is not quite alive.\n\nThey left. Or they changed into something else. Or they are still here and simply do not see you.\n\nIt comes to the same thing.` },
    { body: `There are things in this world that hunt.\n\nThe Cat, who moves with the patience of a god who has nothing to prove.\n\nThe Owl, who is older than the Cat, older than the garden, older perhaps than anything that still moves.\n\nThe Fox, who is clever in a way that feels personal.\n\nYou have learned to live between them. Most seasons, this is enough.` },
    { body: `But the summer is over.\n\nYou felt it first in the mornings — a quality of light, a sharpness in the air that wasn't there last week. The leaves are beginning. The nights are lasting longer than they did.\n\nWinter is not a rumour anymore. It is a fact on its way.` },
    { body: `Your village is called Willowroot.\n\nIt is four mice in a burrow under the garden's north wall, a tallow candle stub, a list of supplies that is shorter than you would like, and the particular stubborn warmth of small creatures who have decided to survive.\n\nIt is not much.\n\nIt is enough to begin with.` },
    { body: `You have until the first deep frost.\n\nGather food. Haul timber. Collect the things the Old Giants leave behind — wire and cork and thread and all the small useful objects of a world built for hands much larger than yours.\n\nExplore the garden. Make allies. Make decisions.\n\nSome of them will be wrong. That is permitted. That is, in fact, the nature of decisions.` },
    { heading: "Willowroot", body: `The world is very large.\n\nBut you are here.\nAnd winter can be survived.\nAnd that is, when you think about it carefully, quite a lot.` },
  ];
  const cur = pages[page];
  const isLast = page === pages.length - 1;
  return (
    <div style={{ background: C.parchment, minHeight: 420, display: "flex", flexDirection: "column" }}>
      <HeaderSVG />
      <div style={{ flex: 1, padding: "1.5rem 1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {pages.map((_, i) => (
            <div key={i} style={{ width: i === page ? 20 : 8, height: 8, background: i === page ? C.ink : C.stain, transition: "all 0.3s" }}/>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {cur.heading && <div style={{ fontFamily: inkFont, fontSize: 32, fontWeight: "bold", fontStyle: "italic", color: C.ink, textAlign: "center", marginBottom: 20 }}>{cur.heading}</div>}
          <div style={{ fontFamily: inkFont, fontSize: 17, fontStyle: "italic", color: C.inkLight, lineHeight: 2.0, textAlign: "center", maxWidth: 500, margin: "0 auto", whiteSpace: "pre-line" }}>{cur.body}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          {page > 0
            ? <InkBtn onClick={() => setPage(p => p - 1)} style={{ fontSize: 13 }}>← back</InkBtn>
            : <div />}
          <InkBtn onClick={() => isLast ? onContinue() : setPage(p => p + 1)} style={{ fontSize: 14, padding: "11px 24px", boxShadow: `3px 3px 0 ${C.ink}` }}>
            {isLast ? "❧ Enter Willowroot" : "continue →"}
          </InkBtn>
        </div>
        {!isLast && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={onContinue} style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", background: "none", border: "none", color: C.inkGhost, cursor: "pointer", letterSpacing: "0.06em" }}>skip introduction</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function HeaderSVG() {
  return (
    <svg width="100%" viewBox="0 0 680 84" style={{ display: "block", marginBottom: 4 }}>
      <rect width="680" height="84" fill={C.parchment}/>
      <rect x="6" y="6" width="668" height="72" fill="none" stroke={C.ink} strokeWidth="2.5"/>
      <rect x="12" y="12" width="656" height="60" fill="none" stroke={C.ink} strokeWidth="1"/>
      {[38,58,78,98,582,602,622,642].map((x, i) => (<g key={i}><line x1={x} y1="6" x2={x} y2="22" stroke={C.ink} strokeWidth="2"/><line x1={x} y1="62" x2={x} y2="78" stroke={C.ink} strokeWidth="2"/></g>))}
      <text x="340" y="45" textAnchor="middle" fontFamily={inkFont} fontSize="25" fontWeight="bold" fontStyle="italic" fill={C.ink}>Willowroot Village</text>
      <text x="340" y="63" textAnchor="middle" fontFamily={sansInk} fontSize="11" letterSpacing="4" fill={C.inkFaded}>A TALE OF MICE &amp; WINTER</text>
    </svg>
  );
}

function SavePreview() {
  const [info, setInfo] = useState(null);
  useEffect(() => { loadGame().then(d => { if (d) setInfo(d); }); }, []);
  if (!info) return null;
  const season = getSeason(info.turn);
  return (
    <InkBox style={{ maxWidth: 360, margin: "0 auto", padding: "14px 16px", textAlign: "left" }}>
      <Label style={{ marginBottom: 6 }}>SAVED VILLAGE</Label>
      <Title size={15} style={{ marginBottom: 4 }}>Willowroot — Turn {info.turn} of {info.maxTurns}</Title>
      <Label style={{ fontSize: 12, color: info.turn <= 15 ? C.green : info.turn <= 30 ? C.gold : C.red, marginBottom: 10 }}>{season.name.toUpperCase()}</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 8 }}>
        {[["⁂", Math.floor(info.food), info.foodCap], ["⊞", Math.floor(info.wood), info.woodCap], ["◈", Math.floor(info.mats), info.matsCap], ["♡", Math.floor(info.morale), 100]].map(([sym, val, cap]) => (
          <div key={sym} style={{ fontFamily: sansInk, fontSize: 13, fontWeight: "bold", color: C.inkFaded }}>{sym} {val}<span style={{ opacity: 0.5 }}>/{cap}</span></div>
        ))}
      </div>
      <Label style={{ fontSize: 12 }}>{(info.mice || []).filter(m => !m.lost).map(m => m.name).join(", ")}</Label>
    </InkBox>
  );
}

function GameOver({ s, onRestart }) {
  const pass = s.food >= 30 && s.wood >= 20 && s.mats >= 15 && s.morale >= 30;
  const allies = Object.entries(s.factions).filter(([, v]) => v >= 2).map(([k]) => k);
  return (
    <div style={{ background: C.parchment, padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: 50, marginBottom: 14 }}>{pass ? "🌾" : "❄"}</div>
      <Title size={26} style={{ marginBottom: 10, textAlign: "center" }}>{pass ? "Willowroot Endures" : "The Long Freeze"}</Title>
      <p style={{ fontFamily: sansInk, fontSize: 14, fontWeight: "bold", color: C.inkFaded, lineHeight: 1.8, maxWidth: 440, margin: "0 auto 18px" }}>{pass ? "The stores held. The mice huddled warm, and when the first thaw came, they were still there — singing, arguing, and planning the spring." : "Despite their bravery the cold came too soon. But somewhere beneath the roots, small paws begin to stir again..."}</p>
      {allies.length > 0 && <p style={{ fontFamily: inkFont, fontSize: 14, fontStyle: "italic", color: C.inkLight, marginBottom: 18 }}>Allied with: {allies.join(", ")}.</p>}
      <WinterCheck s={s}/>
      <div style={{ marginTop: 18, marginBottom: 18 }}>
        <Label style={{ marginBottom: 8 }}>MOUSE HISTORIES</Label>
        {s.mice.filter(m => (m.history || []).length > 0).map(m => (
          <div key={m.id} style={{ fontFamily: sansInk, fontSize: 13, color: C.inkFaded, marginBottom: 4 }}><strong>{m.name}:</strong> {m.history.join(" · ")}</div>
        ))}
      </div>
      <InkBtn onClick={onRestart} style={{ marginTop: 4, padding: "13px 34px", fontSize: 15 }}>Begin Again</InkBtn>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [s, setS]           = useState(() => initState());
  const [tab, setTab]       = useState("mice");
  const [screen, setScreen] = useState("loading");
  const [hasSave, setHasSave]         = useState(false);
  const [saveStatus, setSaveStatus]   = useState("");
  const [selectedLoc, setSelectedLoc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadGame().then(d => { if (!cancelled) { setHasSave(!!d); setScreen("menu"); } }).catch(() => { if (!cancelled) setScreen("menu"); });
    const fb = setTimeout(() => { if (!cancelled) setScreen("menu"); }, 3000);
    return () => { cancelled = true; clearTimeout(fb); };
  }, []);

  useEffect(() => {
    if (screen !== "game") return;
    saveGame(s); setSaveStatus("saved");
    const t = setTimeout(() => setSaveStatus(""), 2200); return () => clearTimeout(t);
  }, [s, screen]);

  function startNew()     { deleteSave(); setS(initState()); setHasSave(false); setTab("mice"); setSelectedLoc(null); setScreen("intro"); }
  function continueGame() { loadGame().then(d => { if (d) { setS(d); setSaveStatus("loaded"); setScreen("game"); } }); }
  function returnToMenu() { setScreen("menu"); setHasSave(true); }

  const availActions = ACTIONS.filter(a => !(a.id === "craft" && !hasBldg(s, "workshop")));

  function assign(mid, act) { if (s.phase !== "assign") return; const m = s.mice.find(x => x.id === mid); if (m?.injured && act !== "rest") return; setS(p => ({ ...p, assignments: { ...p.assignments, [mid]: act } })); }
  function setQueue(id)    { setS(p => ({ ...p, buildQueue: id })); }
  function endTurn()       { if (s.phase === "assign") setS(p => processTurn(p)); }

  function resolveExplore(enter) {
    setS(p => {
      let ns = { ...p };
      const { loc, state } = ns.pendingExplore;
      ns.hexMap = revealAround(ns.hexMap || { revealed: [] }, loc.id);
      ns.exploredLocs = [...new Set([...(ns.exploredLocs || []), loc.id])];
      let resultOutcome, retreated = false;
      if (enter) {
        const outcomes = loc.outcomes?.[state] || loc.outcomes?.calm || [];
        if (outcomes.length) {
          const out = pickWeighted(outcomes, ns);
          ns = applyOutcome(ns, out, loc.id);
          const isFluff = out.type === "fluff";
          ns.log = [...ns.log, { t: p.turn - 1, msg: `${loc.name}: ${out.title}`, good: !isFluff && out.type === "good", fluff: isFluff, title: out.title, lore: out.lore }];
          resultOutcome = out;
        }
      } else {
        retreated = true;
        const safeText = loc.safe?.[state] || loc.safe?.calm || "Your scouts retreat safely.";
        ns.log = [...ns.log, { t: p.turn - 1, msg: `Scouts pulled back from ${loc.name}.`, good: true, title: `Retreat: ${loc.name}`, lore: safeText }];
        resultOutcome = { type: "good", title: `Retreat: ${loc.name}`, lore: safeText, food: 0, wood: 0, mats: 0, morale: 0, threat: 0 };
      }
      ns.pendingExplore = null;
      ns.pendingResult = { locName: loc.name, outcome: resultOutcome, retreated };
      ns.phase = "result";
      return ns;
    });
  }

  function dismissResult() { setS(p => checkNextPhase({ ...p, pendingResult: null })); }

  function resolveEvent() {
    setS(p => {
      let ns = p.pendingEvent ? Effects.fromData(p.pendingEvent)({ ...p }) : { ...p };
      if (p.pendingEvent) {
        if (p.pendingEvent.special === "injure") ns = injureRandom(ns);
        ns.log = [...ns.log, { t: p.turn - 1, msg: p.pendingEvent.short, good: p.pendingEvent.type === "good", title: p.pendingEvent.title, lore: p.pendingEvent.lore }];
      }
      ns.pendingEvent = null;
      if (ns.turn % 10 === 1 && ns.turn > 1) { ns.policyChoices = POLICIES.filter(pl => !ns.policies.includes(pl.id)).sort(() => Math.random() - 0.5).slice(0, 3); ns.phase = "policy"; }
      else if (ns.turn > ns.maxTurns) ns.phase = "gameover";
      else ns.phase = "assign";
      return ns;
    });
  }

  function resolveChain(choice) { setS(p => checkNextPhase(choice.effect({ ...p, pendingChain: null, phase: "assign" }))); }
  function choosePolicy(pol) { setS(p => { let ns = applyPolicyImmediate({ ...p, policies: [...p.policies, pol.id], phase: "assign", policyChoices: [] }, pol); ns.log = [...ns.log, { t: ns.turn, msg: `Policy: "${pol.name}"`, good: true, title: pol.name, lore: pol.flavor }]; return ns; }); }

  // ── Screens ──────────────────────────────────────────────────────────────
  if (screen === "loading") return <div style={{ background: C.parchment, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}><Label style={{ fontSize: 14 }}>Checking the burrow...</Label></div>;

  if (screen === "intro") return <IntroScreen onContinue={() => setScreen("game")} />;

  if (screen === "menu") return (
    <div style={{ background: C.parchment, minHeight: 400 }}>
      <HeaderSVG/>
      <div style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
        <Body style={{ fontSize: 16, marginBottom: 26, lineHeight: 2.0 }}>The world is vast and does not care about mice.<br/>But mice care about each other.</Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, maxWidth: 340, margin: "0 auto 22px" }}>
          {hasSave && <InkBtn onClick={continueGame} style={{ padding: "15px", fontSize: 15, width: "100%", boxShadow: `3px 3px 0 ${C.ink}` }}>❧ Continue Saved Game</InkBtn>}
          <InkBtn onClick={startNew} style={{ padding: "15px", fontSize: 15, width: "100%", background: hasSave ? C.parchmentDark : C.parchment, boxShadow: `3px 3px 0 ${C.ink}` }}>{hasSave ? "⊞ New Game (overwrites save)" : "⊞ Begin — A New Village"}</InkBtn>
        </div>
        {hasSave && <SavePreview/>}
        <Label style={{ marginTop: 22, fontSize: 11, color: C.inkGhost }}>Progress saves automatically each turn.</Label>
      </div>
    </div>
  );

  if (s.phase === "gameover") return <div style={{ background: C.parchment, minHeight: 400 }}><GameOver s={s} onRestart={() => { deleteSave(); setHasSave(false); setScreen("menu"); setS(initState()); }}/></div>;

  // ── Game screen ───────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.parchment, padding: "0 0 1.5rem", color: C.ink }}>
      <HeaderSVG/>
      <div style={{ padding: "0 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <button onClick={returnToMenu} style={{ fontFamily: sansInk, fontSize: 12, fontWeight: "bold", background: "none", border: "none", color: C.inkFaded, cursor: "pointer", padding: 0 }}>← Menu</button>
          <div style={{ fontFamily: sansInk, fontSize: 11, fontWeight: "bold", color: saveStatus === "saved" ? C.green : saveStatus === "loaded" ? C.gold : "transparent", transition: "color 0.4s" }}>{saveStatus === "saved" ? "✓ saved" : saveStatus === "loaded" ? "✓ loaded" : "-"}</div>
        </div>

        <div style={{ marginBottom: 11, padding: "10px 14px", background: C.parchmentDark, border: `2.5px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Label>SEASON PROGRESS</Label>
            <Label>TURN {s.turn} / {s.maxTurns}</Label>
          </div>
          <div style={{ height: 10, background: C.stain, border: `1.5px solid ${C.ink}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${(s.turn - 1) / s.maxTurns * 100}%`, background: s.turn <= 15 ? C.green : s.turn <= 30 ? C.gold : C.red, transition: "width 0.5s" }}/>
            <div style={{ position: "absolute", top: "50%", left: "30%", width: "1.5px", height: "100%", background: C.inkFaded, opacity: 0.4, transform: "translateY(-50%)" }}/>
            <div style={{ position: "absolute", top: "50%", left: "60%", width: "1.5px", height: "100%", background: C.inkFaded, opacity: 0.4, transform: "translateY(-50%)" }}/>
            <div style={{ position: "absolute", top: "-5px", right: -2, fontFamily: sansInk, fontSize: 18 }}>❄</div>
          </div>
        </div>

        <ResourceBar s={s}/>
        <FactionBar factions={s.factions}/>
        <div style={{ marginBottom: 12 }}>
          <Label style={{ marginBottom: 6 }}>WINTER READINESS</Label>
          <WinterCheck s={s}/>
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 11 }}>
          {[["mice","Mice"],["build","Buildings"],["map","Map"],["log","Chronicle"],["help","Help"]].map(([id, lbl]) => (
            <InkBtn key={id} active={tab === id} onClick={() => setTab(id)} style={{ fontSize: 12, flex: 1, textAlign: "center", padding: "8px 2px" }}>{lbl}</InkBtn>
          ))}
        </div>

        {tab === "mice"  && <VillageTab s={s} availActions={availActions} assign={assign}/>}
        {tab === "build" && <BuildTab   s={s} onQueue={setQueue}/>}
        {tab === "map"   && <MapTab     s={s} selectedLoc={selectedLoc} setSelectedLoc={setSelectedLoc}/>}
        {tab === "log"   && <LogTab     log={s.log}/>}
        {tab === "help"  && <HelpTab/>}

        {s.phase === "assign" && (
          <InkBtn onClick={endTurn} style={{ width: "100%", marginTop: 12, padding: "14px", fontSize: 14, boxShadow: `4px 4px 0 ${C.ink}` }}>
            ❧ End Turn {s.turn} — let the season turn ❧
          </InkBtn>
        )}
      </div>

      {s.phase === "explore" && s.pendingExplore && <ExploreModal pendingExplore={s.pendingExplore} onEnter={() => resolveExplore(true)} onRetreat={() => resolveExplore(false)} s={s}/>}
      {s.phase === "result"  && s.pendingResult  && <ExploreResultModal pendingResult={s.pendingResult} onContinue={dismissResult}/>}
      {s.phase === "chain"   && s.pendingChain   && <ChainModal pendingChain={s.pendingChain} onChoice={resolveChain}/>}

      {s.phase === "event" && s.pendingEvent && (
        <Modal>
          <Label style={{ marginBottom: 6 }}>{s.pendingEvent.type === "good" ? "— FORTUNE —" : "— ILL OMEN —"}</Label>
          <Title size={20} style={{ marginBottom: 12 }}>{s.pendingEvent.title}</Title>
          <div style={{ marginBottom: 14, padding: "10px 14px", background: s.pendingEvent.type === "good" ? "#e8f0e0" : "#f0e0e0", border: `2px solid ${s.pendingEvent.type === "good" ? C.green : C.red}` }}>
            <span style={{ fontFamily: sansInk, fontSize: 15, fontWeight: "bold", color: s.pendingEvent.type === "good" ? C.green : C.red }}>{s.pendingEvent.type === "good" ? "✓" : "✗"} {s.pendingEvent.short}</span>
          </div>
          <Body style={{ marginBottom: 20 }}>{s.pendingEvent.lore}</Body>
          <InkBtn onClick={resolveEvent} style={{ width: "100%", padding: "13px", fontSize: 14 }}>— So it goes —</InkBtn>
        </Modal>
      )}

      {s.phase === "policy" && (
        <Modal>
          <Label style={{ marginBottom: 5 }}>— VILLAGE COUNCIL —</Label>
          <Title size={20} style={{ marginBottom: 7 }}>Choose a Policy</Title>
          <Body style={{ marginBottom: 16 }}>The elders gather beneath the great root. Three proposals are laid on the moss.</Body>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.policyChoices.map(pol => (
              <div key={pol.id} onClick={() => choosePolicy(pol)} style={{ border: `2.5px solid ${C.ink}`, padding: "13px 15px", cursor: "pointer", background: C.parchment, boxShadow: `2px 2px 0 ${C.ink}` }} onMouseEnter={e => e.currentTarget.style.background = C.parchmentDark} onMouseLeave={e => e.currentTarget.style.background = C.parchment}>
                <Title size={16} style={{ marginBottom: 5 }}>{pol.name}</Title>
                <Body style={{ marginBottom: 8, fontSize: 13 }}>{pol.flavor}</Body>
                <div style={{ display: "flex", gap: 14, fontFamily: sansInk, fontSize: 13, fontWeight: "bold", flexWrap: "wrap" }}>
                  <span style={{ color: C.green }}>+ {pol.pos}</span>
                  <span style={{ color: C.red }}>– {pol.neg}</span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}