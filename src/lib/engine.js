import { Effects, getSeason, clamp } from './effects';
import { mkMouse, pick, pickWeighted, getAllBuildings, hasBldg, injureRandom, applyOutcome } from './helpers';
import { STATIC_LOCATIONS, LOC_HEXES } from '../data/locations';
import { STATIC_EVENTS } from '../data/events';
import { STATIC_BUILDINGS } from '../data/buildings';
import { CHAINS } from '../data/chains';
import { TRAITS, ACTIONS, POLICIES } from '../data/traits';

export const FACTION_DEFAULTS = { ants: 0, patrol: 0, shrine: 0, spider: 0 };

export function initState() {
  const mice = [mkMouse("Pippin"), mkMouse("Clover"), mkMouse("Bramble"), mkMouse("Nettle")];
  mice[0].trait = "brave";
  mice[1].trait = "green";
  mice[2].trait = "stocky";
  mice[3].trait = "cheerful";
  return {
    turn: 1, maxTurns: 50, phase: "assign",
    mice, assignments: {},
    food: 20, foodCap: 40,
    wood: 10, woodCap: 30,
    mats: 6,  matsCap: 25,
    morale: 60, threat: 0,
    buildings: STATIC_BUILDINGS.map(b => ({ ...b })),
    extraBuildings: [],
    policies: [], buildQueue: null,
    pendingEvent: null, pendingExplore: null, pendingResult: null,
    pendingChain: null, policyChoices: [],
    factions: { ...FACTION_DEFAULTS },
    chainProgress: { spider: 0, ants: 0, shrine: 0, settlement: 0 },
    chainFlags: {}, locationStates: {},
    exploredLocs: [], hexMap: initHexMap(),
    log: [{ t: 0, msg: "Willowroot stirs — the first cold wind rustles the oak.", good: true, title: "Willowroot Awakens", lore: "The burrow smells of old wood and damp earth. Four mice sit in the dim light of a tallow candle. Outside, the world is enormous and does not care." }],
  };
}

export function initHexMap() {
  const VH = { c: 4, r: 3 };
  const rev = new Set();
  rev.add(`${VH.c},${VH.r}`);
  hneighbours(VH.c, VH.r).forEach(h => rev.add(`${h.c},${h.r}`));
  return { revealed: [...rev] };
}

export function hneighbours(c, r) {
  const e = c % 2 === 0;
  return [
    { c: c - 1, r: e ? r - 1 : r }, { c: c - 1, r: e ? r : r + 1 },
    { c, r: r - 1 }, { c, r: r + 1 },
    { c: c + 1, r: e ? r - 1 : r }, { c: c + 1, r: e ? r : r + 1 },
  ].filter(h => h.c >= 0 && h.r >= 0 && h.c < 9 && h.r < 7);
}

export function revealAround(hexMap, locId) {
  const pos = LOC_HEXES[locId];
  if (!pos) return hexMap;
  const s = new Set(hexMap.revealed || []);
  s.add(`${pos.c},${pos.r}`);
  hneighbours(pos.c, pos.r).forEach(h => s.add(`${h.c},${h.r}`));
  return { ...hexMap, revealed: [...s] };
}

