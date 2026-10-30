// Service page copy. The way of working described here is a DRAFT in general professional terms,
// for the owners to correct. No client names, prices, timelines, brands or figures are stated here
// (only the studio facts in lib/site.ts).
export type ServiceSlug = "architecture" | "interior" | "civil";

export type GuideSlug =
  | "concrete-grades-and-curing"
  | "choosing-bricks-and-blocks"
  | "timber-and-plywood-for-interiors"
  | "steel-and-reinforcement-basics"
  | "flooring-and-tiles-for-hot-climates"
  | "designing-for-heat-and-ventilation"
  | "planning-your-house-budget";

export type ApproachGroup = {
  title: "How we design" | "How we choose materials" | "How we advise you";
  points: { title: string; text: string }[];
};

export type Service = {
  slug: ServiceSlug;
  title: string;
  h1: string;
  /** Shown before the layout template adds " | Alvi Studio". */
  metaTitle: string;
  metaDescription: string;
  intro: string;
  offers: { title: string; text: string }[];
  process: { title: string; text: string }[];
  approach: ApproachGroup[];
  projects: { title: string; text: string }[];
  deliverables: string[];
  bring: string[];
  materials: { name: string; note: string; guide: GuideSlug }[];
  /** Headings that are different on every service page, so no heading repeats across the site. */
  headings: {
    approach: string;
    approachIntro: string;
    projects: string;
    deliverables: string;
    bring: string;
    materials: string;
    cta: string;
  };
  enquiryType: "architecture" | "interior" | "civil";
  draft: true;
};

