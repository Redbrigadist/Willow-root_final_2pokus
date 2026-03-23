export const STATIC_LOCATIONS = [
  // ── CHAIN LOCATIONS ────────────────────────────────────────────────────────
  {
    id:"E7", name:"Spider's Domain", danger:true, chain:"spider", fluff:false,
    desc:{
      calm:"Fine webs almost invisible. The spider is patient and intelligent.",
      disturbed:"The webs are denser. The spider has been expanding.",
      corrupted:"The webs cover everything. Something large caught in the outer rings.",
    },
    safe:{
      calm:"Your scouts sense the webs and retreat cleanly.",
      disturbed:"New webs nearly caught one scout. You pull back.",
      corrupted:"Your scouts take one look and turn around.",
    },
    outcomes:{
      calm:[
        {w:2,type:"good",title:"The Spider Speaks",       lore:"She offers information in exchange for a remembered debt.",                                   food:0,wood:0,mats:0, morale:0,  threat:-2, special:"spider_chain"},
        {w:2,type:"good",title:"Web Silk Harvested",      lore:"Abandoned sections — incredibly strong.",                                                    food:0,wood:0,mats:6, morale:0,  threat:0 },
        {w:1,type:"bad", title:"Caught in the Web",       lore:"The spider watched with patient eyes until others cut her free.",                             food:0,wood:0,mats:0, morale:-5, threat:0, special:"injure", locState:"disturbed"},
      ],
      disturbed:[
        {w:2,type:"bad", title:"The Webs Tighten",        lore:"Your scouts barely made it out.",                                                             food:0,wood:0,mats:0, morale:0,  threat:2, locState:"corrupted"},
        {w:1,type:"good",title:"She is Distracted",       lore:"Something else has her attention. You slip through safely.",                                  food:0,wood:0,mats:4, morale:0,  threat:0 },
      ],
      corrupted:[
        {w:2,type:"bad", title:"No Entry",                lore:"The territory is impassable.",                                                               food:0,wood:0,mats:0, morale:0,  threat:1 },
        {w:1,type:"good",title:"The Debt Remembered",     lore:"A thread left as a guide.",                                                                   food:0,wood:0,mats:3, morale:0,  threat:-1},
      ],
    },
  },
  {
    id:"D3", name:"Enormous Ant Colony", danger:true, chain:"ants", fluff:false,
    desc:{
      calm:"The earth pulses with life. Ants march in endless streams.",
      disturbed:"The streams are disrupted. Patrols more aggressive.",
      corrupted:"The colony on war-footing. Every entrance guarded.",
    },
    safe:{
      calm:"Your scouts watch from a safe distance.",
      disturbed:"The patrols turn toward your scouts.",
      corrupted:"Armed workers at every approach.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Pheromone Trade",         lore:"A drop of fruit juice. The ants responded with food scraps.",                                 food:9,wood:0,mats:0, morale:0,  threat:0,  special:"ants_chain"},
        {w:1,type:"bad", title:"Colony Attacked",         lore:"Something went wrong. The wave mobilised.",                                                   food:0,wood:0,mats:0, morale:-8, threat:2,  locState:"disturbed"},
      ],
      disturbed:[
        {w:2,type:"good",title:"Ally Signal",             lore:"The clay token recognised.",                                                                  food:0,wood:0,mats:0, morale:0,  threat:0,  special:"ants_chain2"},
        {w:2,type:"bad", title:"Turned Back",             lore:"Mandibles and numbers.",                                                                      food:0,wood:0,mats:0, morale:0,  threat:1 },
      ],
      corrupted:[
        {w:1,type:"good",title:"Old Alliance",            lore:"A single ant breaks formation.",                                                              food:0,wood:0,mats:0, morale:0,  threat:0,  special:"ants_chain3"},
        {w:3,type:"bad", title:"War Footing",             lore:"Caught in the edge of a war.",                                                                food:0,wood:0,mats:0, morale:-5, threat:2 },
      ],
    },
  },
  {
    id:"G7", name:"Mouse Shrine", danger:false, chain:"shrine", fluff:false,
    desc:{
      calm:"A small stone altar with offerings. Someone maintains it.",
      disturbed:"The offerings rearranged. The keeper is active.",
      corrupted:"The shrine is unattended. Offerings blown away.",
    },
    safe:{
      calm:"Your scouts leave a small seed.",
      disturbed:"Fresh offerings — the keeper was recently here.",
      corrupted:"Your scouts tidy the altar as best they can.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Shrine Blessing",         lore:"The quiet here is different from other quiets.",                                              food:0,wood:0,mats:0, morale:12, threat:0,  special:"shrine_chain"},
        {w:1,type:"bad", title:"Offering Knocked Over",   lore:"By accident. The atmosphere changed immediately.",                                            food:0,wood:0,mats:0, morale:-5, threat:0 },
      ],
      disturbed:[
        {w:2,type:"good",title:"Keeper Encountered",      lore:"She looked at each scout before speaking.",                                                   food:3,wood:0,mats:0, morale:8,  threat:0,  special:"shrine_chain2"},
        {w:1,type:"bad", title:"Strange Omen",            lore:"The offerings arranged into a warning none could read.",                                      food:0,wood:0,mats:0, morale:-4, threat:1 },
      ],
      corrupted:[
        {w:1,type:"good",title:"She Left a Message",      lore:"One word scratched on the altar: 'Endure.'",                                                  food:0,wood:0,mats:0, morale:6,  threat:0 },
        {w:2,type:"bad", title:"Silent Stone",            lore:"Nothing. Just an old stone.",                                                                 food:0,wood:0,mats:0, morale:-4, threat:0 },
      ],
    },
  },
  {
    id:"J7", name:"Abandoned Settlement", danger:true, chain:"settlement", fluff:false,
    desc:{
      calm:"Remains of nests speak of sudden departure. Food left on tables. Fires unextinguished.",
      disturbed:"The settlement has been searched. The journal is gone.",
      corrupted:"Something else has moved in. Nests rebuilt in wrong shapes.",
    },
    safe:{
      calm:"Your scouts walk the empty streets in silence.",
      disturbed:"Someone else has been here.",
      corrupted:"The wrong-shaped nests. Leave immediately.",
    },
    outcomes:{
      calm:[
        {w:2,type:"good",title:"Full Salvage",            lore:"The stores still full. Someone else's winter preparations became yours.",                     food:10,wood:5,mats:6, morale:0,   threat:0,  special:"settlement_chain"},
        {w:1,type:"good",title:"Survivor Found",          lore:"One mouse hiding in a thimble. She joins Willowroot.",                                        food:0, wood:0,mats:0, morale:8,   threat:0,  special:"add_mouse"},
        {w:1,type:"bad", title:"Why They Left",           lore:"The scouts found out the hard way.",                                                          food:0, wood:0,mats:0, morale:-10, threat:4,  locState:"disturbed"},
      ],
      disturbed:[
        {w:1,type:"good",title:"Overlooked Cache",        lore:"Whoever searched missed the floor panel.",                                                    food:0,wood:0,mats:4, morale:0,  threat:0 },
        {w:2,type:"bad", title:"Occupied",                lore:"Not empty anymore.",                                                                          food:0,wood:0,mats:0, morale:0,  threat:3,  locState:"corrupted"},
      ],
      corrupted:[
        {w:2,type:"bad", title:"Wrong Shapes",            lore:"Your scouts don't look long enough to identify the occupants.",                               food:0,wood:0,mats:0, morale:-7, threat:2 },
      ],
    },
  },

  // ── MECHANICAL LOCATIONS ───────────────────────────────────────────────────
  {
    id:"A3", name:"Root Caves", danger:false, chain:null, fluff:false,
    desc:{
      calm:"Narrow tunnels beneath roots, smelling of wet earth.",
      disturbed:"Water levels higher. Some tunnels flooded.",
      corrupted:"Fully flooded.",
    },
    safe:{
      calm:"Scouts map the outer tunnels.",
      disturbed:"The water line is worrying.",
      corrupted:"Flooded solid.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Old Cache",               lore:"Seeds, mushroom, thread. Left by someone who never came back. The cache was tucked into a hollow where two roots crossed, wrapped in a piece of leaf that had dried to parchment.",                                    food:8,wood:0,mats:3, morale:0, threat:0 },
        {w:1,type:"bad", title:"Flash Flood",             lore:"The water rose without warning and without sound — one moment the tunnel floor was damp, the next it was moving. Everyone made it out. It was close.",                                                               food:0,wood:0,mats:0, morale:0, threat:0, special:"injure", locState:"disturbed"},
      ],
      disturbed:[
        {w:1,type:"good",title:"High Shelf Cache",        lore:"Above the waterline — whoever left this planned well. They understood that water rises and you cache higher than the highest mark, and then a little higher still.",                                                   food:4,wood:0,mats:0, morale:0, threat:0 },
        {w:2,type:"bad", title:"Getting Worse",           lore:"The tunnels narrowing with water.",                                                                                                                                                                                  food:0,wood:0,mats:0, morale:0, threat:0, locState:"corrupted"},
      ],
      corrupted:[
        {w:1,type:"good",title:"Eventually Drains",       lore:"The water level has dropped. The outermost chambers are passable now, if you don't mind the mud.",                                                                                                                    food:3,wood:0,mats:0, morale:0, threat:0, locState:"calm"},
        {w:2,type:"bad", title:"Still Flooded",           lore:"Come back later.",                                                                                                                                                                                                   food:0,wood:0,mats:0, morale:0, threat:0 },
      ],
    },
  },
  {
    id:"A7", name:"Abandoned Farm Wall", danger:false, chain:null, fluff:false,
    desc:{
      calm:"Bricks riddled with mouse entrances. Inside: corridors and nests.",
      disturbed:"Someone new has moved into the upper chambers.",
      corrupted:"Fully occupied. Not by mice.",
    },
    safe:{
      calm:"Scouts peer through entrances carefully.",
      disturbed:"Signs of activity above.",
      corrupted:"Something large lives in there.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Wall Hoard",              lore:"Buttons, copper wire, a needle the size of a sword. The scouts made four trips. On the fourth, the Clever mouse stopped and looked at the shelves someone had scratched into the mortar long ago.",                   food:0,wood:4,mats:7, morale:0,  threat:0 },
        {w:1,type:"bad", title:"Already Occupied",        lore:"Not abandoned. A sound from the upper chambers — low and rhythmic. The scouts retreated in the careful way, the way you move when you don't want to communicate urgency.",                                             food:0,wood:0,mats:0, morale:-8, threat:3, locState:"disturbed"},
      ],
      disturbed:[
        {w:1,type:"good",title:"Lower Cache",             lore:"The new occupants haven't found the lower chambers. The scouts moved through quietly, feeling the weight of something large directly above them.",                                                                       food:0,wood:0,mats:4, morale:0,  threat:0 },
        {w:2,type:"bad", title:"Contested",               lore:"Two factions of squatters arguing. The scouts retreated to the lower level and waited until the argument moved upward.",                                                                                               food:0,wood:0,mats:0, morale:0,  threat:2, locState:"corrupted"},
      ],
      corrupted:[
        {w:2,type:"bad", title:"Impassable",              lore:"Whatever is in there, it's settled.",                                                                                                                                                                                 food:0,wood:0,mats:0, morale:0,  threat:0 },
        {w:1,type:"good",title:"They Left Again",         lore:"The occupant moved on, recently enough that the warmth of occupation still lingered in the inner chambers.",                                                                                                           food:0,wood:0,mats:0, morale:0,  threat:0, locState:"calm"},
      ],
    },
  },
  {
    id:"C5", name:"Wasp Nest", danger:true, chain:null, fluff:false,
    desc:{
      calm:"A hollow tree hosts an enormous wasp nest. The buzzing audible from far away.",
      disturbed:"The nest disturbed. An angry buzzing, different in pitch.",
      corrupted:"The nest is dead. Grey and silent.",
    },
    safe:{
      calm:"Your scouts make a wide circle.",
      disturbed:"The buzzing is agitated.",
      corrupted:"Safely passable now.",
    },
    outcomes:{
      calm:[
        {w:1,type:"good",title:"Safe Passage",            lore:"There is a path that runs beneath the nest's main entrance at an angle the wasps apparently find uninteresting. The scouts found it by watching the flight patterns for a long time from a safe distance.",            food:0,wood:0,mats:0, morale:0,  threat:-2},
        {w:1,type:"good",title:"Old Honeycomb",           lore:"The comb was from a section of the nest abandoned two seasons ago — dark as amber, thick as clay, sweet in a way that fresh honey doesn't have. Back at the burrow it produced the particular quiet that good food makes.",food:5,wood:0,mats:0,morale:10,threat:0},
        {w:2,type:"bad", title:"Stung",                   lore:"The wasp that found them was as surprised as they were, and acted on instinct. One sting. One scout. The walk home was slow. The shoulder was stiff for a week.",                                                     food:0,wood:0,mats:0, morale:-8, threat:0, special:"injure", locState:"disturbed"},
      ],
      disturbed:[
        {w:2,type:"bad", title:"Very Angry",              lore:"Whatever disturbed the nest made them worse.",                                                                                                                                                                        food:0,wood:0,mats:0, morale:-5, threat:2 },
        {w:1,type:"good",title:"Ignored",                 lore:"Too focused on their own crisis. The scouts moved through quickly and came away with a fallen comb fragment from the ground at the nest's base.",                                                                      food:0,wood:0,mats:3, morale:0,  threat:0 },
      ],
      corrupted:[
        {w:3,type:"good",title:"Dead Nest Salvaged",      lore:"The colony had gone, all of them. The nest hung grey and silent. The papery outer layers pulled apart in sheets. Inside, the comb frames were intact, the wax still good.",                                           food:0,wood:0,mats:8, morale:0,  threat:0, locState:"calm"},
      ],
    },
  },
  {
    id:"H7", name:"Old Beehive", danger:false, chain:null, fluff:false,
    desc:{
      calm:"Abandoned hive. The honey is old but valuable.",
      disturbed:"Some bees have returned.",
      corrupted:"Fully recolonised.",
    },
    safe:{
      calm:"Scouts inspect from a distance. No bees.",
      disturbed:"The buzzing is back.",
      corrupted:"Active hive.",
    },
    outcomes:{
      calm:[
        {w:2,type:"good",title:"Old Honey",               lore:"Dark as treacle, dense, requiring a tool to shift. Rich and complex, sweet in a way that sat differently in the memory than ordinary sweetness. Someone said it tasted like memory.",                                  food:8,wood:0,mats:0, morale:7,  threat:0 },
        {w:2,type:"good",title:"Wax and Comb",            lore:"Beeswax does not rot. The scouts took everything they could carry and left only the frames that were too large to move.",                                                                                              food:0,wood:0,mats:7, morale:0,  threat:0 },
        {w:1,type:"bad", title:"Not Abandoned",           lore:"Three bees. That's all it took. One scout. One sting.",                                                                                                                                                               food:0,wood:0,mats:0, morale:0,  threat:0, special:"injure", locState:"disturbed"},
      ],
      disturbed:[
        {w:1,type:"good",title:"Small Harvest",           lore:"Quick in-and-out. The bees were present but occupied — a new colony still assessing the old hive, not yet defensive.",                                                                                                food:3,wood:0,mats:0, morale:0,  threat:0 },
        {w:2,type:"bad", title:"More Bees",               lore:"Getting worse.",                                                                                                                                                                                                     food:0,wood:0,mats:0, morale:0,  threat:0, locState:"corrupted"},
      ],
      corrupted:[
        {w:1,type:"good",title:"Abandoned Again",         lore:"Fresh comb the new colony had built and then abandoned. Fresh comb is better than old. The scouts took it all.",                                                                                                      food:0,wood:0,mats:0, morale:0,  threat:0, locState:"calm"},
        {w:2,type:"bad", title:"Active Colony",           lore:"Definitely not going in there.",                                                                                                                                                                                     food:0,wood:0,mats:0, morale:0,  threat:0 },
      ],
    },
  },
  {
    id:"D7", name:"Buried Cart", danger:false, chain:null, fluff:false,
    desc:{
      calm:"Half-sunken human cart. Natural chambers between the planks.",
      disturbed:"The cart has shifted — more sunken.",
      corrupted:"Mostly underground.",
    },
    safe:{
      calm:"Scouts circle carefully.",
      disturbed:"Creaking under new weight.",
      corrupted:"Mostly inaccessible.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Full Salvage",            lore:"Ropes, iron nails, canvas. The scouts worked in teams. Four trips. A good day.",                                                                                                                                      food:0,wood:4,mats:8, morale:0, threat:0 },
        {w:1,type:"bad", title:"Rotten Floor",            lore:"The upper deck looked solid. The scout who went first found the soft patch three steps in — found it with her foot, suddenly. She landed badly.",                                                                       food:0,wood:0,mats:0, morale:0, threat:0, special:"injure"},
      ],
      disturbed:[
        {w:1,type:"good",title:"One Chamber",             lore:"Most of the cart was wet or soft by now. One chamber remained, sealed by accident of angle and mud — dry inside, a small miracle.",                                                                                   food:0,wood:0,mats:3, morale:0, threat:0 },
        {w:2,type:"bad", title:"Unstable",                lore:"The cart creaked once in the wind. Dangerous.",                                                                                                                                                                      food:0,wood:0,mats:0, morale:0, threat:0 },
      ],
      corrupted:[
        {w:2,type:"bad", title:"Gone",                    lore:"Fully submerged.",                                                                                                                                                                                                   food:0,wood:0,mats:0, morale:0, threat:0 },
      ],
    },
  },
  {
    id:"B4", name:"Guarded Spring", danger:true, chain:null, fluff:false,
    desc:{
      calm:"Crystal water jets from rock. Local mice guard it with fanatic zeal.",
      disturbed:"The guards are doubled.",
      corrupted:"The spring is empty.",
    },
    safe:{
      calm:"Your scouts watch from the bracken.",
      disturbed:"Armed watchers wave you off.",
      corrupted:"Just an empty crack.",
    },
    outcomes:{
      calm:[
        {w:2,type:"good",title:"Spring Water Traded",     lore:"Six seeds for a thimble — a rate that is clearly fixed and known to be fair by both parties. The water was extraordinarily clean. That night everyone slept well.",                                                    food:3,wood:0,mats:0, morale:10, threat:0 },
        {w:1,type:"bad", title:"Turned Away",             lore:"Not rudely. Not today. No further explanation.",                                                                                                                                                                     food:0,wood:0,mats:0, morale:-4, threat:0 },
      ],
      disturbed:[
        {w:1,type:"good",title:"Crisis Diplomacy",        lore:"The spring had dropped. Into this the scouts arrived with an offer — not much, but something, freely given. Crisis diplomacy works best before either side has time to establish positions.",                           food:-3,wood:0,mats:0,morale:0,  threat:-2},
        {w:2,type:"bad", title:"No Entry",                lore:"Spears out.",                                                                                                                                                                                                        food:0, wood:0,mats:0,morale:0,  threat:1 },
      ],
      corrupted:[
        {w:1,type:"good",title:"Empty Spring Salvage",    lore:"The cache they left was the kind you leave when you are not coming back.",                                                                                                                                            food:4,wood:0,mats:2, morale:0,  threat:0 },
        {w:2,type:"bad", title:"Gone Dry",                lore:"Nothing here.",                                                                                                                                                                                                     food:0,wood:0,mats:0, morale:0,  threat:0 },
      ],
    },
  },
  {
    id:"B7", name:"Pine Rope Paths", danger:false, chain:null, fluff:false,
    desc:{
      calm:"A network of ropes maintained by patrol mice.",
      disturbed:"Some ropes have been cut.",
      corrupted:"The paths are abandoned.",
    },
    safe:{
      calm:"Your scouts signal a greeting from below.",
      disturbed:"Silence from above.",
      corrupted:"Empty sky.",
    },
    outcomes:{
      calm:[
        {w:3,type:"good",title:"Patrol Intelligence",     lore:"Cat patrol times, rat den location, three safe routes marked with notches in the bark below.",                                                                                                                        food:0,wood:0,mats:0, morale:0, threat:-3},
        {w:1,type:"bad", title:"Wind Accident",           lore:"The wind came from nowhere. The ankle had turned. Not broken. Badly sprained.",                                                                                                                                      food:0,wood:0,mats:0, morale:0, threat:0, special:"injure"},
      ],
      disturbed:[
        {w:1,type:"good",title:"Survivors Met",           lore:"Two patrol mice, both in poor condition. They accepted the scouts' food offering with the dignity of experienced professionals accepting necessary help.",                                                              food:0,wood:0,mats:0, morale:5, threat:-2},
        {w:2,type:"bad", title:"Ambush Country",          lore:"Whoever cut those ropes is still nearby.",                                                                                                                                                                          food:0,wood:0,mats:0, morale:0, threat:2 },
      ],
      corrupted:[
        {w:1,type:"good",title:"Old Stockpile",           lore:"On the ground below the old main platform — the kind of cache patrol mice keep as emergency supply, positioned below in case the overhead routes became inaccessible.",                                               food:5,wood:3,mats:0, morale:0, threat:0 },
        {w:2,type:"bad", title:"Nothing Left",            lore:"Just old rope and wind.",                                                                                                                                                                                           food:0,wood:0,mats:0, morale:0, threat:0 },
      ],
    },
  },
  {
    id:"C3", name:"Forest Clearing Boulder", danger:false, chain:null, fluff:false,
    desc:{
      calm:"An enormous lichen-covered boulder marked with traces of small fires. Fireflies gather here at night.",
      disturbed:"The lichen has been scraped. Someone read it recently.",
      corrupted:"The boulder stands alone. No fireflies.",
    },
    safe:{
      calm:"Your scouts sketch the lichen-letter patterns.",
      disturbed:"Fresh scrape marks.",
      corrupted:"Just a rock.",
    },
    outcomes:{
      calm:[
        {w:2,type:"good",title:"Lichen Map Decoded",      lore:"The markings constitute a record of the garden that predates any map in Willowroot's collection. Three cache locations not previously known. Two danger zones confirmed.",                                             food:0,wood:0,mats:5, morale:0,  threat:-2},
        {w:2,type:"good",title:"Firefly Guidance",        lore:"One firefly stopped — hovering, pulsing its small cold light — over a crack in the boulder's base the scouts had not noticed. The crack contained seeds, cold and dry and perfectly preserved.",                      food:7,wood:0,mats:0, morale:0,  threat:0 },
        {w:1,type:"bad", title:"Ritual Interrupted",      lore:"Six mice in grey-dyed robes. The eldest made a gesture that was clearly dismissal rather than threat. The scouts left.",                                                                                              food:0,wood:0,mats:0, morale:-6, threat:2 },
      ],
      disturbed:[
        {w:2,type:"good",title:"Second Reading",          lore:"The new inscription is scratched in a different style — simpler, more urgent. Someone had come to the boulder recently to add new information to an old document.",                                                    food:4,wood:0,mats:0, morale:0,  threat:-1},
        {w:1,type:"bad", title:"Rivals",                  lore:"The grey-robed mice again. Less patient this time.",                                                                                                                                                                 food:0,wood:0,mats:0, morale:-5, threat:2 },
      ],
      corrupted:[
        {w:1,type:"good",title:"Final Inscription",       lore:"One last thing scratched in the stone, at the very base. A single symbol and below it, in plain script, two words. The Clever mouse copied them exactly. She has not shared what they said.",                          food:0,wood:0,mats:0, morale:5,  threat:0 },
        {w:2,type:"bad", title:"Empty Clearing",          lore:"Just lichen and old ash.",                                                                                                                                                                                           food:0,wood:0,mats:0, morale:0,  threat:0 },
      ],
    },
  },

  // ── FLUFF LOCATIONS ────────────────────────────────────────────────────────
  {
    id:"FL1", name:"The Cracked Flowerpot", danger:false, chain:null, fluff:true,
    desc:{
      calm:"A terracotta pot lies on its side, split clean through. Someone scratched a tiny map into the inner wall — faded now, but the mice trace it with their paws anyway.",
      disturbed:"The pot has been moved slightly. Fresh soil around the crack.",
      corrupted:"The pot is gone. Only the indentation remains.",
    },
    safe:{
      calm:"The scouts sit inside the cool shade for a while.",
      disturbed:"Something moved this.",
      corrupted:"Nothing left to see.",
    },
    outcomes:{
      calm:[
        {w:3,type:"fluff",title:"A Quiet Lunch",          lore:"The scouts ate their seeds inside the cool curve of the pot and watched a beetle walk past. It was moving with great purpose in a direction that had no obvious destination. One scout tracked it with her eyes until it disappeared around the curve of the rim. Nobody spoke. Nothing happened. It was, somehow, exactly what was needed.",food:0,wood:0,mats:0,morale:3,threat:0},
        {w:1,type:"fluff",title:"The Map on the Wall",    lore:"One scout spent a long time tracing the scratched lines with the tip of her claw. The lines were deliberate — not random scoring, but something considered, made over time by someone who kept coming back to add details. She made a copy on bark. It doesn't match any place any of them know. The copy is pinned to the burrow wall. Several mice have added question marks.",food:0,wood:0,mats:0,morale:2,threat:0},
      ],
      disturbed:[
        {w:2,type:"fluff",title:"Someone Was Here",       lore:"Fresh soil disturbance. The scouts look around, find nothing, and go home with the uneasy feeling of having just missed something.",food:0,wood:0,mats:0,morale:0,threat:0},
      ],
      corrupted:[
        {w:1,type:"fluff",title:"Just the Indentation",   lore:"A pot-shaped shadow in the dry earth. Already the grass begins to grow across it.",food:0,wood:0,mats:0,morale:0,threat:0},
      ],
    },
  },
  {
    id:"FL2", name:"The Rusted Compass", danger:false, chain:null, fluff:true,
    desc:{
      calm:"Half-buried under the garden wall, enormous and red with age. Its needle still trembles when you touch it.",
      disturbed:"Something has disturbed the soil around the compass.",
      corrupted:"The compass is gone. Only a rust-stain in the earth.",
    },
    safe:{
      calm:"The scouts observe the trembling needle for a while.",
      disturbed:"Something was here before your scouts.",
      corrupted:"Nothing but a red shadow.",
    },
    outcomes:{
      calm:[
        {w:2,type:"fluff",title:"The Needle Points",      lore:"Wherever you turn it, the needle finds north. The casing is eaten through with rust, the glass face cracked into three pieces held in place by nothing but habit, and yet the needle trembles and settles, always arriving at the same place. The scouts debated whether north is important. They did not resolve this.",food:0,wood:0,mats:0,morale:4,threat:-1},
        {w:2,type:"fluff",title:"The Weight of It",       lore:"One scout tried to lift a corner. She put her whole back into it and the compass did not move at all, not even slightly, as if it were part of the earth rather than resting on it. They sat around it in the afternoon sun, thinking in the particular way that heavy immovable things make you think — about scale, about permanence, about what it means to be the size they are in a world built so much larger.",food:0,wood:0,mats:0,morale:5,threat:0},
      ],
      disturbed:[
        {w:2,type:"fluff",title:"Someone Else Knows",     lore:"Other mice have been here. The paw prints are deliberate. Someone marks this place.",food:0,wood:0,mats:0,morale:0,threat:0},
      ],
      corrupted:[
        {w:1,type:"fluff",title:"Taken or Lost",          lore:"Only the rust-stain remains. The compass is gone.",food:0,wood:0,mats:0,morale:-2,threat:0},
      ],
    },
  },
  {
    id:"FL3", name:"The Glass Marble Garden", danger:false, chain:null, fluff:true,
    desc:{
      calm:"Someone left a scatter of glass marbles across the garden path. From mouse height, it is like being in a cathedral.",
      disturbed:"Some of the marbles have been moved, arranged in a deliberate pattern.",
      corrupted:"The marbles are gone. Only circular impressions remain.",
    },
    safe:{
      calm:"Your scouts walk among the marbles and come home talking about the light.",
      disturbed:"The pattern is deliberate. But who arranged it is unclear.",
      corrupted:"The marbles are gone.",
    },
    outcomes:{
      calm:[
        {w:3,type:"fluff",title:"Cathedral Light",        lore:"The light came through the marbles and broke into colours that had no business being in an autumn garden. The scouts stood in the coloured shadows without speaking for longer than any of them admitted to afterward. Coming home, two of them started small arguments with each other — the kind that only happen when you feel, briefly, that things are more beautiful than you know how to hold.",food:0,wood:0,mats:0,morale:6,threat:0},
        {w:1,type:"fluff",title:"One Marble Brought Home",lore:"Small enough to roll, just barely, if four mice pushed together. Large enough to catch every colour in the garden and hold them simultaneously. It now sits in a small hollow beside the burrow entrance. Every mouse who passes it glances at it. Nobody has yet been able to explain to anyone else what exactly they are looking at, or why it matters. It does, though.",food:0,wood:0,mats:1,morale:3,threat:0},
      ],
      disturbed:[
        {w:2,type:"fluff",title:"The Pattern",            lore:"Concentric rings, a gap at the north, three marbles set apart. The scouts sketch it. Nobody can agree what it means.",food:0,wood:0,mats:0,morale:2,threat:0},
      ],
      corrupted:[
        {w:1,type:"fluff",title:"Ordinary Path",          lore:"Just soil and old footprints. The beauty has moved on, wherever beauty goes.",food:0,wood:0,mats:0,morale:-1,threat:0},
      ],
    },
  },
  {
    id:"FL4", name:"The Boot Graveyard", danger:false, chain:null, fluff:true,
    desc:{
      calm:"Three enormous boots lie discarded near the shed. Inside the largest, an abandoned nest of dried grass and feathers.",
      disturbed:"One of the boots has been moved. Something used it recently.",
      corrupted:"The boots are gone.",
    },
    safe:{
      calm:"Your scouts explore the outside carefully.",
      disturbed:"The moved boot has recent signs.",
      corrupted:"Three pale rectangles in the grass.",
    },
    outcomes:{
      calm:[
        {w:2,type:"fluff",title:"The Empty Nest",         lore:"Inside the largest boot, the abandoned nest was built with care — dandelion fluff, a scrap of something woven, three tiny feathers shaped into a perfect bowl. The scouts sat inside the leather smell for a long while, in the particular quiet of a space made for comfort that no longer holds anyone. Whoever built this was trying, was trying very hard, and then was gone.",food:0,wood:0,mats:0,morale:4,threat:0},
        {w:2,type:"fluff",title:"The Lace Tunnel",        lore:"A bootlace trails from the mouth of the middle boot across the path and into the grass. End to end it is longer than three burrows laid in a line. The scouts walked its entire length, single file, following the white cord through the grass as if it were a road. At the far end they stood and looked back at the boots, which were now very distant. For a few minutes they were explorers who had crossed a significant distance. The feeling faded on the way back, as feelings do, but not entirely.",food:0,wood:0,mats:0,morale:5,threat:-1},
      ],
      disturbed:[
        {w:2,type:"fluff",title:"Signs of Use",           lore:"Something slept here recently. The scouts note the approximate size of whatever it was.",food:0,wood:0,mats:0,morale:0,threat:1},
      ],
      corrupted:[
        {w:1,type:"fluff",title:"The Pale Rectangles",    lore:"The grass beneath the boots had gone yellow. Three pale footprints in the lawn. The world keeps changing whether you are ready for it or not.",food:0,wood:0,mats:0,morale:-2,threat:0},
      ],
    },
  },
  {
    id:"FL5", name:"The Singing Wire", danger:false, chain:null, fluff:true,
    desc:{
      calm:"A length of wire vibrates in the wind and produces a faint continuous tone. The mice who sit near it often end up humming something they can't identify.",
      disturbed:"The wire has gone slack. It no longer sings.",
      corrupted:"The wire is gone.",
    },
    safe:{
      calm:"Your scouts sit near the wire for a while, listening.",
      disturbed:"The silence where the singing was feels like something missing.",
      corrupted:"Just an empty stretch of garden.",
    },
    outcomes:{
      calm:[
        {w:3,type:"fluff",title:"The Wire's Song",        lore:"The wire produces a tone so faint you can only hear it if you stop moving entirely and wait. Three scouts sat beside it for most of an afternoon. By the time they came home they had composed, between them and without formally deciding to, a small melody. By evening, after supper, one of them hummed it. By the following morning everyone in the burrow knew it, the way things spread when nobody is quite paying attention.",food:0,wood:0,mats:0,morale:8,threat:0},
        {w:1,type:"fluff",title:"The Frequency",          lore:"The Clever mouse discovered it by accident — a point, exactly halfway along, where touching the wire with one claw at precisely the right pressure made the two beetles nearest to her stop completely. They stood motionless for several seconds. When she lifted her claw they resumed. She repeated the experiment four times. She has not yet told anyone what she might do with this information. She is thinking about it carefully.",food:0,wood:0,mats:0,morale:3,threat:-1},
      ],
      disturbed:[
        {w:2,type:"fluff",title:"Gone Slack",             lore:"Something pulled the wire loose. The silence is worse than the sound was.",food:0,wood:0,mats:0,morale:-2,threat:0},
      ],
      corrupted:[
        {w:1,type:"fluff",title:"Taken",                  lore:"The wire is gone. Whatever song it knew, it has taken with it.",food:0,wood:0,mats:0,morale:-3,threat:0},
      ],
    },
  },
];

// Hex positions for the map
export const LOC_HEXES = {
  "E7":{c:4,r:3},"D3":{c:3,r:2},"G7":{c:6,r:4},"J7":{c:7,r:5},
  "A3":{c:1,r:1},"A7":{c:1,r:3},"C5":{c:2,r:4},"H7":{c:7,r:2},
  "D7":{c:3,r:5},"FL1":{c:5,r:1},"FL2":{c:8,r:3},"FL3":{c:0,r:5},
  "FL4":{c:2,r:6},"FL5":{c:6,r:2},"B4":{c:1,r:5},"B7":{c:4,r:6},
  "C3":{c:5,r:5},
};
