export const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

export const Effects = {
  food:   n => s => ({ ...s, food:   clamp(s.food   + n, 0, s.foodCap) }),
  wood:   n => s => ({ ...s, wood:   clamp(s.wood   + n, 0, s.woodCap) }),
  mats:   n => s => ({ ...s, mats:   clamp(s.mats   + n, 0, s.matsCap) }),
  morale: n => s => ({ ...s, morale: clamp(s.morale + n, 0, 100) }),
  threat: n => s => ({ ...s, threat: clamp(s.threat + n, 0, 10) }),
  compose: (...fns) => s => fns.reduce((a, f) => f(a), s),
  fromData: d => s => {
    let ns = s;
    if (d.food)   ns = Effects.food(d.food)(ns);
    if (d.wood)   ns = Effects.wood(d.wood)(ns);
    if (d.mats)   ns = Effects.mats(d.mats)(ns);
    if (d.morale) ns = Effects.morale(d.morale)(ns);
    if (d.threat) ns = Effects.threat(d.threat)(ns);
    return ns;
  },
};

export function getSeason(t) {
  if (t <= 15) return { name:"Early Autumn", tg:0.8,  ebc:0.18, label:"Early Autumn — days are still warm" };
  if (t <= 30) return { name:"Late Autumn",  tg:1.2,  ebc:0.25, label:"Late Autumn — nights grow cold" };
  return             { name:"Pre-Winter",   tg:1.8,  ebc:0.35, label:"Pre-Winter — frost on the roots" };
}

export function effectSummary(outcome) {
  const parts = [];
  if (outcome.food   > 0) parts.push(`+${outcome.food} food`);
  if (outcome.food   < 0) parts.push(`${outcome.food} food`);
  if (outcome.wood   > 0) parts.push(`+${outcome.wood} wood`);
  if (outcome.wood   < 0) parts.push(`${outcome.wood} wood`);
  if (outcome.mats   > 0) parts.push(`+${outcome.mats} mats`);
  if (outcome.mats   < 0) parts.push(`${outcome.mats} mats`);
  if (outcome.morale > 0) parts.push(`morale +${outcome.morale}`);
  if (outcome.morale < 0) parts.push(`morale ${outcome.morale}`);
  if (outcome.threat > 0) parts.push(`threat +${outcome.threat}`);
  if (outcome.threat < 0) parts.push(`threat ${outcome.threat}`);
  if (outcome.special === "injure")    parts.push("one mouse injured");
  if (outcome.special === "add_mouse") parts.push("a mouse joins");
  return parts.length ? parts.join(", ") : "No mechanical effect.";
}