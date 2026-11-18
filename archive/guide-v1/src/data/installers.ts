import type { Installer } from "@/lib/types";

/**
 * SAMPLE LISTINGS ONLY: fictional businesses with placeholder numbers so the
 * locator UI can be built. Replace with real, verified installers via admin/DB.
 */
const s = (en: string, te: string) => ({ en, te });
const SURVEY = s("Free site survey", "ఉచిత సైట్ సర్వే");
const SUBSIDY = s("Subsidy paperwork", "సబ్సిడీ పత్రాలు");
const NETMETER = s("Net meter filing", "నెట్ మీటర్ దరఖాస్తు");
const AMC = s("Annual maintenance", "వార్షిక నిర్వహణ");
const EMI = s("EMI options", "EMI సౌకర్యం");
const BATTERY = s("Battery backup", "బ్యాటరీ బ్యాకప్");
const PUMP = s("Solar pump installation", "సోలార్ పంప్ ఇన్‌స్టాలేషన్");

export const installers: Installer[] = [
  { id: "i1", name: "Sample Solar Co. – Gachibowli", district: "ranga-reddy", area: "Gachibowli", lat: 17.4401, lng: 78.3489, phone: "+919000000001", whatsapp: "919000000001", types: ["on-grid", "hybrid"], services: [SURVEY, SUBSIDY, NETMETER, EMI], verified: true, rating: 4.7, reviews: 128, sample: true },
  { id: "i2", name: "Sample Rooftop Energy – Kukatpally", district: "medchal-malkajgiri", area: "Kukatpally", lat: 17.4948, lng: 78.3996, phone: "+919000000002", whatsapp: "919000000002", types: ["on-grid", "community"], services: [SURVEY, SUBSIDY, NETMETER, AMC], verified: true, rating: 4.5, reviews: 86, sample: true },
  { id: "i3", name: "Sample Sun Systems – Secunderabad", district: "hyderabad", area: "Secunderabad", lat: 17.4399, lng: 78.4983, phone: "+919000000003", whatsapp: "919000000003", types: ["on-grid", "hybrid", "off-grid"], services: [SURVEY, BATTERY, AMC], verified: false, rating: 4.2, reviews: 41, sample: true },
  { id: "i4", name: "Sample Green Power – LB Nagar", district: "ranga-reddy", area: "LB Nagar", lat: 17.3457, lng: 78.5522, phone: "+919000000004", whatsapp: "919000000004", types: ["on-grid", "commercial"], services: [SURVEY, NETMETER, EMI, AMC], verified: true, rating: 4.6, reviews: 203, sample: true },
  { id: "i5", name: "Sample Kisan Solar – Patancheru", district: "sangareddy", area: "Patancheru", lat: 17.5329, lng: 78.2645, phone: "+919000000005", whatsapp: "919000000005", types: ["pumpset", "off-grid"], services: [PUMP, SUBSIDY, AMC], verified: true, rating: 4.4, reviews: 57, sample: true },
  { id: "i6", name: "Sample Bright Homes – Banjara Hills", district: "hyderabad", area: "Banjara Hills", lat: 17.4156, lng: 78.4347, phone: "+919000000006", whatsapp: "919000000006", types: ["on-grid", "hybrid"], services: [SURVEY, SUBSIDY, BATTERY, EMI], verified: true, rating: 4.8, reviews: 312, sample: true },
  { id: "i7", name: "Sample Apartment Solar – Miyapur", district: "medchal-malkajgiri", area: "Miyapur", lat: 17.4968, lng: 78.3614, phone: "+919000000007", whatsapp: "919000000007", types: ["community", "on-grid"], services: [SURVEY, NETMETER, AMC], verified: false, rating: 4.1, reviews: 23, sample: true },
  { id: "i8", name: "Sample Biz Energy – Uppal", district: "medchal-malkajgiri", area: "Uppal", lat: 17.4058, lng: 78.5591, phone: "+919000000008", whatsapp: "919000000008", types: ["commercial", "on-grid"], services: [SURVEY, NETMETER, EMI], verified: true, rating: 4.3, reviews: 64, sample: true },
];
