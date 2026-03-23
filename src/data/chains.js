import { Effects } from '../lib/effects';
import { injureRandom, pick } from '../lib/helpers';

export const CHAINS = {
  spider: { steps: [
    {
      title: "The Spider's Bargain",
      body: "She sits at the centre of her web like a queen at court. Her voice is low and formal. She knows where three caches are buried. She asks only that you remember the debt.",
      choices: [
        { label: "Accept the bargain",
          effect: s => ({ ...Effects.compose(Effects.food(8), Effects.mats(5))(s), factions: { ...s.factions, spider: 1 }, log: [...s.log, { t: s.turn, msg: "Spider's bargain accepted. +8 food, +5 mats.", good: true, title: "The Bargain Sealed", lore: "She did not shake paws. She simply waited until you nodded. The debt is remembered." }] }) },
        { label: "Decline politely",
          effect: s => ({ ...s, factions: { ...s.factions, spider: 0 }, log: [...s.log, { t: s.turn, msg: "The spider's bargain declined.", good: true, title: "No Bargain", lore: "'Another time,' she said. But she sounded certain there would not be another time." }] }) },
      ],
    },
    {
      title: "The Spider Calls In the Debt",
      body: "A single thread at the burrow entrance, tied in a specific knot. The spider requires payment.",
      choices: [
        { label: "Send food (costs 8 food)",
          effect: s => ({ ...Effects.food(-8)(s), factions: { ...s.factions, spider: 2 }, log: [...s.log, { t: s.turn, msg: "Debt paid with food. Spider allied.", good: true, title: "Debt Honoured", lore: "The food was gone by morning. A sense of watchful protection settles over the entrance." }] }) },
        { label: "Send a volunteer (away 3 turns)",
          effect: s => {
            const ok = s.mice.filter(m => !m.injured && !m.lost);
            if (!ok.length) return { ...s, log: [...s.log, { t: s.turn, msg: "No mouse available.", good: false, title: "Debt Unpaid", lore: "She will remember this." }] };
            const c = pick(ok);
            return { ...s, mice: s.mice.map(m => m.id === c.id ? { ...m, lost: true, lostTurns: 3, lostReason: "sent to the spider" } : m), factions: { ...s.factions, spider: 2 }, log: [...s.log, { t: s.turn, msg: `${c.name} sent to the spider.`, good: true, title: "A Mouse Sent", lore: `${c.name} walked into the webs without looking back.` }] };
          } },
        { label: "Refuse",
          effect: s => ({ ...Effects.threat(3)(s), factions: { ...s.factions, spider: -2 }, log: [...s.log, { t: s.turn, msg: "Spider's debt refused. Threat +3.", good: false, title: "The Debt Refused", lore: "Three mice reported nightmares that week." }] }) },
      ],
    },
    {
      title: "The Spider's Web — An Ally",
      body: "Word comes through the web-thread network: the spider intercepted a rat scouting party and turned them back.",
      choices: [
        { label: "Acknowledge the gift",
          effect: s => ({ ...Effects.compose(Effects.threat(-3), Effects.morale(8))(s), log: [...s.log, { t: s.turn, msg: "Spider ally acts — threat -3, morale +8.", good: true, title: "The Web Holds", lore: "Three rats turned back at the old stone." }] }) },
      ],
    },
  ]},

  ants: { steps: [
    {
      title: "The Ant Envoy",
      body: "A single ant bears a tiny clay token — an old diplomatic signal. The colony proposes mutual defence.",
      choices: [
        { label: "Accept the accord",
          effect: s => ({ ...Effects.threat(-2)(s), factions: { ...s.factions, ants: 1 }, log: [...s.log, { t: s.turn, msg: "Ant accord accepted. Threat -2.", good: true, title: "The Ant Accord", lore: "That afternoon an ant tapped twice on the root wall: rat patrol, north side." }] }) },
        { label: "Decline",
          effect: s => ({ ...s, factions: { ...s.factions, ants: -1 }, log: [...s.log, { t: s.turn, msg: "Ant accord declined.", good: false, title: "Accord Rejected", lore: "The ant walked away with the dignity of a creature that will not forget." }] }) },
      ],
    },
    {
      title: "The Colony Needs Aid",
      body: "The ant network goes quiet. A single worker, barely moving, reaches the burrow. Fungus-blight has struck their stores.",
      choices: [
        { label: "Send 6 food",
          effect: s => ({ ...Effects.food(-6)(s), factions: { ...s.factions, ants: 2 }, log: [...s.log, { t: s.turn, msg: "Colony aided. Ants allied.", good: true, title: "Aid Given", lore: "The colony recovered. The threat reports became more detailed than ever." }] }) },
        { label: "Send 3 food",
          effect: s => ({ ...Effects.food(-3)(s), factions: { ...s.factions, ants: 1 }, log: [...s.log, { t: s.turn, msg: "Colony aided with 3 food.", good: true, title: "Partial Aid", lore: "Not enough, but something. The colony remembered." }] }) },
        { label: "Send nothing",
          effect: s => ({ ...s, factions: { ...s.factions, ants: -1 }, log: [...s.log, { t: s.turn, msg: "Colony not aided.", good: false, title: "No Aid", lore: "Relations become carefully formal — in ant terms, nearly hostile." }] }) },
      ],
    },
    {
      title: "The Colony Marches",
      body: "The ground vibrates with ten thousand feet. The ant colony has mobilised on your behalf.",
      choices: [
        { label: "Witness and give thanks",
          effect: s => ({ ...Effects.morale(12)({ ...s, threat: 0 }), log: [...s.log, { t: s.turn, msg: "Ant army clears all threats. Threat→0, morale +12.", good: true, title: "The March of Allies", lore: "Row upon row, moving with one mind. When it was done, the garden was utterly still." }] }) },
      ],
    },
  ]},

  shrine: { steps: [
    {
      title: "The Shrine Keeper Speaks",
      body: "An elderly mouse in plain robes. She offers a blessing — but first: 'What do you owe the dead?'",
      choices: [
        { label: "'We remember them.'",
          effect: s => ({ ...Effects.morale(10)(s), factions: { ...s.factions, shrine: 1 }, log: [...s.log, { t: s.turn, msg: "Shrine keeper pleased. Morale +10.", good: true, title: "An Honest Answer", lore: "She touched each mouse's forehead. Everyone felt, afterwards, slightly more certain." }] }) },
        { label: "'We owe them winter stores.'",
          effect: s => ({ ...s, factions: { ...s.factions, shrine: 0 }, log: [...s.log, { t: s.turn, msg: "Shrine keeper considers.", good: true, title: "A Practical Answer", lore: "'Practical,' she said, in a tone that was not entirely a compliment." }] }) },
        { label: "'Nothing. The dead are gone.'",
          effect: s => ({ ...Effects.morale(-5)(s), factions: { ...s.factions, shrine: -1 }, log: [...s.log, { t: s.turn, msg: "Shrine keeper displeased. Morale -5.", good: false, title: "A Hard Answer", lore: "Three mice felt cold for the rest of the day." }] }) },
      ],
    },
    {
      title: "The Keeper's Trial",
      body: "One mouse must sit alone at the boulder shrine through a full night, in silence, without sleeping.",
      choices: [
        { label: "Send your bravest mouse",
          effect: s => {
            const b = s.mice.find(m => m.trait === "brave" && !m.injured && !m.lost) || s.mice.find(m => !m.injured && !m.lost);
            if (!b) return { ...s, log: [...s.log, { t: s.turn, msg: "No mouse available.", good: false, title: "Trial Refused", lore: "'Another season,' she said." }] };
            return { ...Effects.compose(Effects.morale(15), Effects.threat(-2))(s), mice: s.mice.map(m => m.id === b.id ? { ...m, history: [...(m.history || []), "Survived the Keeper's Trial"] } : m), factions: { ...s.factions, shrine: 2 }, log: [...s.log, { t: s.turn, msg: `${b.name} completed the Trial. Morale +15, threat -2.`, good: true, title: "The Trial Complete", lore: `${b.name} came back at dawn looking older. They worked with a quiet certainty after that.` }] };
          } },
        { label: "Decline",
          effect: s => ({ ...s, factions: { ...s.factions, shrine: Math.max(-2, s.factions.shrine - 1) }, log: [...s.log, { t: s.turn, msg: "Trial declined.", good: false, title: "Trial Declined", lore: "'Practical,' she said again, in exactly the same tone." }] }) },
      ],
    },
    {
      title: "The Great Blessing",
      body: "She comes at dawn and speaks for a long time in a language older than mouse-tongue.",
      choices: [
        { label: "Receive the blessing",
          effect: s => ({ ...Effects.compose(Effects.morale(20), Effects.threat(-3), Effects.food(6))(s), log: [...s.log, { t: s.turn, msg: "Great Blessing — morale +20, threat -3, food +6.", good: true, title: "The Great Blessing", lore: "Nettle said she was not afraid of winter anymore. Nobody disagreed." }] }) },
      ],
    },
  ]},

  settlement: { steps: [
    {
      title: "The Empty Village",
      body: "Scouts return from J7 with questions. The last journal entry: 'They found the thing under the kamenný kruh. We must go. Do not follow.'",
      choices: [
        { label: "Investigate the stone circle",
          effect: s => ({ ...s, chainFlags: { ...s.chainFlags, settle_investigate: true }, log: [...s.log, { t: s.turn, msg: "Stone circle investigation ordered.", good: true, title: "The Order Given", lore: "Three scouts volunteer without being asked." }] }) },
        { label: "Leave it — winter first",
          effect: s => ({ ...s, chainFlags: { ...s.chainFlags, settle_avoided: true }, log: [...s.log, { t: s.turn, msg: "The circle left uninvestigated.", good: true, title: "Wisdom or Cowardice", lore: "The journal was burned so nobody would be tempted." }] }) },
      ],
    },
    {
      title: "The Cracked Stone Circle",
      body: "The stones are cracked and partially melted. Wrapped in cloth: a lens, thumb-sized, that shows something different depending on who holds it.",
      choices: [
        { label: "Take the lens",
          effect: s => ({ ...Effects.mats(3)(s), chainFlags: { ...s.chainFlags, lens: true }, log: [...s.log, { t: s.turn, msg: "The lens recovered.", good: true, title: "The Lens", lore: "When held to the light, you see something — it changes depending on who looks." }] }) },
        { label: "Leave the lens",
          effect: s => ({ ...Effects.morale(5)(s), chainFlags: { ...s.chainFlags, lens_left: true }, log: [...s.log, { t: s.turn, msg: "Lens left. Morale +5.", good: true, title: "Left Undisturbed", lore: "Something about leaving it there felt right." }] }) },
      ],
    },
    {
      title: "What the Lens Showed",
      body: "The warmth was not from below — it was the lens focusing heat. The thing they found was not a monster. It was a map scratched into the stone.",
      choices: [
        { label: "Use the map",
          effect: s => ({ ...Effects.threat(-4)(s), foodCap: Math.min(s.foodCap + 10, 90), chainFlags: { ...s.chainFlags, map_found: true }, log: [...s.log, { t: s.turn, msg: "Ancient map decoded. Threat -4, food cap +10.", good: true, title: "The Map of Five Hexes", lore: "The previous village left in panic over something they didn't understand. Willowroot understands." }] }) },
      ],
    },
  ]},
};