export function checkChainTriggers(s) {
  const { chainProgress: cp, factions: f, chainFlags: cf, turn } = s;
  if (cp.spider >= 1 && f.spider >= 1 && !cf.spider_debt && turn > 15)  return { ...s, chainFlags: { ...cf, spider_debt:   true }, pendingChain: { chain: "spider",     step: 1 }, phase: "chain" };
  if (f.spider === 2  && !cf.spider_ally && turn > 25)                   return { ...s, chainFlags: { ...cf, spider_ally:   true }, pendingChain: { chain: "spider",     step: 2 }, phase: "chain" };
  if (cp.ants >= 1    && !cf.ant_first)                                  return { ...s, chainFlags: { ...cf, ant_first:     true }, pendingChain: { chain: "ants",       step: 0 }, phase: "chain" };
  if (cp.ants >= 2    && !cf.ant_crisis)                                 return { ...s, chainFlags: { ...cf, ant_crisis:    true }, pendingChain: { chain: "ants",       step: 1 }, phase: "chain" };
  if (cp.ants >= 3    && f.ants === 2 && !cf.ant_army && turn > 35)     return { ...s, chainFlags: { ...cf, ant_army:      true }, pendingChain: { chain: "ants",       step: 2 }, phase: "chain" };
  if (cp.shrine >= 1  && f.shrine >= 1 && !cf.shrine_first)             return { ...s, chainFlags: { ...cf, shrine_first:  true }, pendingChain: { chain: "shrine",     step: 0 }, phase: "chain" };
  if (cp.shrine >= 2  && !cf.shrine_trial)                              return { ...s, chainFlags: { ...cf, shrine_trial:  true }, pendingChain: { chain: "shrine",     step: 1 }, phase: "chain" };
  if (cp.shrine >= 2  && f.shrine >= 2 && !cf.shrine_blessing && turn > 30) return { ...s, chainFlags: { ...cf, shrine_blessing: true }, pendingChain: { chain: "shrine", step: 2 }, phase: "chain" };
  if (cp.settlement >= 1 && !cf.settle_discovery)                       return { ...s, chainFlags: { ...cf, settle_discovery: true }, pendingChain: { chain: "settlement", step: 0 }, phase: "chain" };
  if (cf.settle_investigate && !cf.settle_circle)                       return { ...s, chainFlags: { ...cf, settle_circle:   true }, pendingChain: { chain: "settlement", step: 1 }, phase: "chain" };
  if (cf.lens && !cf.settle_return)                                     return { ...s, chainFlags: { ...cf, settle_return:   true }, pendingChain: { chain: "settlement", step: 2 }, phase: "chain" };
  return null;
}

export function checkNextPhase(ns) {
  const ch = checkChainTriggers(ns);
  if (ch) return ch;
  const season = getSeason(ns.turn);
  const roll = Math.random();
  if (roll < (0.18 + season.ebc)) {
    const pool = roll < 0.18
      ? STATIC_EVENTS.filter(e => e.type === "good")
      : STATIC_EVENTS.filter(e => e.type === "bad");
    ns.pendingEvent = pick(pool);
    ns.phase = "event";
  } else if (ns.turn % 10 === 1 && ns.turn > 1) {
    ns.policyChoices = POLICIES.filter(p => !ns.policies.includes(p.id)).sort(() => Math.random() - 0.5).slice(0, 3);
    ns.phase = "policy";
  } else if (ns.turn > ns.maxTurns) {
    ns.phase = "gameover";
  } else {
    ns.phase = "assign";
  }
  return ns;
}

export function applyPolicyImmediate(s, pol) {
  if (pol.id === "harvest_fest")  return Effects.compose(Effects.morale(15), Effects.food(-5))(s);
  if (pol.id === "strict_ration") return Effects.morale(-10)(s);
  if (pol.id === "communal")      return Effects.morale(5)(s);
  return s;
}

