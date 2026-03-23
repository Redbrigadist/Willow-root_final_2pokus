export const MOUSE_NAMES = [
  "Pippin","Clover","Bramble","Nettle","Sedge","Acorn","Fern","Thistle",
  "Moss","Hazel","Reed","Sorrel","Burr","Wren","Cricket","Cobble","Ember",
  "Ash","Flint","Briar","Yarrow","Juniper","Cobnut","Thistlewick","Rushmore",
  "Pebble","Gorse","Dew","Flax","Chestnut",
];

export const TRAITS = [
  {id:"brave",   label:"Brave",       glyph:"⚔", desc:"Reduces threat when exploring."},
  {id:"green",   label:"Green Paw",   glyph:"☘", desc:"Foragers bring +1 food/turn."},
  {id:"stocky",  label:"Stocky",      glyph:"⚒", desc:"Haulers bring +1 wood/turn."},
  {id:"clever",  label:"Clever",      glyph:"✦", desc:"Builds faster."},
  {id:"nervous", label:"Nervous",     glyph:"~", desc:"Exploration penalty."},
  {id:"cheerful",label:"Cheerful",    glyph:"♪", desc:"Morale +0.5 passively each turn."},
  {id:"greedy",  label:"Greedy",      glyph:"$", desc:"Consumes extra food."},
  {id:"careful", label:"Careful",     glyph:"◎", desc:"Steady builder."},
  {id:"swift",   label:"Swift",       glyph:"→", desc:"Exploration threat reduction doubled."},
  {id:"forager", label:"Born Forager",glyph:"⁂", desc:"Forage yields +1.5 food/turn."},
];

export const ACTIONS = [
  {id:"forage", label:"Forage",      glyph:"⁂", desc:"Gather food. Green Paw and Born Forager excel."},
  {id:"haul",   label:"Haul Wood",   glyph:"⊞", desc:"Gather wood. Stocky mice carry more."},
  {id:"gather", label:"Gather Mats", glyph:"◈", desc:"Scavenge materials from the garden edges."},
  {id:"build",  label:"Build",       glyph:"⌂", desc:"Work on queued building."},
  {id:"explore",label:"Explore",     glyph:"◎", desc:"Scout the world. Reveals the hex map."},
  {id:"rest",   label:"Rest",        glyph:"☽", desc:"Recover morale and heal injuries."},
  {id:"watch",  label:"Night Watch", glyph:"◉", desc:"Reduce threat."},
  {id:"craft",  label:"Craft",       glyph:"⚒", desc:"Requires Twig Workshop. Converts mats to food and wood."},
];

export const POLICIES = [
  {id:"harvest_fest", name:"Harvest Festival",   pos:"Morale +15, foragers +1",        neg:"Costs 5 food",              flavor:"The whole village dances around the acorn pile until dawn."},
  {id:"strict_ration",name:"Strict Rationing",   pos:"Food use -2/turn",               neg:"Morale -10",                flavor:"Half a seed at supper. Everyone counts the days."},
  {id:"forager_guild",name:"Forager's Guild",    pos:"Foragers +1 output",             neg:"Builders -1",               flavor:"A red acorn cap marks those who go beyond the roots."},
  {id:"night_watch",  name:"Night Watch Decree", pos:"Threat -2/turn",                 neg:"One mouse always on watch", flavor:"Two small eyes in the dark, watching the garden wall."},
  {id:"open_burrow",  name:"Open Burrow",        pos:"Morale +10, more arrivals",      neg:"Threat +1/turn",            flavor:"Leave the door unlatched. There are others out there."},
  {id:"deep_roots",   name:"Deep Roots",         pos:"Mats +1/turn, storage cap +10",  neg:"No new buildings",          flavor:"Dig deeper before you build higher."},
  {id:"communal",     name:"Communal Larder",    pos:"Food use -1/turn, morale +5",    neg:"Greedy mice penalised",     flavor:"Elder Moss chalks a tally mark for every seed."},
  {id:"scouts",       name:"Brave Scouts",       pos:"Explore threat bonus doubled",   neg:"Scouts risk 10% injury",    flavor:"They go alone, with only a thimble-cap and a brave heart."},
  {id:"stone_law",    name:"Stone Law",          pos:"No mouse works injured",         neg:"Morale -5 on any injury",   flavor:"Three scratches on the stone: no mouse works wounded."},
  {id:"harvest_moon", name:"Harvest Moon Vigil", pos:"Morale +8 when a mouse returns", neg:"Threat +0.5/turn",          flavor:"Every return is celebrated loudly, which draws attention."},
];