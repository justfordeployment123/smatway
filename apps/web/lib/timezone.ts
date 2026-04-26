/**
 * Country → IANA timezone resolution + user-aware formatting.
 *
 * Two layers, in order of preference:
 *   1. The user's profile country, mapped via {@link COUNTRY_TO_TIMEZONE}.
 *      Wins when set, because the user has *told* us where they live —
 *      that beats whatever timezone their device happens to be on
 *      (VPNs, travel, broken NTP all cause device drift).
 *   2. The browser's resolved timezone via `Intl.DateTimeFormat`. Works
 *      automatically for every user on Earth without any mapping.
 *
 * The country map covers all UN member states + commonly-encountered
 * dependencies. Multi-zone countries pick their commercial-hub zone (US →
 * New York, Russia → Moscow, Brazil → São Paulo, Australia → Sydney). A
 * traveler from western Australia who's been told the time is "Sydney" will
 * still understand the relative offset; the alternative — pretending we
 * have city-level data when we don't — is worse.
 *
 * Country keys accept the user-visible English name OR the ISO 3166-1
 * alpha-2 code, so signups using either format Just Work.
 */
const COUNTRY_TO_TIMEZONE: Record<string, string> = {
  // ─── Africa ────────────────────────────────────────────────────────────────
  Algeria: "Africa/Algiers", DZ: "Africa/Algiers",
  Angola: "Africa/Luanda", AO: "Africa/Luanda",
  Benin: "Africa/Porto-Novo", BJ: "Africa/Porto-Novo",
  Botswana: "Africa/Gaborone", BW: "Africa/Gaborone",
  "Burkina Faso": "Africa/Ouagadougou", BF: "Africa/Ouagadougou",
  Burundi: "Africa/Bujumbura", BI: "Africa/Bujumbura",
  Cameroon: "Africa/Douala", CM: "Africa/Douala",
  "Cape Verde": "Atlantic/Cape_Verde", CV: "Atlantic/Cape_Verde",
  "Central African Republic": "Africa/Bangui", CF: "Africa/Bangui",
  Chad: "Africa/Ndjamena", TD: "Africa/Ndjamena",
  Comoros: "Indian/Comoro", KM: "Indian/Comoro",
  "Democratic Republic of the Congo": "Africa/Kinshasa", CD: "Africa/Kinshasa",
  "Republic of the Congo": "Africa/Brazzaville", CG: "Africa/Brazzaville",
  "Ivory Coast": "Africa/Abidjan", CI: "Africa/Abidjan",
  "Côte d'Ivoire": "Africa/Abidjan",
  Djibouti: "Africa/Djibouti", DJ: "Africa/Djibouti",
  Egypt: "Africa/Cairo", EG: "Africa/Cairo",
  "Equatorial Guinea": "Africa/Malabo", GQ: "Africa/Malabo",
  Eritrea: "Africa/Asmara", ER: "Africa/Asmara",
  Eswatini: "Africa/Mbabane", SZ: "Africa/Mbabane",
  Ethiopia: "Africa/Addis_Ababa", ET: "Africa/Addis_Ababa",
  Gabon: "Africa/Libreville", GA: "Africa/Libreville",
  Gambia: "Africa/Banjul", GM: "Africa/Banjul",
  Ghana: "Africa/Accra", GH: "Africa/Accra",
  Guinea: "Africa/Conakry", GN: "Africa/Conakry",
  "Guinea-Bissau": "Africa/Bissau", GW: "Africa/Bissau",
  Kenya: "Africa/Nairobi", KE: "Africa/Nairobi",
  Lesotho: "Africa/Maseru", LS: "Africa/Maseru",
  Liberia: "Africa/Monrovia", LR: "Africa/Monrovia",
  Libya: "Africa/Tripoli", LY: "Africa/Tripoli",
  Madagascar: "Indian/Antananarivo", MG: "Indian/Antananarivo",
  Malawi: "Africa/Blantyre", MW: "Africa/Blantyre",
  Mali: "Africa/Bamako", ML: "Africa/Bamako",
  Mauritania: "Africa/Nouakchott", MR: "Africa/Nouakchott",
  Mauritius: "Indian/Mauritius", MU: "Indian/Mauritius",
  Morocco: "Africa/Casablanca", MA: "Africa/Casablanca",
  Mozambique: "Africa/Maputo", MZ: "Africa/Maputo",
  Namibia: "Africa/Windhoek", NA: "Africa/Windhoek",
  Niger: "Africa/Niamey", NE: "Africa/Niamey",
  Nigeria: "Africa/Lagos", NG: "Africa/Lagos",
  Rwanda: "Africa/Kigali", RW: "Africa/Kigali",
  "São Tomé and Príncipe": "Africa/Sao_Tome", ST: "Africa/Sao_Tome",
  Senegal: "Africa/Dakar", SN: "Africa/Dakar",
  Seychelles: "Indian/Mahe", SC: "Indian/Mahe",
  "Sierra Leone": "Africa/Freetown", SL: "Africa/Freetown",
  Somalia: "Africa/Mogadishu", SO: "Africa/Mogadishu",
  "South Africa": "Africa/Johannesburg", ZA: "Africa/Johannesburg",
  "South Sudan": "Africa/Juba", SS: "Africa/Juba",
  Sudan: "Africa/Khartoum", SD: "Africa/Khartoum",
  Tanzania: "Africa/Dar_es_Salaam", TZ: "Africa/Dar_es_Salaam",
  Togo: "Africa/Lome", TG: "Africa/Lome",
  Tunisia: "Africa/Tunis", TN: "Africa/Tunis",
  Uganda: "Africa/Kampala", UG: "Africa/Kampala",
  Zambia: "Africa/Lusaka", ZM: "Africa/Lusaka",
  Zimbabwe: "Africa/Harare", ZW: "Africa/Harare",

  // ─── Asia ──────────────────────────────────────────────────────────────────
  Afghanistan: "Asia/Kabul", AF: "Asia/Kabul",
  Armenia: "Asia/Yerevan", AM: "Asia/Yerevan",
  Azerbaijan: "Asia/Baku", AZ: "Asia/Baku",
  Bahrain: "Asia/Bahrain", BH: "Asia/Bahrain",
  Bangladesh: "Asia/Dhaka", BD: "Asia/Dhaka",
  Bhutan: "Asia/Thimphu", BT: "Asia/Thimphu",
  Brunei: "Asia/Brunei", BN: "Asia/Brunei",
  Cambodia: "Asia/Phnom_Penh", KH: "Asia/Phnom_Penh",
  China: "Asia/Shanghai", CN: "Asia/Shanghai",
  Cyprus: "Asia/Nicosia", CY: "Asia/Nicosia",
  Georgia: "Asia/Tbilisi", GE: "Asia/Tbilisi",
  "Hong Kong": "Asia/Hong_Kong", HK: "Asia/Hong_Kong",
  India: "Asia/Kolkata", IN: "Asia/Kolkata",
  Indonesia: "Asia/Jakarta", ID: "Asia/Jakarta",
  Iran: "Asia/Tehran", IR: "Asia/Tehran",
  Iraq: "Asia/Baghdad", IQ: "Asia/Baghdad",
  Israel: "Asia/Jerusalem", IL: "Asia/Jerusalem",
  Japan: "Asia/Tokyo", JP: "Asia/Tokyo",
  Jordan: "Asia/Amman", JO: "Asia/Amman",
  Kazakhstan: "Asia/Almaty", KZ: "Asia/Almaty",
  Kuwait: "Asia/Kuwait", KW: "Asia/Kuwait",
  Kyrgyzstan: "Asia/Bishkek", KG: "Asia/Bishkek",
  Laos: "Asia/Vientiane", LA: "Asia/Vientiane",
  Lebanon: "Asia/Beirut", LB: "Asia/Beirut",
  Macau: "Asia/Macau", MO: "Asia/Macau",
  Malaysia: "Asia/Kuala_Lumpur", MY: "Asia/Kuala_Lumpur",
  Maldives: "Indian/Maldives", MV: "Indian/Maldives",
  Mongolia: "Asia/Ulaanbaatar", MN: "Asia/Ulaanbaatar",
  Myanmar: "Asia/Yangon", MM: "Asia/Yangon",
  Nepal: "Asia/Kathmandu", NP: "Asia/Kathmandu",
  "North Korea": "Asia/Pyongyang", KP: "Asia/Pyongyang",
  Oman: "Asia/Muscat", OM: "Asia/Muscat",
  Pakistan: "Asia/Karachi", PK: "Asia/Karachi",
  Palestine: "Asia/Gaza", PS: "Asia/Gaza",
  Philippines: "Asia/Manila", PH: "Asia/Manila",
  Qatar: "Asia/Qatar", QA: "Asia/Qatar",
  "Saudi Arabia": "Asia/Riyadh", SA: "Asia/Riyadh",
  Singapore: "Asia/Singapore", SG: "Asia/Singapore",
  "South Korea": "Asia/Seoul", KR: "Asia/Seoul",
  "Sri Lanka": "Asia/Colombo", LK: "Asia/Colombo",
  Syria: "Asia/Damascus", SY: "Asia/Damascus",
  Taiwan: "Asia/Taipei", TW: "Asia/Taipei",
  Tajikistan: "Asia/Dushanbe", TJ: "Asia/Dushanbe",
  Thailand: "Asia/Bangkok", TH: "Asia/Bangkok",
  "Timor-Leste": "Asia/Dili", TL: "Asia/Dili",
  Turkey: "Europe/Istanbul", TR: "Europe/Istanbul",
  Turkmenistan: "Asia/Ashgabat", TM: "Asia/Ashgabat",
  UAE: "Asia/Dubai", "United Arab Emirates": "Asia/Dubai", AE: "Asia/Dubai",
  Uzbekistan: "Asia/Tashkent", UZ: "Asia/Tashkent",
  Vietnam: "Asia/Ho_Chi_Minh", VN: "Asia/Ho_Chi_Minh",
  Yemen: "Asia/Aden", YE: "Asia/Aden",

  // ─── Europe ────────────────────────────────────────────────────────────────
  Albania: "Europe/Tirane", AL: "Europe/Tirane",
  Andorra: "Europe/Andorra", AD: "Europe/Andorra",
  Austria: "Europe/Vienna", AT: "Europe/Vienna",
  Belarus: "Europe/Minsk", BY: "Europe/Minsk",
  Belgium: "Europe/Brussels", BE: "Europe/Brussels",
  "Bosnia and Herzegovina": "Europe/Sarajevo", BA: "Europe/Sarajevo",
  Bulgaria: "Europe/Sofia", BG: "Europe/Sofia",
  Croatia: "Europe/Zagreb", HR: "Europe/Zagreb",
  "Czech Republic": "Europe/Prague", CZ: "Europe/Prague",
  Czechia: "Europe/Prague",
  Denmark: "Europe/Copenhagen", DK: "Europe/Copenhagen",
  Estonia: "Europe/Tallinn", EE: "Europe/Tallinn",
  Finland: "Europe/Helsinki", FI: "Europe/Helsinki",
  France: "Europe/Paris", FR: "Europe/Paris",
  Germany: "Europe/Berlin", DE: "Europe/Berlin",
  Greece: "Europe/Athens", GR: "Europe/Athens",
  Hungary: "Europe/Budapest", HU: "Europe/Budapest",
  Iceland: "Atlantic/Reykjavik", IS: "Atlantic/Reykjavik",
  Ireland: "Europe/Dublin", IE: "Europe/Dublin",
  Italy: "Europe/Rome", IT: "Europe/Rome",
  Kosovo: "Europe/Belgrade", XK: "Europe/Belgrade",
  Latvia: "Europe/Riga", LV: "Europe/Riga",
  Liechtenstein: "Europe/Vaduz", LI: "Europe/Vaduz",
  Lithuania: "Europe/Vilnius", LT: "Europe/Vilnius",
  Luxembourg: "Europe/Luxembourg", LU: "Europe/Luxembourg",
  Malta: "Europe/Malta", MT: "Europe/Malta",
  Moldova: "Europe/Chisinau", MD: "Europe/Chisinau",
  Monaco: "Europe/Monaco", MC: "Europe/Monaco",
  Montenegro: "Europe/Podgorica", ME: "Europe/Podgorica",
  Netherlands: "Europe/Amsterdam", NL: "Europe/Amsterdam",
  "North Macedonia": "Europe/Skopje", MK: "Europe/Skopje",
  Norway: "Europe/Oslo", NO: "Europe/Oslo",
  Poland: "Europe/Warsaw", PL: "Europe/Warsaw",
  Portugal: "Europe/Lisbon", PT: "Europe/Lisbon",
  Romania: "Europe/Bucharest", RO: "Europe/Bucharest",
  Russia: "Europe/Moscow", RU: "Europe/Moscow",
  "San Marino": "Europe/San_Marino", SM: "Europe/San_Marino",
  Serbia: "Europe/Belgrade", RS: "Europe/Belgrade",
  Slovakia: "Europe/Bratislava", SK: "Europe/Bratislava",
  Slovenia: "Europe/Ljubljana", SI: "Europe/Ljubljana",
  Spain: "Europe/Madrid", ES: "Europe/Madrid",
  Sweden: "Europe/Stockholm", SE: "Europe/Stockholm",
  Switzerland: "Europe/Zurich", CH: "Europe/Zurich",
  Ukraine: "Europe/Kyiv", UA: "Europe/Kyiv",
  "United Kingdom": "Europe/London", GB: "Europe/London", UK: "Europe/London",
  "Vatican City": "Europe/Vatican", VA: "Europe/Vatican",

  // ─── Americas ──────────────────────────────────────────────────────────────
  "Antigua and Barbuda": "America/Antigua", AG: "America/Antigua",
  Argentina: "America/Argentina/Buenos_Aires", AR: "America/Argentina/Buenos_Aires",
  Bahamas: "America/Nassau", BS: "America/Nassau",
  Barbados: "America/Barbados", BB: "America/Barbados",
  Belize: "America/Belize", BZ: "America/Belize",
  Bolivia: "America/La_Paz", BO: "America/La_Paz",
  Brazil: "America/Sao_Paulo", BR: "America/Sao_Paulo",
  Canada: "America/Toronto", CA: "America/Toronto",
  Chile: "America/Santiago", CL: "America/Santiago",
  Colombia: "America/Bogota", CO: "America/Bogota",
  "Costa Rica": "America/Costa_Rica", CR: "America/Costa_Rica",
  Cuba: "America/Havana", CU: "America/Havana",
  Dominica: "America/Dominica", DM: "America/Dominica",
  "Dominican Republic": "America/Santo_Domingo", DO: "America/Santo_Domingo",
  Ecuador: "America/Guayaquil", EC: "America/Guayaquil",
  "El Salvador": "America/El_Salvador", SV: "America/El_Salvador",
  Grenada: "America/Grenada", GD: "America/Grenada",
  Guatemala: "America/Guatemala", GT: "America/Guatemala",
  Guyana: "America/Guyana", GY: "America/Guyana",
  Haiti: "America/Port-au-Prince", HT: "America/Port-au-Prince",
  Honduras: "America/Tegucigalpa", HN: "America/Tegucigalpa",
  Jamaica: "America/Jamaica", JM: "America/Jamaica",
  Mexico: "America/Mexico_City", MX: "America/Mexico_City",
  Nicaragua: "America/Managua", NI: "America/Managua",
  Panama: "America/Panama", PA: "America/Panama",
  Paraguay: "America/Asuncion", PY: "America/Asuncion",
  Peru: "America/Lima", PE: "America/Lima",
  "Saint Kitts and Nevis": "America/St_Kitts", KN: "America/St_Kitts",
  "Saint Lucia": "America/St_Lucia", LC: "America/St_Lucia",
  "Saint Vincent and the Grenadines": "America/St_Vincent", VC: "America/St_Vincent",
  Suriname: "America/Paramaribo", SR: "America/Paramaribo",
  "Trinidad and Tobago": "America/Port_of_Spain", TT: "America/Port_of_Spain",
  "United States": "America/New_York", USA: "America/New_York", US: "America/New_York",
  Uruguay: "America/Montevideo", UY: "America/Montevideo",
  Venezuela: "America/Caracas", VE: "America/Caracas",

  // ─── Oceania ───────────────────────────────────────────────────────────────
  Australia: "Australia/Sydney", AU: "Australia/Sydney",
  Fiji: "Pacific/Fiji", FJ: "Pacific/Fiji",
  Kiribati: "Pacific/Tarawa", KI: "Pacific/Tarawa",
  "Marshall Islands": "Pacific/Majuro", MH: "Pacific/Majuro",
  Micronesia: "Pacific/Pohnpei", FM: "Pacific/Pohnpei",
  Nauru: "Pacific/Nauru", NR: "Pacific/Nauru",
  "New Zealand": "Pacific/Auckland", NZ: "Pacific/Auckland",
  Palau: "Pacific/Palau", PW: "Pacific/Palau",
  "Papua New Guinea": "Pacific/Port_Moresby", PG: "Pacific/Port_Moresby",
  Samoa: "Pacific/Apia", WS: "Pacific/Apia",
  "Solomon Islands": "Pacific/Guadalcanal", SB: "Pacific/Guadalcanal",
  Tonga: "Pacific/Tongatapu", TO: "Pacific/Tongatapu",
  Tuvalu: "Pacific/Funafuti", TV: "Pacific/Funafuti",
  Vanuatu: "Pacific/Efate", VU: "Pacific/Efate",
};

/** Browser's resolved timezone — works for every device on Earth without a map. */
function browserTimezone(): string {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function timezoneForCountry(country?: string | null): string | undefined {
  if (!country) return undefined;
  const trimmed = country.trim();
  // Try exact match first, then uppercase (for ISO codes typed lowercase).
  return COUNTRY_TO_TIMEZONE[trimmed] ?? COUNTRY_TO_TIMEZONE[trimmed.toUpperCase()];
}

/**
 * Resolve the timezone we should use for this user's date displays.
 * Profile country wins; browser TZ is the fallback so users without a
 * country set still see local time. Pure UTC is the last resort and only
 * happens if the runtime can't expose its timezone (very old browsers).
 */
export function resolveUserTimezone(country?: string | null): string {
  return timezoneForCountry(country) ?? browserTimezone();
}

/**
 * Format a Date in the user's resolved timezone. The single helper every
 * caller should reach for — handles country lookup + browser fallback +
 * UTC last-resort internally.
 */
export function formatInUserTimezone(
  date: Date,
  country: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: resolveUserTimezone(country),
  }).format(date);
}
