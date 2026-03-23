import { MOUSE_NAMES, TRAITS } from '../data/traits';
import { Effects } from './effects';

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function mkMouse(n) {
  return {
    id: Math.random().toString(36).slice(2),
    name: n || pick(MOUSE_NAMES),
    trait: pick(TRAITS).id,
    injured: false,
    lost: false,
    lostTurns: 0,
    lostReason: "",
    history: [],
  };
}

export function traitBonus(trait, action) {
  if (action === "forage"  && trait === "green")   return 1;
  if (action === "forage"  && trait === "forager") return 1.5;
  if (action === "forage"  && trait === "greedy")  return -0.5;
  if (action === "explore" && trait === "brave")   return 1;
  if (action === "explore" && trait === "swift")   return 2;
  if (action === "explore" && trait === "nervous") return -1;
  if (action === "haul"    && trait === "stocky")  return 1;
  return 0;
}

export function injureRandom(s) {
  const ok = s.mice.filter(m => !m.injured && !m.lost);
  if (!ok.length) return s;
  const t = pick(ok);
  return {
    ...s,
    mice: s.mice.map(m => m.id === t.id ? { ...m, injured: true, history: [...(m.history || []), "Suffered an injury"] } : m),
    morale: Math.max(0, s.morale - 5),
  };
}

export function pickWeighted(outcomes, s) {
  const res = outcomes.map(o => ({ ...o, wv: typeof o.w === "function" ? o.w(s) : o.w }));
  const tot = res.reduce((a, o) => a + o.wv, 0);
  if (tot <= 0) return res[0];
  let r = Math.random() * tot;
  for (const o of res) { r -= o.wv; if (r <= 0) return o; }
  return res[res.length - 1];
}

export function getAllBuildings(s) {
  return [...s.buildings, ...(s.extraBuildings || [])];
}

export function hasBldg(s, id) {
  return getAllBuildings(s).find(b => b.id === id)?.built;
}

export function applyOutcome(s, outcome, locId) {
  let ns = Effects.fromData(outcome)(s);
  if (outcome.special === "injure")     ns = injureRandom(ns);
  if (outcome.special === "add_mouse" && s.mice.length < 8) {
    const nm = mkMouse();
    ns = { ...ns, mice: [...ns.mice, nm] };
  }
  if (outcome.special === "spider_chain")     ns = { ...ns, chainProgress: { ...ns.chainProgress, spider:     Math.max(ns.chainProgress.spider     || 0, 1) }, factions: { ...ns.factions, spider:     Math.min(2, ns.factions.spider + 1) } };
  if (outcome.special === "ants_chain")       ns = { ...ns, chainProgress: { ...ns.chainProgress, ants:       Math.max(ns.chainProgress.ants       || 0, 1) }, factions: { ...ns.factions, ants:       Math.min(2, ns.factions.ants   + 1) } };
  if (outcome.special === "ants_chain2")      ns = { ...ns, chainProgress: { ...ns.chainProgress, ants:       Math.max(ns.chainProgress.ants       || 0, 2) } };
  if (outcome.special === "ants_chain3")      ns = { ...ns, chainProgress: { ...ns.chainProgress, ants:       Math.max(ns.chainProgress.ants       || 0, 3) } };
  if (outcome.special === "shrine_chain")     ns = { ...ns, chainProgress: { ...ns.chainProgress, shrine:     Math.max(ns.chainProgress.shrine     || 0, 1) }, factions: { ...ns.factions, shrine:     Math.min(2, ns.factions.shrine + 1) } };
  if (outcome.special === "shrine_chain2")    ns = { ...ns, chainProgress: { ...ns.chainProgress, shrine:     Math.max(ns.chainProgress.shrine     || 0, 2) } };
  if (outcome.special === "settlement_chain") ns = { ...ns, chainProgress: { ...ns.chainProgress, settlement: Math.max(ns.chainProgress.settlement || 0, 1) } };
  if (outcome.locState && locId) ns = { ...ns, locationStates: { ...ns.locationStates, [locId]: outcome.locState } };
  return ns;
}