export function processTurn(s) {
  let ns = { ...s, assignments: {} };
  const a = s.assignments, p = s.policies, season = getSeason(ns.turn), allB = getAllBuildings(ns);
  const counts = {};
  ACTIONS.forEach(x => { counts[x.id] = 0; });
  s.mice.forEach(m => { if (a[m.id] && !m.lost) counts[a[m.id]] = (counts[a[m.id]] || 0) + 1; });

  // Forage
  const fc = s.mice.filter(m => a[m.id] === "forage" && !m.lost).length;
  let fb = 2.5 + (allB.find(b => b.id === "seedlib" && b.built) ? 1 : 0) + (p.includes("forager_guild") ? 1 : 0);
  if (fc >= 4) fb = Math.max(1, fb - 0.5 * (fc - 3));
  s.mice.forEach(m => { if (a[m.id] === "forage" && !m.lost) ns.food = clamp(ns.food + fb + traitBonusLocal(m.trait, "forage"), 0, ns.foodCap); });
  s.mice.forEach(m => { if (a[m.id] === "haul"   && !m.lost) ns.wood = clamp(ns.wood + 2 + traitBonusLocal(m.trait, "haul"),   0, ns.woodCap); });
  s.mice.forEach(m => { if (a[m.id] === "gather" && !m.lost) ns.mats = clamp(ns.mats + 2 + (p.includes("deep_roots") ? 1 : 0), 0, ns.matsCap); });

  // Build
  if (ns.buildQueue && counts["build"] > 0 && !p.includes("deep_roots")) {
    const allBNow = getAllBuildings(ns), bldg = allBNow.find(b => b.id === ns.buildQueue);
    if (bldg && !bldg.built && ns.wood >= bldg.cost.wood && ns.mats >= bldg.cost.mats) {
      ns.wood -= bldg.cost.wood; ns.mats -= bldg.cost.mats;
      const mark = b => b.id === ns.buildQueue ? { ...b, built: true } : b;
      ns.buildings = ns.buildings.map(mark);
      ns.extraBuildings = (ns.extraBuildings || []).map(mark);
      if (bldg.effect_type === "food_cap") ns.foodCap += bldg.effect_value;
      if (bldg.effect_type === "wood_cap") ns.woodCap += bldg.effect_value;
      ns.log = [...ns.log, { t: ns.turn, msg: `${bldg.name} is complete!`, good: true, title: `${bldg.name} Complete`, lore: bldg.lore || bldg.flavor || "They stood back and looked at what they'd built. It was theirs." }];
      ns.buildQueue = null;
    }
  }

  // Explore
  const explorers = s.mice.filter(m => a[m.id] === "explore" && !m.lost);
  if (explorers.length > 0) {
    const braveCount = explorers.filter(m => m.trait === "brave" || m.trait === "swift").length;
    ns.threat = Math.max(0, ns.threat - braveCount * (p.includes("scouts") ? 2 : 1));
    const loc = pick(STATIC_LOCATIONS);
    const locState = ns.locationStates[loc.id] || "calm";
    ns.pendingExplore = { loc, state: locState };
  }

  // Rest / lost mice
  ns.mice = ns.mice.map(m => {
    if (a[m.id] === "rest" && m.injured) return { ...m, injured: false };
    if (m.lost) {
      const rem = m.lostTurns - (counts["rest"] > 0 ? 2 : 1);
      if (rem <= 0) return { ...m, lost: false, lostTurns: 0, lostReason: "", history: [...(m.history || []), `Returned from: ${m.lostReason}`] };
      return { ...m, lostTurns: Math.max(0, rem) };
    }
    return m;
  });
  const returned = ns.mice.filter(m => !m.lost && s.mice.find(sm => sm.id === m.id)?.lost);
  returned.forEach(m => {
    const b = p.includes("harvest_moon") ? 8 : 5;
    ns.morale = clamp(ns.morale + b, 0, 100);
    ns.log = [...ns.log, { t: ns.turn, msg: `${m.name} returned home. Morale +${b}.`, good: true, title: `${m.name} Returns`, lore: "They came back changed in small ways that are hard to name. But they came back." }];
  });

  if (counts["rest"]  > 0) ns.morale = clamp(ns.morale + counts["rest"] * 4, 0, 100);
  const wb = allB.find(b => b.id === "watchpost" && b.built) ? 3 : 1.5;
  if (counts["watch"] > 0) ns.threat = Math.max(0, ns.threat - counts["watch"] * wb);
  if (counts["craft"] > 0 && hasBldg(ns, "workshop")) {
    const u = Math.min(ns.mats, counts["craft"] * 2);
    ns.mats -= u;
    ns.wood  = clamp(ns.wood  + Math.floor(u / 2), 0, ns.woodCap);
    ns.food  = clamp(ns.food  + Math.floor(u / 2), 0, ns.foodCap);
  }

  // Consumption & passives
  const active = ns.mice.filter(m => !m.lost).length;
  const eat = active - (p.includes("strict_ration") ? 2 : 0) - (p.includes("communal") ? 1 : 0);
  const dry = allB.find(b => b.id === "dryroom" && b.built) ? 1 : 0;
  ns.food = clamp(ns.food - eat + dry, 0, ns.foodCap);
  s.mice.forEach(m => { if (m.trait === "cheerful" && !m.lost) ns.morale = clamp(ns.morale + 0.5, 0, 100); });
  s.mice.forEach(m => { if (m.trait === "greedy"   && !m.lost) ns.food   = clamp(ns.food   - 0.5 * (p.includes("communal") ? 2 : 1), 0, ns.foodCap); });
  if (active >= 6) { ns.morale = clamp(ns.morale - (active - 5), 0, 100); ns.food = clamp(ns.food - 0.5 * (active - 5), 0, ns.foodCap); }
  if (ns.food <= 0) { ns.morale = clamp(ns.morale - 8, 0, 100); ns.log = [...ns.log, { t: ns.turn, msg: "Empty stores — everyone goes hungry.", good: false, title: "Hungry Night", lore: "Supper was thin broth and silence." }]; }
  if (hasBldg(ns, "hearthstone")) ns.morale = Math.max(20, ns.morale);
  if (hasBldg(ns, "thornwall"))   ns.threat = Math.max(0, ns.threat - 1);
  if (ns.factions.ants   >= 1) ns.threat = Math.max(0, ns.threat - 1);
  if (ns.factions.patrol >= 1) ns.threat = Math.max(0, ns.threat - 0.5);
  ns.threat = clamp(
    ns.threat + season.tg
    + (p.includes("open_burrow")  ?  1   : 0)
    - (p.includes("night_watch")  ?  2   : 0)
    + (p.includes("harvest_moon") ?  0.5 : 0),
    0, 10
  );
  if (ns.threat >= 7) ns.morale = clamp(ns.morale - 5, 0, 100);

  // Arrivals
  const arrBonus = hasBldg(ns, "burrowinn") ? 0.2 : 0;
  if (ns.turn % 5 === 0 && Math.random() < (p.includes("open_burrow") ? 0.7 : 0.5) + arrBonus && ns.mice.length < 8) {
    const nm = mkMouse();
    const tObj = TRAITS.find(t => t.id === nm.trait) || { label: "Unknown" };
    ns.mice = [...ns.mice, nm];
    ns.morale = clamp(ns.morale + 5, 0, 100);
    ns.log = [...ns.log, { t: ns.turn, msg: `${nm.name} the ${tObj.label} joined Willowroot!`, good: true, title: `${nm.name} Arrives`, lore: "They arrived at dusk with nothing but a worn satchel and a cautious smile." }];
  }

  ns.turn = ns.turn + 1;
  if (ns.pendingExplore) { ns.phase = "explore"; return ns; }
  return checkNextPhase(ns);
}

// local copy to avoid circular import
function traitBonusLocal(trait, action) {
  if (action === "forage"  && trait === "green")   return 1;
  if (action === "forage"  && trait === "forager") return 1.5;
  if (action === "forage"  && trait === "greedy")  return -0.5;
  if (action === "explore" && trait === "brave")   return 1;
  if (action === "explore" && trait === "swift")   return 2;
  if (action === "explore" && trait === "nervous") return -1;
  if (action === "haul"    && trait === "stocky")  return 1;
  return 0;
}

export { applyOutcome, pickWeighted, getAllBuildings, hasBldg, injureRandom, pick };
export { CHAINS };