export const services: Record<ServiceSlug, Service> = {
  architecture: {
    slug: "architecture",
    title: "Architecture",
    h1: "Architecture in Himatnagar",
    metaTitle: "Architects in Himatnagar: Plans, 3D, Supervision",
    metaDescription:
      "Architects in Himatnagar, Gujarat. Homes, farms and classrooms planned for heat and monsoon, with plans a builder can follow and honest cost advice.",
    intro:
      "A building starts as a plot, a budget and a way of living. We turn that into plans you can read, 3D views you can walk through before anything is built, and drawings a builder can follow without guessing. Hot summers, monsoon rain and the way your family really lives shape every layout.",
    offers: [
      {
        title: "Concept and layout",
        text: "Rooms, light, ventilation and movement planned around your family and your plot. You see how the house will live, not only how it will look, so the big decisions are made early and cheaply.",
      },
      {
        title: "Working plans",
        text: "Detailed drawings for foundations, walls, openings, services and finishes. The site team builds from paper and not from memory, which means fewer arguments and less rework.",
      },
      {
        title: "Approval drawings",
        text: "Plans prepared in the form the local authority asks for, with guidance on the permissions your building needs. You know what to submit and why before you start.",
      },
      {
        title: "3D views",
        text: "Exterior and interior views before construction. A wall in the wrong place is a mouse click on screen, but a broken wall on site.",
      },
      {
        title: "Structure coordination",
        text: "Your plan and the structural drawings are checked against each other, so columns do not land in the middle of a room and beams do not cut across a window.",
      },
      {
        title: "Site supervision",
        text: "Visits during construction to check that the building follows the drawings, and to answer the builder's questions quickly so work does not stall.",
      },
    ],
    process: [
      {
        title: "Brief and site visit",
        text: "We listen to how your family lives, see the plot and note the rules that apply to it. You bring your needs, your budget range and any plot papers you have.",
      },
      {
        title: "Concept options",
        text: "Simple layout sketches and a massing study, with the reasons behind each. You react to what you like and dislike, and decide which direction we develop.",
      },
      {
        title: "Plans and 3D views",
        text: "The chosen concept becomes floor plans, elevations and 3D views. You walk through them, ask for changes and sign off the design.",
      },
      {
        title: "Working drawings",
        text: "We issue the detailed drawings a builder needs: sizes, levels, openings, services and finishes. You confirm finishes and fittings so nothing is left open on site.",
      },
      {
        title: "Approval drawings",
        text: "We prepare the drawings for submission to the authority and explain what each sheet is for. You provide the ownership and plot documents the authority will ask for.",
      },
      {
        title: "Supervision",
        text: "We visit the site during construction, compare it with the drawings and answer questions from the builder. You approve any change before it is made, and we tell you what it does to the plan and the cost.",
      },
    ],
    approach: [
      {
        title: "How we design",
        points: [
          {
            title: "Start with the sun and the wind",
            text: "We check where the sun hits in the afternoon and where the breeze comes from before we place a single room. In Himatnagar's heat, a bedroom facing west costs you every summer.",
          },
          {
            title: "Plans a builder can follow",
            text: "Every dimension, level and opening is drawn and labelled. If a mason has to guess, the plan was not finished.",
          },
          {
            title: "Light and air in every room",
            text: "Windows, cross-ventilation, shaded verandas and a way for hot air to leave the house are part of the layout, not extras added later.",
          },
        ],
      },
      {
        title: "How we choose materials",
        points: [
          {
            title: "Suited to the climate",
            text: "Walls, roofs and openings are chosen for how they handle heat, monsoon damp and dust, not for what looks good in a brochure.",
          },
          {
            title: "Specified, not left open",
            text: "The drawings name the type and grade of material so the quote you receive compares like with like.",
          },
          {
            title: "Cost against life",
            text: "A cheaper material that needs repair every few years is not cheaper. We show you the choice with both sides of it.",
          },
        ],
      },
      {
        title: "How we advise you",
        points: [
          {
            title: "Cost against design, said plainly",
            text: "If a feature pushes the budget, we say so and show what it would cost you in other parts of the house. The decision stays with you.",
          },
          {
            title: "Reasons, not only answers",
            text: "When we recommend something, we explain why, so you can judge it yourself and talk to your builder with confidence.",
          },
          {
            title: "A no is part of the job",
            text: "If a plot, a budget or a wish does not work, we tell you early and offer another way.",
          },
        ],
      },
    ],
    projects: [
      {
        title: "Full house",
        text: "The plan has to suit a family for years, so we ask about daily routine, guests, elders and what may change later. Rooms can grow without breaking the layout.",
      },
      {
        title: "Renovation",
        text: "We measure what is there first. The design keeps what is sound, opens what is cramped and avoids touching load-bearing walls without checking.",
      },
      {
        title: "Tuition classes",
        text: "Daylight, fresh air, quiet and safe exits matter more than decoration. Layouts keep sightlines to the teacher clear and let noise stay out of the next room.",
      },
      {
        title: "Farm",
        text: "The plot is large and often away from services, so we plan water, power, shade and access first. The house sits where it gets breeze and stays out of the flood path.",
      },
    ],
    deliverables: [
      "Floor plans, elevations and sections you can read",
      "3D views of the exterior and key rooms",
      "Working drawings for the builder",
      "Approval drawings ready for submission",
      "A material and finish schedule",
      "Structural coordination notes for your engineer and builder",
      "Site visit notes while the building goes up",
    ],
    bring: [
      "Your plot papers and a rough site sketch, if you have them",
      "Who will live in the house, now and in a few years",
      "A budget range you are comfortable with",
      "Photos of houses you like and dislike",
      "Anything fixed, such as a tree, a well or a neighbour's wall",
      "The names of anyone who needs to agree to the design",
    ],
    materials: [
      { name: "Concrete", note: "Frame, slabs and footings. The right grade and proper curing matter more than extra thickness.", guide: "concrete-grades-and-curing" },
      { name: "Bricks and blocks", note: "They decide how hot the walls get and how well they take the monsoon. Choose by use, not by habit.", guide: "choosing-bricks-and-blocks" },
      { name: "Steel reinforcement", note: "It carries the pull in the frame, so size, spacing and cover are not places to save money.", guide: "steel-and-reinforcement-basics" },
      { name: "Shade and ventilation", note: "Not a material, but the cheapest way to keep a house cooler. Planned in at design stage.", guide: "designing-for-heat-and-ventilation" },
    ],
    headings: {
    approach: "Why the plan works before the walls go up",
    approachIntro: "Three habits behind every set of drawings.",
    projects: "Four kinds of building we plan",
    deliverables: "What lands in your hands",
    bring: "Bring these to the first meeting",
    materials: "Materials we plan around",
    cta: "Got a plot and an idea in Himatnagar?",
  },
  enquiryType: "architecture",
    draft: true,
  },
  interior: {
    slug: "interior",
    title: "Interior",
    h1: "Interior design in Himatnagar",
    metaTitle: "Interior Designers in Himatnagar: Homes and Shops",
    metaDescription:
      "Interior designers in Himatnagar, Gujarat. Space planning, storage, lighting and finishes for homes, shops and classrooms, with costs set out item by item.",
    intro:
      "A good room is planned before it is decorated. We start with how you use the space, then choose storage, light and finishes that fit your routine, your climate and your budget. You see the room and its cost on paper before the carpenter starts.",
    offers: [
      {
        title: "Space planning",
        text: "Furniture positions, walking paths and storage worked out on plan before anything is bought. A well-planned small room feels larger than a badly planned big one.",
      },
      {
        title: "Furniture and joinery",
        text: "Wardrobes, kitchens, TV units and seating drawn to the exact room, with sizes and finishes listed. The carpenter works from a drawing, so what arrives is what you approved.",
      },
      {
        title: "Lighting",
        text: "Ceiling, wall and task light layered so the room works by day and feels calm in the evening. Good lighting makes ordinary finishes look better.",
      },
      {
        title: "Materials and colour",
        text: "Flooring, wall finish, fabric and hardware chosen together and shown on a board before you commit. Choices are made as a set, so nothing clashes on delivery day.",
      },
      {
        title: "Kitchen and storage planning",
        text: "Work triangle, shelf heights and ventilation for the room that gets the hardest use. You get less bending, less clutter and a kitchen that stays easy to clean.",
      },
      {
        title: "Execution",
        text: "Carpenters, painters and electricians coordinated so the finished room matches the design, with problems found while they are still small.",
      },
    ],
    process: [
      {
        title: "Brief and measure",
        text: "We note how you live and measure the space. You tell us who uses each room, what annoys you now and what must not change.",
      },
      {
        title: "Layout and mood",
        text: "A furniture plan and a direction for material and colour. You approve the layout before we draw any detail.",
      },
      {
        title: "Detailed design",
        text: "3D views, joinery drawings and a lighting plan. You check sizes against your own belongings and request changes while they are free.",
      },
      {
        title: "Selection and estimate",
        text: "Finishes are chosen and the cost is set out item by item. You decide what to spend on and what to simplify.",
      },
      {
        title: "Execution",
        text: "Work is coordinated on site and checked against the design. You make quick decisions on small questions, and agree changes in writing before they go ahead.",
      },
      {
        title: "Handover",
        text: "A final walk-through with a list of anything to put right, and a handover of the room clean. You get care advice for each finish.",
      },
    ],
    approach: [
      {
        title: "How we design",
        points: [
          {
            title: "Plan before you buy",
            text: "We draw where each piece goes and how you walk through the room. Furniture bought first often ends up in the wrong place.",
          },
          {
            title: "Storage worked out early",
            text: "We count what you need to store, then give it a home. Clutter in a finished room is usually a storage mistake.",
          },
          {
            title: "Light in layers",
            text: "General, task and accent light, each on its own switch. One central light makes every room look flat.",
          },
        ],
      },
      {
        title: "How we choose materials",
        points: [
          {
            title: "Finish and upkeep go together",
            text: "We tell you how each surface ages and how to clean it. A glossy finish on a busy wall may look sharp for a month and tired after.",
          },
          {
            title: "Right wood in the right place",
            text: "Kitchens and bathrooms need board that handles damp and heat, while a dry bedroom can use something simpler.",
          },
          {
            title: "Floors for a hot climate",
            text: "We look at how a floor feels underfoot in summer, how slippery it gets when wet and how easily it stains.",
          },
        ],
      },
      {
        title: "How we advise you",
        points: [
          {
            title: "Spend where you touch it",
            text: "Hinges, drawer runners, the kitchen counter and the bed are used daily and deserve a bigger share. Show-off areas guests see once can be kept simple.",
          },
          {
            title: "Save without hurting the room",
            text: "We point out where a simpler option looks almost identical, and where cutting corners will cost you in two years.",
          },
          {
            title: "Itemised and honest",
            text: "The estimate lists each item so you can compare, trim or swap. If something goes over, you hear before it is done.",
          },
        ],
      },
    ],
    projects: [
      {
        title: "Full house",
        text: "Every room has to feel part of the same home. We set one colour and material direction, then adjust it for kitchens, bedrooms and the entrance.",
      },
      {
        title: "Renovation",
        text: "You live with what exists, so we work out what to keep, refinish or replace. Wiring and plumbing are checked before new finishes cover them.",
      },
      {
        title: "Tuition classes",
        text: "Seating that fits the age group, a clear board wall, good light for reading and hard-wearing finishes. Furniture is chosen to be moved and cleaned easily.",
      },
      {
        title: "Farm",
        text: "A farm house gets muddy boots, dust and guests who stay long. We plan an entrance that cleans easily, tough floors and shaded sit-outs.",
      },
    ],
    deliverables: [
      "A furniture and layout plan for every room",
      "3D views of the main rooms",
      "Joinery drawings with sizes and finishes",
      "A lighting plan with switch positions",
      "A finish and colour board",
      "An itemised estimate",
      "Site visits while the work is carried out",
    ],
    bring: [
      "Plan or measurements of the rooms, if you have them",
      "A list of what you want to keep, and what you want gone",
      "How many people use each room, and when",
      "Photos of rooms you like",
      "A budget range, and what matters most inside it",
      "Any family needs, such as elders, children or work from home",
    ],
    materials: [
      { name: "Plywood and boards", note: "Used for wardrobes and kitchens. The grade, thickness and edge finish decide how long they last.", guide: "timber-and-plywood-for-interiors" },
      { name: "Solid timber", note: "Doors, frames and furniture. Seasoning matters, because green wood warps.", guide: "timber-and-plywood-for-interiors" },
      { name: "Floor tiles", note: "Heat, slip and stain behave differently by type. Choose per room.", guide: "flooring-and-tiles-for-hot-climates" },
      { name: "Light and air", note: "Windows, fans and shading change how a room feels more than most finishes.", guide: "designing-for-heat-and-ventilation" },
    ],
    headings: {
    approach: "How a room goes from idea to finish",
    approachIntro: "Where the planning, the materials and the plain advice come in.",
    projects: "Four kinds of space we furnish",
    deliverables: "What your interior plan includes",
    bring: "Bring these when we visit your space",
    materials: "Finishes we help you choose",
    cta: "Have a room that needs to work better?",
  },
  enquiryType: "interior",
    draft: true,
  },
  civil: {
    slug: "civil",
    title: "Civil",
    h1: "Civil construction in Himatnagar",
    metaTitle: "Civil Contractors in Himatnagar: Build and Renovate",
    metaDescription:
      "Civil construction in Himatnagar, Gujarat. New houses, farms and renovation with checked structure, site supervision and a written estimate first.",
    intro:
      "Strong buildings come from sound structure and careful site work. We build new, repair and renovate, and we explain what each step involves before it starts. You get a written estimate first and a clear word whenever the work needs to change.",
    offers: [
      {
        title: "New construction",
        text: "Houses, farms and commercial buildings built from foundation to finish to the approved drawings, with each stage checked before the next begins.",
      },
      {
        title: "Renovation",
        text: "Extending, remodelling and refreshing an existing building without disturbing more than needed. We look at what is sound first, so you pay only for what has to change.",
      },
      {
        title: "Structural work",
        text: "Footings, columns, beams and slabs set out and checked against the structural drawings. This is the part you cannot fix later, so it gets the most attention.",
      },
      {
        title: "Repairs and waterproofing",
        text: "Cracks, leaks and damp traced to their cause before they are patched. Treating the symptom alone brings the problem back after the next monsoon.",
      },
      {
        title: "Site supervision",
        text: "Regular checks on materials, levels and workmanship, with problems raised early while they are cheap to put right.",
      },
      {
        title: "Estimates",
        text: "A written breakdown of quantities and cost before work starts. You can compare it, question it and decide, with fewer surprises later.",
      },
    ],
    process: [
      {
        title: "Site inspection",
        text: "We visit, assess the plot or the existing structure and list what the work involves. You show us the building, share any earlier drawings and tell us what is bothering you.",
      },
      {
        title: "Estimate and scope",
        text: "A written scope and cost breakdown. You compare it, ask questions and approve what is included and what is not.",
      },
      {
        title: "Set-out and foundation",
        text: "Marking out, excavation and footings, checked before they are covered. You confirm the plot boundaries so everything is set out in the right place.",
      },
      {
        title: "Structure",
        text: "Columns, beams, slabs and walls built to the drawings, with reinforcement checked before concrete is poured and curing looked after. You are told when each stage is done.",
      },
      {
        title: "Finishes and services",
        text: "Plaster, flooring, plumbing, electrics and paint. You choose finishes in time, because late choices hold up the whole site.",
      },
      {
        title: "Inspection and handover",
        text: "A final walk-through of the work, with any corrections made before handover. You get a list of what was done and advice on looking after it.",
      },
    ],
    approach: [
      {
        title: "How we design",
        points: [
          {
            title: "Structure first",
            text: "Loads must travel cleanly from roof to ground. We check where the columns and beams fall before wall layouts are final.",
          },
          {
            title: "Built from the drawings",
            text: "The site follows the drawn dimensions and levels. If something has to change, it is drawn and agreed, not decided at the wall.",
          },
          {
            title: "Planned for the monsoon",
            text: "Drainage, roof falls, plinth height and damp protection are settled before building, because water finds every gap.",
          },
        ],
      },
      {
        title: "How we choose materials",
        points: [
          {
            title: "Grade matched to use",
            text: "Footings, slabs and plaster ask for different strengths. We specify each so you do not overpay or under-build.",
          },
          {
            title: "Checked on arrival",
            text: "Steel, bricks, sand and cement are looked at when they reach the site, before they go into the wall.",
          },
          {
            title: "Curing treated as work",
            text: "Concrete gains strength with water and time. Keeping it wet in a Himatnagar summer is part of the schedule, not an afterthought.",
          },
        ],
      },
      {
        title: "How we advise you",
        points: [
          {
            title: "Estimate before work",
            text: "You see quantities and costs in writing before the first spade goes in, and you know what is included.",
          },
          {
            title: "Variations explained first",
            text: "If extra work is needed, we tell you what it is, why, and what it adds, before it is done. Nothing is added quietly.",
          },
          {
            title: "Supervision you can see",
            text: "Site visits and notes show how the work is progressing, so you can check it against what was agreed.",
          },
        ],
      },
    ],
    projects: [
      {
        title: "Full house",
        text: "A full build is many trades in sequence. We plan the order so the foundation, frame, services and finishes do not undo each other.",
      },
      {
        title: "Renovation",
        text: "Hidden surprises are likely, such as old wiring or damp walls. We open up carefully, tell you what we find and revise the scope with you.",
      },
      {
        title: "Tuition classes",
        text: "Strong floors, simple spans and good drainage matter, and so do safe stairs and exits. The room must be ready by the date classes begin.",
      },
      {
        title: "Farm",
        text: "Access for trucks, a reliable water source and foundations that suit the soil come first. Shade and drainage are planned for heavy rain.",
      },
    ],
    deliverables: [
      "A written scope and itemised estimate",
      "Construction to the approved drawings",
      "Structure checked at each stage",
      "Site visit notes with photographs",
      "Written agreement for any change in scope",
      "A final inspection and correction list",
      "Care advice for the finished building",
    ],
    bring: [
      "Plot papers or earlier drawings of the building",
      "A clear idea of what must be done and what can wait",
      "A budget range, and how you plan to pay in stages",
      "Photos of any cracks, leaks or damp",
      "Access to the site for visits",
      "A decision-maker who can approve changes quickly",
    ],
    materials: [
      { name: "Concrete", note: "Grade, mix and curing decide strength. Water added on site weakens it.", guide: "concrete-grades-and-curing" },
      { name: "Bricks and blocks", note: "Check size, strength and water uptake before buying in bulk.", guide: "choosing-bricks-and-blocks" },
      { name: "Steel", note: "Right bars, correct spacing and enough cover keep a frame sound for decades.", guide: "steel-and-reinforcement-basics" },
      { name: "Budget", note: "Knowing where the money goes keeps a build on track.", guide: "planning-your-house-budget" },
    ],
    headings: {
    approach: "How a building is kept sound on site",
    approachIntro: "What we watch, what we check and what we tell you.",
    projects: "Four kinds of site we build on",
    deliverables: "What you receive as work moves",
    bring: "Have these ready for the site visit",
    materials: "What your walls and slabs are made of",
    cta: "Ready to build, repair or renovate?",
  },
  enquiryType: "civil",
    draft: true,
  },
};
