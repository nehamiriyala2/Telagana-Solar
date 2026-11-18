import type { Scheme } from "@/lib/types";

/**
 * Scheme seed. ALL AMOUNTS ARE UNVERIFIED PLACEHOLDERS (`verified: false`).
 * They mirror publicly reported structures so the calculators have something to
 * work with. Verify on the official site, then update via admin/DB and set
 * `lastVerified`. The UI shows a "Needs verification" badge until then.
 */
export const schemes: Scheme[] = [
  {
    slug: "pm-surya-ghar",
    level: "central",
    categories: ["home"],
    appliesTo: ["urban", "rural"],
    name: { en: "PM Surya Ghar: Muft Bijli Yojana", te: "పీఎం సూర్య ఘర్: ముఫ్త్ బిజ్లీ యోజన" },
    short: { en: "Central subsidy for rooftop solar on your own home.", te: "మీ సొంత ఇంటి పైకప్పు సోలార్‌కు కేంద్ర సబ్సిడీ." },
    what: {
      en: "A Government of India programme that pays part of the cost of a rooftop solar system on a residential house. The subsidy is credited to your bank account after the system is installed and inspected.",
      te: "ఇంటి పైకప్పుపై సోలార్ పెట్టుకునే వారికి ఖర్చులో కొంత భాగాన్ని భారత ప్రభుత్వం చెల్లించే పథకం. సిస్టమ్ పెట్టి, తనిఖీ అయిన తర్వాత సబ్సిడీ మీ బ్యాంక్ ఖాతాలో జమ అవుతుంది.",
    },
    eligibility: [
      { en: "You own the house and have a suitable roof", te: "ఇల్లు మీ సొంతం, పైకప్పు సరిపోతుంది" },
      { en: "A valid domestic electricity connection in your name", te: "మీ పేరుపై చెల్లుబాటయ్యే గృహ విద్యుత్ కనెక్షన్" },
      { en: "No other solar subsidy already taken for this house", te: "ఈ ఇంటికి ఇంతకు ముందు సోలార్ సబ్సిడీ తీసుకోలేదు" },
    ],
    benefit: { en: "Subsidy per kW, capped (amounts in database).", te: "ప్రతి kW కి సబ్సిడీ, గరిష్ట పరిమితితో (మొత్తాలు డేటాబేస్‌లో)." },
    documents: [
      { en: "Latest electricity bill", te: "తాజా కరెంట్ బిల్లు" },
      { en: "Aadhaar card", te: "ఆధార్ కార్డు" },
      { en: "Bank account details (cancelled cheque or passbook)", te: "బ్యాంక్ ఖాతా వివరాలు (క్యాన్సిల్ చెక్ లేదా పాస్‌బుక్)" },
      { en: "Roof photo", te: "పైకప్పు ఫోటో" },
    ],
    steps: [
      { title: { en: "Register on the national portal", te: "జాతీయ పోర్టల్‌లో నమోదు" }, detail: { en: "Choose Telangana, your DISCOM and enter your consumer number.", te: "తెలంగాణ, మీ డిస్కామ్ ఎంచుకుని, కన్స్యూమర్ నంబర్ ఇవ్వండి." } },
      { title: { en: "Apply for rooftop solar", te: "రూఫ్‌టాప్ సోలార్‌కు దరఖాస్తు" }, detail: { en: "Log in with your consumer number and mobile, fill the form.", te: "కన్స్యూమర్ నంబర్, మొబైల్‌తో లాగిన్ అయి ఫారం నింపండి." } },
      { title: { en: "Get feasibility approval", te: "ఫీజిబిలిటీ ఆమోదం" }, detail: { en: "Your DISCOM checks the connection and approves.", te: "మీ డిస్కామ్ కనెక్షన్ తనిఖీ చేసి ఆమోదిస్తుంది." } },
      { title: { en: "Install with a registered vendor", te: "రిజిస్టర్డ్ వెండర్‌తో ఇన్‌స్టాల్" }, detail: { en: "Pick a vendor registered with your DISCOM.", te: "మీ డిస్కామ్‌లో నమోదైన వెండర్‌ను ఎంచుకోండి." } },
      { title: { en: "Net meter and inspection", te: "నెట్ మీటర్, తనిఖీ" }, detail: { en: "Submit installation details; DISCOM fits the net meter and inspects.", te: "ఇన్‌స్టాలేషన్ వివరాలు ఇవ్వండి; డిస్కామ్ నెట్ మీటర్ పెట్టి తనిఖీ చేస్తుంది." } },
      { title: { en: "Subsidy credited", te: "సబ్సిడీ జమ" }, detail: { en: "Submit bank details on the portal; subsidy arrives in your account.", te: "పోర్టల్‌లో బ్యాంక్ వివరాలు ఇవ్వండి; సబ్సిడీ మీ ఖాతాలో పడుతుంది." } },
    ],
    officialUrl: "https://pmsuryaghar.gov.in",
    subsidy: { kind: "per-kw-tiers", tiers: [{ upToKw: 2, perKw: 30000 }, { upToKw: 3, perKw: 18000 }], cap: 78000, maxKw: 3 },
    verified: false,
    lastVerified: null,
  },
  {
    slug: "pm-surya-ghar-rwa",
    level: "central",
    categories: ["apartment"],
    appliesTo: ["apartment"],
    name: { en: "PM Surya Ghar for apartments (RWA / GHS)", te: "అపార్ట్‌మెంట్లకు పీఎం సూర్య ఘర్ (RWA / GHS)" },
    short: { en: "Subsidy for solar on the common roof of housing societies.", te: "హౌసింగ్ సొసైటీల ఉమ్మడి పైకప్పుపై సోలార్‌కు సబ్సిడీ." },
    what: {
      en: "Resident welfare associations and group housing societies can install solar for common loads such as lifts, corridor lights and water pumps, and get a central subsidy per kW.",
      te: "రెసిడెంట్ వెల్ఫేర్ అసోసియేషన్లు, గ్రూప్ హౌసింగ్ సొసైటీలు లిఫ్ట్, కారిడార్ లైట్లు, నీటి పంపుల కోసం సోలార్ పెట్టుకుని kW కి సబ్సిడీ పొందవచ్చు.",
    },
    eligibility: [
      { en: "Registered RWA or housing society", te: "నమోదైన RWA లేదా హౌసింగ్ సొసైటీ" },
      { en: "Common-area electricity connection", te: "ఉమ్మడి ప్రాంత విద్యుత్ కనెక్షన్" },
      { en: "Resolution passed by the association", te: "అసోసియేషన్ తీర్మానం" },
    ],
    benefit: { en: "Per-kW subsidy for common facilities (amounts in database).", te: "ఉమ్మడి సౌకర్యాలకు kW కి సబ్సిడీ (మొత్తాలు డేటాబేస్‌లో)." },
    documents: [
      { en: "Society registration certificate", te: "సొసైటీ రిజిస్ట్రేషన్ సర్టిఫికేట్" },
      { en: "Common-area electricity bill", te: "ఉమ్మడి ప్రాంత కరెంట్ బిల్లు" },
      { en: "General body resolution", te: "జనరల్ బాడీ తీర్మానం" },
    ],
    steps: [
      { title: { en: "Pass a resolution", te: "తీర్మానం చేయండి" }, detail: { en: "Agree on roof use and budget in a general body meeting.", te: "జనరల్ బాడీ సమావేశంలో పైకప్పు వినియోగం, బడ్జెట్ నిర్ణయించండి." } },
      { title: { en: "Apply on the national portal", te: "జాతీయ పోర్టల్‌లో దరఖాస్తు" }, detail: { en: "Use the common-area consumer number.", te: "ఉమ్మడి ప్రాంత కన్స్యూమర్ నంబర్ వాడండి." } },
      { title: { en: "Install and net meter", te: "ఇన్‌స్టాల్, నెట్ మీటర్" }, detail: { en: "Registered vendor installs; DISCOM fits the net meter.", te: "రిజిస్టర్డ్ వెండర్ ఇన్‌స్టాల్ చేస్తారు; డిస్కామ్ నెట్ మీటర్ పెడుతుంది." } },
      { title: { en: "Subsidy credited", te: "సబ్సిడీ జమ" }, detail: { en: "Credited to the society bank account.", te: "సొసైటీ బ్యాంక్ ఖాతాలో జమ." } },
    ],
    officialUrl: "https://pmsuryaghar.gov.in",
    subsidy: { kind: "per-kw-tiers", tiers: [{ upToKw: 500, perKw: 18000 }] },
    verified: false,
    lastVerified: null,
  },
  {
    slug: "pm-kusum",
    level: "central",
    categories: ["farmer"],
    appliesTo: ["farmer"],
    name: { en: "PM-KUSUM (solar pumps for farmers)", te: "పీఎం-కుసుమ్ (రైతులకు సోలార్ పంపులు)" },
    short: { en: "Shared central and state support for solar irrigation pumps.", te: "సోలార్ సాగునీటి పంపులకు కేంద్ర, రాష్ట్ర సహాయం." },
    what: {
      en: "Helps farmers replace diesel or grid pumps with solar pumps. The cost is shared between the central government, the state government and the farmer. State participation and the farmer's share vary; check the current Telangana notification.",
      te: "డీజిల్ లేదా కరెంట్ పంపుల స్థానంలో సోలార్ పంపులు పెట్టుకునేందుకు రైతులకు సహాయం. ఖర్చును కేంద్రం, రాష్ట్రం, రైతు పంచుకుంటారు. రాష్ట్ర భాగస్వామ్యం మారవచ్చు; తాజా తెలంగాణ నోటిఫికేషన్ చూడండి.",
    },
    eligibility: [
      { en: "Individual farmer, group, FPO or cooperative", te: "వ్యక్తిగత రైతు, గ్రూప్, FPO లేదా సహకార సంఘం" },
      { en: "Owns or leases agricultural land with a water source", te: "నీటి వనరుతో వ్యవసాయ భూమి సొంతం లేదా లీజు" },
    ],
    benefit: { en: "Share of pump cost covered by government (percent in database).", te: "పంపు ఖర్చులో ప్రభుత్వ వాటా (శాతం డేటాబేస్‌లో)." },
    documents: [
      { en: "Land records (pattadar passbook)", te: "భూమి రికార్డులు (పట్టాదార్ పాస్‌బుక్)" },
      { en: "Aadhaar card", te: "ఆధార్ కార్డు" },
      { en: "Bank account details", te: "బ్యాంక్ ఖాతా వివరాలు" },
      { en: "Water source details", te: "నీటి వనరు వివరాలు" },
    ],
    steps: [
      { title: { en: "Check state notification", te: "రాష్ట్ర నోటిఫికేషన్ చూడండి" }, detail: { en: "Applications open only when the state invites them.", te: "రాష్ట్రం ఆహ్వానించినప్పుడే దరఖాస్తులు." } },
      { title: { en: "Apply", te: "దరఖాస్తు" }, detail: { en: "Apply through the state implementing agency.", te: "రాష్ట్ర అమలు సంస్థ ద్వారా దరఖాస్తు చేయండి." } },
      { title: { en: "Pay farmer share", te: "రైతు వాటా చెల్లించండి" }, detail: { en: "Pay your share after selection.", te: "ఎంపిక తర్వాత మీ వాటా చెల్లించండి." } },
      { title: { en: "Pump installed", te: "పంపు ఇన్‌స్టాల్" }, detail: { en: "Empanelled vendor installs and commissions the pump.", te: "ఎంపానెల్డ్ వెండర్ పంపును ఇన్‌స్టాల్ చేస్తారు." } },
    ],
    officialUrl: "https://pmkusum.mnre.gov.in",
    subsidy: { kind: "percent-of-cost", percent: 0.6 },
    verified: false,
    lastVerified: null,
  },
  {
    slug: "telangana-net-metering",
    level: "telangana",
    categories: ["home", "apartment", "business"],
    appliesTo: [],
    name: { en: "Telangana DISCOM net metering", te: "తెలంగాణ డిస్కామ్ నెట్ మీటరింగ్" },
    short: { en: "Send extra solar power to the grid and pay only for the net units.", te: "అదనపు సోలార్ కరెంట్‌ను గ్రిడ్‌కు పంపి, నికర యూనిట్లకే చెల్లించండి." },
    what: {
      en: "Your DISCOM (TGSPDCL in the south including Hyderabad, TGNPDCL in the north) replaces your meter with a two-way net meter. Units you export are subtracted from units you import.",
      te: "మీ డిస్కామ్ (హైదరాబాద్‌తో సహా దక్షిణాన TGSPDCL, ఉత్తరాన TGNPDCL) మీ మీటర్‌ను రెండు-వైపుల నెట్ మీటర్‌గా మారుస్తుంది. మీరు ఎగుమతి చేసిన యూనిట్లు, వాడిన యూనిట్ల నుండి తీసివేస్తారు.",
    },
    eligibility: [
      { en: "Any LT consumer with a grid-connected solar system", te: "గ్రిడ్‌కు అనుసంధానమైన సోలార్ ఉన్న ఏ LT వినియోగదారుడైనా" },
      { en: "System within the sanctioned load limits", te: "మంజూరైన లోడ్ పరిమితిలో సిస్టమ్" },
    ],
    benefit: { en: "Lower bills; exported units adjusted against imports.", te: "తక్కువ బిల్లులు; ఎగుమతి యూనిట్లు దిగుమతి నుండి సర్దుబాటు." },
    documents: [
      { en: "Electricity bill", te: "కరెంట్ బిల్లు" },
      { en: "Installation and inverter details", te: "ఇన్‌స్టాలేషన్, ఇన్వర్టర్ వివరాలు" },
      { en: "ID proof", te: "గుర్తింపు పత్రం" },
    ],
    steps: [
      { title: { en: "Apply to DISCOM", te: "డిస్కామ్‌కు దరఖాస్తు" }, detail: { en: "Usually your installer files this for you.", te: "సాధారణంగా మీ ఇన్‌స్టాలర్ ఇది చేస్తారు." } },
      { title: { en: "Technical feasibility", te: "సాంకేతిక పరిశీలన" }, detail: { en: "DISCOM checks transformer capacity.", te: "డిస్కామ్ ట్రాన్స్‌ఫార్మర్ సామర్థ్యం చూస్తుంది." } },
      { title: { en: "Agreement and meter", te: "ఒప్పందం, మీటర్" }, detail: { en: "Sign the net metering agreement; meter is installed.", te: "నెట్ మీటరింగ్ ఒప్పందం; మీటర్ ఇన్‌స్టాల్." } },
      { title: { en: "Synchronisation", te: "సింక్రనైజేషన్" }, detail: { en: "System is connected to the grid.", te: "సిస్టమ్ గ్రిడ్‌కు అనుసంధానం." } },
    ],
    officialUrl: "https://tgsouthernpower.org",
    subsidy: { kind: "none" },
    verified: false,
    lastVerified: null,
  },
  {
    slug: "telangana-rooftop-programme",
    level: "telangana",
    categories: ["home", "apartment", "business"],
    appliesTo: [],
    name: { en: "Telangana state rooftop solar programme (TGREDCO)", te: "తెలంగాణ రాష్ట్ర రూఫ్‌టాప్ సోలార్ కార్యక్రమం (TGREDCO)" },
    short: { en: "State nodal agency support, vendor empanelment and awareness.", te: "రాష్ట్ర నోడల్ ఏజెన్సీ సహాయం, వెండర్ ఎంపానెల్‌మెంట్." },
    what: {
      en: "The Telangana Renewable Energy Development Corporation is the state nodal agency for renewable programmes. Details of any current state-level incentive must be confirmed from the official notification.",
      te: "తెలంగాణ రెన్యూవబుల్ ఎనర్జీ డెవలప్‌మెంట్ కార్పొరేషన్ రాష్ట్ర నోడల్ ఏజెన్సీ. ప్రస్తుత రాష్ట్ర ప్రోత్సాహకాల వివరాలను అధికారిక నోటిఫికేషన్ నుండి నిర్ధారించాలి.",
    },
    eligibility: [{ en: "To be confirmed from the current notification", te: "తాజా నోటిఫికేషన్ నుండి నిర్ధారించాలి" }],
    benefit: { en: "To be confirmed.", te: "నిర్ధారించాలి." },
    documents: [{ en: "As per notification", te: "నోటిఫికేషన్ ప్రకారం" }],
    steps: [
      { title: { en: "Check TGREDCO notices", te: "TGREDCO నోటీసులు చూడండి" }, detail: { en: "Look for open programmes.", te: "అందుబాటులో ఉన్న కార్యక్రమాలు చూడండి." } },
      { title: { en: "Apply as directed", te: "సూచించిన విధంగా దరఖాస్తు" }, detail: { en: "Follow the steps in the notification.", te: "నోటిఫికేషన్‌లోని దశలు పాటించండి." } },
    ],
    officialUrl: "https://tgredco.telangana.gov.in",
    subsidy: { kind: "none" },
    verified: false,
    lastVerified: null,
  },
];
