// Building guides. DRAFTS written from general construction knowledge: the studio (and a structural
// engineer, for the technical ones) reviews every guide before it is published.
//
// Body format: an array of strings. Each string is one block:
//   "## Heading"  -> H2
//   "- item"      -> list item (consecutive items form one list)
//   "> text"      -> highlighted tip line
//   anything else -> paragraph
// All blocks render as plain text (no HTML), so never put markup in them.

export const GUIDE_CATEGORIES = ["Materials", "Design", "Planning"] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  category: GuideCategory;
  readMinutes: number;
  related: string[];
  body: string[];
  draft: true;
};

type GuideInput = Omit<Guide, "readMinutes">;

/** Words in the readable text of a body (markers like "## " and "- " are not counted). */
export function bodyWordCount(body: string[]): number {
  return body
    .map((b) => b.replace(/^(## |- |> )/, ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Reading time at about 200 words a minute, never less than 1. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

const inputs: GuideInput[] = [
  {
    slug: "concrete-grades-and-curing",
    title: "Concrete grades and curing: what the numbers mean",
    excerpt:
      "What M20 and M25 mean, which grade goes in which part of a house, and why curing in a Gujarat summer matters as much as the mix.",
    category: "Materials",
    related: ["steel-and-reinforcement-basics", "planning-your-house-budget"],
    draft: true,
    body: [
      "Concrete is ordered by grade, and the grade is written on your structural drawings. Knowing what it means lets you check that what arrives on site is what the engineer designed.",
      "## What the grade means",
      "The letter M stands for mix and the number is the strength the concrete is designed to reach at 28 days, in N/mm² (newtons per mm squared), tested on standard cubes. M20 means a characteristic compressive strength of 20 N/mm². Higher number, stronger concrete.",
      "## Which grade goes where",
      "M10 and M15 are lean mixes, commonly used as a levelling layer under footings and floors. Their job is to give a clean, flat base, not to carry the building.",
      "M20 is the usual grade for the structure of an ordinary house: footings, columns, beams and slabs. Indian Standard IS 456 sets M20 as the lowest grade for reinforced concrete in mild exposure. M25 and above is common for longer spans, taller buildings, or where concrete is exposed to moisture, salts or weather.",
      "The structural engineer chooses the grade for each element. If the drawing says M25 for the columns, M20 is not an acceptable saving.",
      "## The mix, and why water is the enemy",
      "Concrete is cement, sand, stone aggregate and water. Strength depends mostly on the ratio of water to cement. More water makes the mix easy to pour and makes the hardened concrete weaker and more porous. On site, workers add water because a stiff mix is hard to place. The correct answer to a stiff mix is a plasticiser or better compaction, not a bucket of water.",
      "Small jobs are sometimes mixed on site to a fixed proportion, called a nominal mix. For M20 the proportion commonly quoted is 1 part cement, 1.5 parts sand and 3 parts aggregate by volume. A designed mix, or ready-mix concrete from a batching plant, is more consistent and is the better choice for slabs and anything structural, because the quantities are weighed rather than guessed with a pan.",
      "Concrete also needs compacting. Vibrating it, or at least rodding it well, drives out trapped air. Honeycombing (hollow, stony patches on a column face when the shuttering comes off) usually means poor compaction.",
      "## Curing: keeping the concrete wet",
      "Cement gains strength through a chemical reaction with water, not by drying out. If the surface dries early the reaction stops near the surface, the top layer turns weak and dusty, and shrinkage cracks appear. Curing simply means keeping the concrete damp, and not too hot, while it gains strength.",
      "Start once the surface is hard enough not to be marked, usually the next day. Slabs can be ponded with a shallow layer of water inside small earth bunds, or covered with wet sand or hessian. Columns and walls are wrapped in wet hessian or sprayed often. Himatnagar summers dry the surface very quickly, so on a hot or windy day the wetting must be frequent, including early morning and evening, not once and done.",
      "IS 456 asks for at least 7 days of curing for ordinary Portland cement, and at least 10 days where the weather is hot and dry or where blended cement is used. Concrete commonly reaches about two thirds of its strength in the first week and its design strength at 28 days. Curing compounds sprayed on the surface exist, but they are not a reason to skip wetting without your engineer agreeing.",
      "Pouring time matters too. In summer, pour early in the morning or in the evening, not in the midday sun. In the monsoon, cover fresh concrete from heavy rain, because rain washes cement out of the surface.",
      "## Common mistakes",
      "- Adding water on site to make pouring easier.",
      "- Stopping curing after two or three days because the surface looks hard.",
      "- Removing shuttering early. The time before removal depends on the element and the cement, so follow the engineer's instruction.",
      "- Mixing by the shovelful with no measuring box, so the proportion changes from batch to batch.",
      "- Using the same grade everywhere because it is simpler, or a lower grade than drawn.",
      "## Questions to ask your builder or architect",
      "- Which grade is drawn for the footings, columns, beams and slab, and is that what you will use?",
      "- Is the mix measured by weight, by volume with a gauge box, or bought as ready-mix?",
      "- Will test cubes be cast and tested at 28 days, and may I see the results?",
      "- Who is responsible for curing, for how many days, and how will it be done on weekends and festivals?",
      "> This is a general guide, not a design. Confirm grades, curing period and shuttering removal times with your structural engineer and the rules of the local authority.",
    ],
  },
  {
    slug: "choosing-bricks-and-blocks",
    title: "Choosing bricks and blocks for walls",
    excerpt:
      "Clay bricks, fly ash bricks, AAC blocks and concrete blocks compared in plain language: weight, heat, workmanship and where each fits.",
    category: "Materials",
    related: ["designing-for-heat-and-ventilation", "concrete-grades-and-curing"],
    draft: true,
    body: [
      "Walls in most homes are built from one of four materials. None is best everywhere. The choice depends on whether the wall carries load, how hot the rooms get, your budget and what local masons build well.",
      "## Load-bearing or infill?",
      "Ask this first. In a framed house, the columns and beams carry the weight and the walls only fill the gaps between them. These infill walls can be light. In a small load-bearing house, the walls themselves carry the floors and roof, so the material must be strong and the design must be done accordingly. Most new houses in towns like Himatnagar are framed, which gives you more freedom.",
      "## Burnt clay bricks",
      "The traditional red brick. Masons know them well and they are widely available. Quality varies a lot between kilns, so check that bricks are well burnt (they ring when two are tapped together), even in shape and free of cracks and lumps of lime. Indian Standard IS 1077 grades common burnt clay bricks by compressive strength. Soak bricks in water before laying so they do not pull the water out of the mortar. Clay brick walls are heavy and usually need a thick plaster coat to get a flat finish.",
      "Some bricks carry salts that appear later as white powdery patches on the plaster, called efflorescence. A reputable kiln and a damp-proof course at plinth level reduce the risk.",
      "## Fly ash bricks",
      "Made from fly ash (a by-product of power stations), sand or stone dust, and cement or lime. They are more uniform in size than clay bricks, so walls need less mortar and plaster. They are covered by IS 12894. They must be kept damp after laying and should not be used straight out of the factory while still very fresh.",
      "## AAC blocks",
      "Autoclaved aerated concrete blocks are much lighter than clay brick and are full of tiny air pockets that slow the passage of heat, so rooms stay somewhat cooler in summer. They are large and accurate, so a wall goes up quickly. They suit non-load-bearing infill and partition walls in a framed building. They need the correct thin-bed adhesive or mortar, plaster made for the material, and proper fixings for heavy loads such as wall cabinets and television brackets. They absorb water, so keep them dry on site during the monsoon and protect external faces with suitable plaster and paint.",
      "## Concrete blocks",
      "Solid or hollow blocks of cement and aggregate. They are strong and regular and can be used in load-bearing walls where the design allows. They are heavier than AAC and pass more heat. Hollow blocks save material and weight, but in some designs the hollows are reinforced and filled, which needs specific instruction from the engineer.",
      "## Quick comparison",
      "- Clay brick: familiar, heavy, quality varies by kiln.",
      "- Fly ash brick: regular size, less plaster, needs curing like masonry.",
      "- AAC block: light and better against heat, for infill walls, needs the right adhesive and plaster.",
      "- Concrete block: strong, heavy, can be load-bearing when designed for it.",
      "## Workmanship counts as much as material",
      "Joints should be staggered, every joint fully filled with mortar, courses level, and the wall kept damp for a few days after building. Mortar for brick walls is commonly mixed around 1 part cement to 6 parts sand, but your engineer or the block manufacturer's instructions govern. Walls above openings need lintels, and walls meeting columns need proper ties.",
      "## Common mistakes",
      "- Using clay-brick methods, such as wet bricks and thick sand-cement mortar, on AAC blocks.",
      "- Chasing deep grooves into walls for pipes after they are built, which weakens them.",
      "- Mixing different materials in one wall without a plan for the junction, which tends to crack.",
      "- Choosing on price per brick without allowing for mortar, plaster and labour that a different size saves or adds.",
      "## Questions to ask your builder or architect",
      "- Is the wall load-bearing or infill in my design?",
      "- Can I see a finished wall in this material, and the supplier's test report?",
      "- What mortar or adhesive and what plaster go with it?",
      "- How will the wall be protected in the monsoon while it is being built?",
      "> This is a general guide. Confirm the material against your drawings and your structural engineer's advice.",
    ],
  },
  {
    slug: "steel-and-reinforcement-basics",
    title: "Steel and reinforcement basics for your house",
    excerpt:
      "What Fe 500 steel means, what cover and bar spacing do, and what to look at on site before the concrete is poured over it.",
    category: "Materials",
    related: ["concrete-grades-and-curing", "choosing-bricks-and-blocks"],
    draft: true,
    body: [
      "Concrete is strong when squeezed and weak when pulled or bent. Steel bars inside it take the pulling. The bars are hidden for ever once the concrete is poured, so the time to check them is the day before the pour.",
      "## What the steel grade means",
      "Modern reinforcement is TMT bars (thermo-mechanically treated), covered by Indian Standard IS 1786. You will see grades such as Fe 500 and Fe 500D. The number is the yield strength in N/mm², so Fe 500 yields at around 500 N/mm². The letter D marks a more ductile steel, which stretches before breaking and is valued in earthquake-prone regions. Gujarat has a history of strong earthquakes, so ask your engineer which grade the design assumes and use that grade.",
      "Bars are described by diameter in millimetres: commonly 8 and 10 mm for stirrups and slab bars, and 12, 16 and 20 mm for main bars in beams and columns. The drawing gives the diameter and the number of bars for every member.",
      "## What a good bar looks like",
      "Genuine TMT bars have the manufacturer's mark and grade rolled into the surface at regular intervals, uniform ribs, and a clean surface. Ask the supplier for the mill test certificate. If you doubt the diameter, measure with a vernier caliper. A thin layer of light rust is commonly accepted, but flaking, scaly rust or bars coated in mud and oil should be cleaned or rejected.",
      "Store bars off the ground on timber supports and cover them from rain. In the monsoon, steel left in wet mud rusts quickly.",
      "## Cover: keeping steel inside the concrete",
      "Cover is the thickness of concrete between the bar and the outside face. It protects the steel from moisture and fire. For mild exposure, cover is commonly around 20 to 25 mm in slabs and beams, around 40 mm in columns and around 50 mm in footings, but the drawing governs. Cover is kept using small concrete or plastic cover blocks tied to the bars. Bars resting directly on the shuttering will rust and the concrete will crack and flake in a few years.",
      "## Spacing, stirrups and laps",
      "Stirrups are the small loops tied around main bars in beams and columns. They resist shear and hold the main bars in place. Near the ends of beams and columns they are usually drawn closer together, which matters for earthquake resistance. Do not let the bar-bender space them evenly to save time.",
      "Where one bar must be joined to the next, they overlap by a length called the lap, which the engineer specifies, and laps are staggered rather than all placed at one section. Bars are tied with binding wire, and bends should be made cold with proper tools. TMT bars should not be heated and re-bent on site, because heat can destroy their strength. Do not cut a bar to make something fit without asking.",
      "## Checking before the pour",
      "Walk the slab with the drawing. Count bars, check diameters, cover blocks, stirrup spacing and the extra top bars over supports in slabs and beams. Your engineer or a competent site supervisor should approve the steel before concreting begins, and the photographs are worth keeping.",
      "## Common mistakes",
      "- Replacing bars with a different diameter because it is on hand.",
      "- Too few cover blocks, so bars sag against the shuttering.",
      "- Walking on slab steel and bending the top bars down.",
      "- Leaving the electrician or plumber to cut through bars for conduits.",
      "- Pouring before anyone has checked the steel.",
      "## Questions to ask your builder or architect",
      "- Which steel grade is drawn, and what markings should I see rolled into the bars?",
      "- Can I see the supplier's test certificate for this lot?",
      "- Will the engineer check the steel before every major pour?",
      "- What cover blocks and what cover does the drawing require?",
      "> This is a general guide, not a design. Bar sizes, spacing, laps and cover must come from your structural engineer's drawings and the applicable Indian Standards.",
    ],
  },
  {
    slug: "timber-and-plywood-for-interiors",
    title: "Timber and plywood for interiors: what to use where",
    excerpt:
      "Solid wood, MR and BWP plywood, blockboard, MDF and HDHMR: which material suits wardrobes, kitchens and doors, and what to check before buying.",
    category: "Materials",
    related: ["flooring-and-tiles-for-hot-climates", "planning-your-house-budget"],
    draft: true,
    body: [
      "Most interior carpentry in a home is built from a handful of materials. Matching the material to the room, especially to the moisture it will see, avoids swollen panels and peeling edges a few years later.",
      "## Solid timber",
      "Solid wood such as teak or sal is used for door frames, doors and furniture where strength and appearance matter. It must be properly seasoned (dried) before use, or it will warp and split as it dries in place. Even seasoned timber moves a little with the seasons, so joints and finishes should allow for that. Timber frames are normally treated against termites, and the frame should not sit directly on damp masonry.",
      "## Plywood grades",
      "Plywood is thin layers of wood glued crosswise, which makes it stable and strong. The glue decides where it can be used. MR (moisture resistant) plywood suits dry rooms such as bedroom wardrobes and living room units. BWR (boiling water resistant) and BWP (boiling waterproof) use better glue and suit kitchens and humid areas. Indian Standard IS 303 covers commercial plywood and IS 710 covers marine plywood. No plywood is permanently waterproof: standing water and unsealed edges damage every grade.",
      "## Blockboard, MDF and HDHMR",
      "Blockboard has a core of wood strips between veneers and is good for long shelves and doors because it stays flat. MDF is made from fine wood fibre, has a smooth face that takes paint well and suits decorative and routed work, but it swells if wet. HDHMR (high density, high moisture resistance) board is denser than ordinary MDF and is increasingly used for kitchen and wardrobe carcasses where humidity is a concern.",
      "## Matching material to room",
      "- Bedroom wardrobes and drawing room units: MR plywood or blockboard, with laminate or veneer.",
      "- Kitchen base units: BWR or BWP plywood or HDHMR, with sealed edges. Keep chipboard and plain MDF away from the sink.",
      "- Cupboards next to bathrooms: BWP plywood, or a non-timber material where splashes are likely.",
      "- Doors and frames: well-seasoned solid timber, or engineered alternatives chosen on your designer's advice.",
      "## Surface finishes",
      "Laminates, veneers and paint protect and decorate the board. Laminate is hard wearing and easy to clean. Veneer gives a real wood look and can be polished. On any board, seal the cut edges, because moisture enters mostly through edges and backs. Edge banding on visible edges and a sealed back panel are signs of careful work.",
      "## Hardware and joinery",
      "A wardrobe door opens and shuts thousands of times a year. Good hinges, soft-close fittings if you want them, and full-extension drawer channels carry that load, and the screws need solid board to grip. Thin or hollow boards hold screws badly. Ask where heavier items such as a microwave shelf or a loft will rest and make sure the board and fixings are chosen for that weight, not just for the look.",
      "## The dry-air side of Himatnagar",
      "Dry summers pull moisture out of wood and can open joints and cracks in solid timber, while monsoon humidity makes boards swell. Boards that are sealed on all faces and edges cope with both. Air-conditioned rooms add a swing between cool and hot, so avoid fixing panels tightly with no room to move.",
      "## Common mistakes",
      "- Using MR plywood in a kitchen because it is cheaper to start with.",
      "- Leaving cut edges and drilled holes unsealed.",
      "- Choosing hinges and drawer channels last. Poor hardware ruins good carpentry.",
      "- Accepting a sheet without checking the marking and thickness printed on the sheet in front of you.",
      "## Questions to ask your builder or architect",
      "- Which board, which grade and which thickness is quoted for each unit?",
      "- Is every sheet delivered marked with the standard and the manufacturer?",
      "- How are edges sealed, and is the back covered?",
      "- Which hinges and channels will be fitted and what warranty applies?",
      "> This is a general guide. Your interior designer will recommend materials for each room and the way you use it.",
    ],
  },
  {
    slug: "flooring-and-tiles-for-hot-climates",
    title: "Flooring and tiles for hot, dry climates",
    excerpt:
      "Vitrified, ceramic, stone and terrace finishes compared for heat, slip and upkeep, with the fixing details that decide how long a floor lasts.",
    category: "Materials",
    related: ["designing-for-heat-and-ventilation", "timber-and-plywood-for-interiors"],
    draft: true,
    body: [
      "A floor is the surface you touch every day and the one most expensive to redo. In a hot climate it also affects how cool the house feels. Choose by room, not one tile for the whole house.",
      "## The main options",
      "Vitrified tiles are dense, hard and absorb very little water. They come in many finishes, are easy to clean and are the most common choice for living areas. Polished vitrified tiles turn slippery when wet, so choose a matt or textured surface for entrances, balconies and anywhere water gets in.",
      "Ceramic tiles are lighter and less dense. They are fine for walls and for floors with light use, such as bedrooms, but are more easily chipped.",
      "Natural stone such as Kota stone, granite and marble brings variation and often feels cooler underfoot. Kota stone is a durable choice in hot regions and can be polished or left with a honed finish. Marble is softer, stains from acids like lemon and some cleaners, and needs more care. Stone should be sealed as advised for the type.",
      "## Heat and the floor",
      "Dense tile and stone stay cool in summer, which is a real advantage in a hot dry place. Dark floors in a room that gets direct sun through glass will warm up and hold the heat. Light colours reflect more. Shade the windows first, as the design guide on heat explains, because a floor in the sun is always going to be warm.",
      "## Terraces and balconies",
      "The roof takes the hardest sun. A light-coloured, heat-reflective finish on the terrace, over properly laid waterproofing, reduces the heat that comes into the rooms below. Terrace tiles must have joints that are sealed and a slope towards drains. Water that cannot leave will find a way through the slab.",
      "## Bathrooms and wet areas",
      "Waterproofing goes under the tiles, not instead of them. Treat the floor and the lower part of the walls, then flood the area and leave it for 24 to 48 hours as is commonly done. Check the ceiling below for dampness before anyone lays a single tile. Use anti-skid tiles, and make sure the floor slopes gently to the drain.",
      "## Fixing matters as much as the tile",
      "- The base should be level, clean and cured.",
      "- Large format tiles need a full bed of adhesive, not a few blobs, otherwise they sound hollow and crack. Tap the tile to listen.",
      "- Leave joints of a consistent width and fill them with suitable grout. Tight, hairline joints invite cracking.",
      "- In large floors and where floors meet walls, leave movement joints as your designer shows.",
      "- Keep people off the floor for as long as the adhesive maker recommends before anyone walks on it.",
      "## Ordering",
      "Order all the tiles for a room together, from the same batch, so shade and size match. Buy extra, commonly 5 to 10 per cent, for cuts and for future repairs, and store a few boxes. Lines in a pattern should be set out before work starts, so cut tiles fall in the least noticeable places.",
      "## Common mistakes",
      "- Polished tiles on the entrance steps that get wet in the monsoon.",
      "- Skipping the water test in bathrooms.",
      "- Laying tiles on a base that has not cured, so it cracks.",
      "- Buying the last boxes from a different batch halfway through.",
      "## Questions to ask your builder or architect",
      "- Which finish is meant for each room, and is it anti-skid where needed?",
      "- What adhesive and what joint width will be used?",
      "- When will the waterproofing be tested, and may I see it?",
      "- Do we have spare tiles stored for repairs?",
      "> This is a general guide. Confirm products and fixing details with your designer, and follow the manufacturer's instructions for each tile.",
    ],
  },
  {
    slug: "designing-for-heat-and-ventilation",
    title: "Designing a house for heat and ventilation in North Gujarat",
    excerpt:
      "How orientation, shade, roofs and cross-ventilation keep a house in Himatnagar cooler before you need an air conditioner.",
    category: "Design",
    related: ["choosing-bricks-and-blocks", "flooring-and-tiles-for-hot-climates"],
    draft: true,
    body: [
      "Himatnagar has hot, dry summers, a short humid monsoon and cool nights for much of the year. A house that responds to this climate stays comfortable with far less electricity. Most of the decisions are made on the drawing board, when they cost nothing.",
      "## Start with the sun",
      "The sun is the main source of heat. In summer the harshest sun in the afternoon comes from the west. Where you can, keep the long sides of the house facing north and south and keep large windows off the west. Put rooms used less in the daytime, such as storage, bathrooms and stairs, on the west side as a buffer. East light in the morning is gentler, which suits bedrooms and kitchens.",
      "Plot shape and road side often limit this. Do not give up the whole plan, because shading can fix many problems.",
      "## Shade the openings",
      "Shade blocks heat before it enters, which is far better than trying to remove it afterwards. A projection over the window, called a chhajja, a deep verandah, a jali screen or a tree on the west side all help. A projection shields the high summer sun and still lets in the lower winter sun. Glass that sits in direct sun gets very hot, so keep west glass small and shaded.",
      "## The roof",
      "The roof gets the most sun, and the rooms immediately below feel it. Helpful measures include a light-coloured reflective terrace finish, insulation or a layer of air above the slab, and shading part of the terrace. Ask your designer about the roof build-up early, since it is hard to alter later.",
      "## Walls",
      "A thicker wall, a cavity wall or a material that slows heat, such as AAC blocks, delays the heat reaching the inside. Light external colours reflect more heat than dark ones.",
      "## Cross-ventilation",
      "Moving air makes a room feel cooler. For air to flow through a room it needs an opening on the side facing the breeze and another on a different wall to leave, ideally on opposite or adjacent walls. A room with openings on only one wall ventilates poorly. As a very rough rule of thumb, openable window area is often planned at least around one tenth to one twentieth of the floor area. Hot climates benefit from more, and the local building rules state the minimum, so confirm them with the authority.",
      "High openings, such as ventilators near the ceiling, let hot air rise out. A staircase or courtyard can act as a vent for the whole house. Interior doors that can stay open, or have vents above them, keep air moving.",
      "## Open at night, close by day",
      "In hot dry climates the night is cooler than the day. Open windows in the evening to flush out the heat and cool the structure, and close and shade them during the hottest hours. Windows must be safe to leave open at night, with grilles and insect mesh. With farmland around, mosquito mesh is not optional.",
      "## Courtyards, plants and water",
      "A small courtyard or planted verandah brings in light and lets hot air escape. Trees on the west and south side cast shade, and a planted terrace corner or water feature cools the air a little. Choose trees with care so roots stay away from foundations and drains.",
      "## Common mistakes",
      "- A large west-facing glass wall.",
      "- Windows on one wall only, or on two walls but blocked by a wardrobe.",
      "- Ignoring the roof and relying on an air conditioner alone.",
      "- Closing every opening in the monsoon so the house becomes damp and stuffy.",
      "## Questions to ask your builder or architect",
      "- Which way does each room face and how is the west sun handled?",
      "- How does the air enter and leave each bedroom?",
      "- What is on the roof to reduce heat?",
      "- Are windows shaded and protected from monsoon rain?",
      "> The figures here are rules of thumb. Confirm minimum window and ventilation areas with your architect and the local authority's building regulations.",
    ],
  },
  {
    slug: "planning-your-house-budget",
    title: "Planning your house budget before you build",
    excerpt:
      "How to split a house budget, what to settle before the first quotation, and how to keep changes and surprises from running the project off course.",
    category: "Planning",
    related: ["concrete-grades-and-curing", "timber-and-plywood-for-interiors"],
    draft: true,
    body: [
      "Most budget problems on a house do not come from rising prices. They come from decisions made late. The more you settle before work starts, the closer the final cost stays to the first estimate.",
      "## Start with the plot",
      "Before spending on design, have the plot checked. Confirm ownership documents, and if the land was farmland, confirm with the revenue office or local authority that it is permitted for residential use and what approvals are needed. Ask what the rules allow on the plot, such as how much you can build and how far from the boundary. A lawyer or experienced local professional should look at the papers.",
      "## Write down what the house must do",
      "Number of bedrooms, a ground-floor bedroom for elders, a shop or office space, parking, space for the family to grow, and whether you plan to add a floor later. A second floor planned from the start is cheaper than one added afterwards, because the footings and columns can be designed for it.",
      "## Split the budget into parts",
      "A house budget has more parts than the building itself:",
      "- Design, drawings and approval fees.",
      "- Structure: footings, columns, beams, slabs and walls.",
      "- Finishes: plaster, flooring, tiles, paint, doors and windows.",
      "- Services: electrical, plumbing, drainage and water storage.",
      "- Interiors: kitchen, wardrobes, furniture and lighting.",
      "- External work: compound wall, gate, paving and landscaping.",
      "- A contingency reserve.",
      "The structure is fairly fixed by the design. Finishes and interiors can swing widely, and they are where choices leave the budget behind. Decide your finish level for each room before you ask for quotes.",
      "## Get comparable quotations",
      "Ask two or three builders to quote on the same drawings and the same written specification: grade of concrete, grade of steel, type of block, tiles and fittings. A quote that is far lower often leaves things out or assumes cheaper materials. An itemised quotation lets you compare line by line. Ask what is excluded, and who pays for materials that run short or for rework.",
      "## Pay by stage",
      "Link payments to completed stages rather than dates, and keep a small amount back until the work is finished and defects are fixed. Keep every payment on record with a receipt. Put the agreement in writing with the scope, drawings, schedule and how changes are priced.",
      "## Keep a contingency",
      "Keep a reserve for the unexpected, commonly suggested at around 10 per cent of the total. Soil that needs deeper footings, a design change or a price shift in a material will use it. If you do not spend it, you have a pleasant surprise rather than an unfinished house.",
      "## Plan around the season",
      "Heavy rain slows excavation, brickwork and concreting, and a project that runs into the monsoon without cover will suffer. Planning the structure to be done and roofed before peak rain avoids damage and delays. Ordering windows, doors and tiles early avoids long waits at the end.",
      "## Common mistakes",
      "- Starting construction before drawings and specifications are final.",
      "- Changing the layout after the slab is poured. Moving a wall or a bathroom is expensive.",
      "- Accepting the lowest quote without reading what it leaves out.",
      "- Forgetting the services, compound wall and furniture.",
      "- Paying most of the money before most of the work.",
      "## Questions to ask your builder or architect",
      "- What exactly does this quotation include and exclude?",
      "- How will changes be priced and approved in writing?",
      "- What is the payment schedule by stage?",
      "- How long will each stage take, and what happens in the monsoon?",
      "- Who handles approvals and completion paperwork?",
      "> This guide contains no prices on purpose. Costs depend on the plot, design, materials and the market at the time, so get written quotations for your own drawings.",
    ],
  },
];

export const guides: Guide[] = inputs.map((g) => ({
  ...g,
  readMinutes: readingMinutes(bodyWordCount(g.body) + g.excerpt.split(/\s+/).length),
}));

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
