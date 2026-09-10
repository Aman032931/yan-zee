// locationData.js
//
// Static geographic dataset for the 10 target countries.
// Scope, by design (not exhaustive — see note below):
//   - Every official province/state/emirate/governorate is listed in full.
//   - Cities are CURATED major cities per province (the well-known hubs),
//     not an exhaustive list of every town — that's what the live
//     @countrystatecity/countries-browser API is for, if you need full
//     city coverage for search-as-you-type.
//   - Nepal is the only country with a full District (ADM2) layer, since
//     it's the one case in this set where a District select is standard
//     local UX. India/US counties etc. were deliberately left out — a
//     dropdown with ~700 Indian districts or ~3,000 US counties is not
//     practical UX, and hand-typing that scale of data risks errors.
//
// CAVEAT: province labels here (e.g. "Gandaki Province", "Uttar Pradesh")
// are written to match common English naming. If you're also pulling
// provinces from the live API, double check the exact label strings match
// before using this file to key off the API's province selection —
// country-state-city libraries occasionally format names slightly
// differently (e.g. with/without "Province", "State", diacritics).

export const COUNTRIES_WITH_DISTRICTS = new Set(['NP']);

export const LOCATION_DATA = {

  // ---------------- NEPAL (7 provinces, all 77 districts) ----------------
  NP: {
    hasDistrict: true,
    provinces: {
      "Koshi Province": {
        districts: {
          "Bhojpur": ["Bhojpur"],
          "Dhankuta": ["Dhankuta"],
          "Ilam": ["Ilam"],
          "Jhapa": ["Damak", "Birtamod", "Bhadrapur"],
          "Khotang": ["Diktel"],
          "Morang": ["Biratnagar"],
          "Okhaldhunga": ["Okhaldhunga"],
          "Panchthar": ["Phidim"],
          "Sankhuwasabha": ["Khandbari"],
          "Solukhumbu": ["Salleri"],
          "Sunsari": ["Itahari", "Dharan", "Inaruwa"],
          "Taplejung": ["Taplejung"],
          "Terhathum": ["Myanglung"],
          "Udayapur": ["Gaighat", "Katari"]
        }
      },
      "Madhesh Province": {
        districts: {
          "Bara": ["Kalaiya"],
          "Dhanusha": ["Janakpur"],
          "Mahottari": ["Jaleshwar"],
          "Parsa": ["Birgunj"],
          "Rautahat": ["Gaur"],
          "Saptari": ["Rajbiraj"],
          "Sarlahi": ["Malangwa"],
          "Siraha": ["Siraha"]
        }
      },
      "Bagmati Province": {
        districts: {
          "Bhaktapur": ["Bhaktapur"],
          "Chitwan": ["Bharatpur", "Ratnanagar"],
          "Dhading": ["Nilkantha"],
          "Dolakha": ["Charikot"],
          "Kathmandu": ["Kathmandu", "Kirtipur"],
          "Kavrepalanchok": ["Dhulikhel", "Banepa"],
          "Lalitpur": ["Lalitpur"],
          "Makwanpur": ["Hetauda"],
          "Nuwakot": ["Bidur"],
          "Ramechhap": ["Manthali"],
          "Rasuwa": ["Dhunche"],
          "Sindhuli": ["Sindhulimadi"],
          "Sindhupalchok": ["Chautara"]
        }
      },
      "Gandaki Province": {
        districts: {
          "Baglung": ["Baglung"],
          "Gorkha": ["Gorkha"],
          "Kaski": ["Pokhara", "Lekhnath"],
          "Lamjung": ["Besisahar"],
          "Manang": ["Chame"],
          "Mustang": ["Jomsom"],
          "Myagdi": ["Beni"],
          "Nawalpur": ["Kawasoti"],
          "Parbat": ["Kushma"],
          "Syangja": ["Putalibazar", "Waling"],
          "Tanahun": ["Damauli", "Byas"]
        }
      },
      "Lumbini Province": {
        districts: {
          "Arghakhanchi": ["Sandhikharka"],
          "Banke": ["Nepalgunj"],
          "Bardiya": ["Gulariya"],
          "Dang": ["Ghorahi", "Tulsipur"],
          "Eastern Rukum": ["Rukumkot"],
          "Gulmi": ["Tamghas"],
          "Kapilvastu": ["Taulihawa"],
          "Parasi": ["Ramgram"],
          "Palpa": ["Tansen"],
          "Pyuthan": ["Pyuthan"],
          "Rolpa": ["Liwang"],
          "Rupandehi": ["Butwal", "Siddharthanagar", "Tilottama"]
        }
      },
      "Karnali Province": {
        districts: {
          "Dailekh": ["Dailekh"],
          "Dolpa": ["Dunai"],
          "Humla": ["Simikot"],
          "Jajarkot": ["Khalanga"],
          "Jumla": ["Jumla"],
          "Kalikot": ["Manma"],
          "Mugu": ["Gamgadhi"],
          "Salyan": ["Salyan"],
          "Surkhet": ["Birendranagar"],
          "Western Rukum": ["Musikot"]
        }
      },
      "Sudurpashchim Province": {
        districts: {
          "Achham": ["Mangalsen"],
          "Baitadi": ["Baitadi"],
          "Bajhang": ["Chainpur"],
          "Bajura": ["Martadi"],
          "Dadeldhura": ["Dadeldhura"],
          "Darchula": ["Darchula"],
          "Doti": ["Dipayal-Silgadhi"],
          "Kailali": ["Dhangadhi", "Tikapur"],
          "Kanchanpur": ["Bhimdatta"]
        }
      }
    }
  },

  // ---------------- INDIA (28 states + 8 union territories) ----------------
  IN: {
    hasDistrict: false,
    provinces: {
      "Andhra Pradesh": { cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"] },
      "Arunachal Pradesh": { cities: ["Itanagar", "Naharlagun"] },
      "Assam": { cities: ["Guwahati", "Silchar", "Dibrugarh"] },
      "Bihar": { cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"] },
      "Chhattisgarh": { cities: ["Raipur", "Bhilai", "Bilaspur"] },
      "Goa": { cities: ["Panaji", "Margao", "Vasco da Gama"] },
      "Gujarat": { cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
      "Haryana": { cities: ["Gurugram", "Faridabad", "Panipat"] },
      "Himachal Pradesh": { cities: ["Shimla", "Dharamshala", "Manali"] },
      "Jharkhand": { cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
      "Karnataka": { cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"] },
      "Kerala": { cities: ["Kochi", "Thiruvananthapuram", "Kozhikode"] },
      "Madhya Pradesh": { cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur"] },
      "Maharashtra": { cities: ["Mumbai", "Pune", "Nagpur", "Nashik"] },
      "Manipur": { cities: ["Imphal"] },
      "Meghalaya": { cities: ["Shillong"] },
      "Mizoram": { cities: ["Aizawl"] },
      "Nagaland": { cities: ["Kohima", "Dimapur"] },
      "Odisha": { cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
      "Punjab": { cities: ["Ludhiana", "Amritsar", "Jalandhar"] },
      "Rajasthan": { cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"] },
      "Sikkim": { cities: ["Gangtok"] },
      "Tamil Nadu": { cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] },
      "Telangana": { cities: ["Hyderabad", "Warangal"] },
      "Tripura": { cities: ["Agartala"] },
      "Uttar Pradesh": { cities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"] },
      "Uttarakhand": { cities: ["Dehradun", "Haridwar", "Nainital"] },
      "West Bengal": { cities: ["Kolkata", "Howrah", "Siliguri"] },
      "Andaman and Nicobar Islands": { cities: ["Port Blair"] },
      "Chandigarh": { cities: ["Chandigarh"] },
      "Dadra and Nagar Haveli and Daman and Diu": { cities: ["Daman", "Silvassa"] },
      "Delhi": { cities: ["New Delhi", "Dwarka"] },
      "Jammu and Kashmir": { cities: ["Srinagar", "Jammu"] },
      "Ladakh": { cities: ["Leh", "Kargil"] },
      "Lakshadweep": { cities: ["Kavaratti"] },
      "Puducherry": { cities: ["Puducherry", "Karaikal"] }
    }
  },

  // ---------------- UNITED STATES (50 states + DC) ----------------
  US: {
    hasDistrict: false,
    provinces: {
      "Alabama": { cities: ["Birmingham", "Montgomery", "Huntsville"] },
      "Alaska": { cities: ["Anchorage", "Fairbanks", "Juneau"] },
      "Arizona": { cities: ["Phoenix", "Tucson", "Mesa"] },
      "Arkansas": { cities: ["Little Rock", "Fayetteville"] },
      "California": { cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"] },
      "Colorado": { cities: ["Denver", "Colorado Springs", "Boulder"] },
      "Connecticut": { cities: ["Hartford", "New Haven", "Stamford"] },
      "Delaware": { cities: ["Wilmington", "Dover"] },
      "Florida": { cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
      "Georgia": { cities: ["Atlanta", "Savannah", "Augusta"] },
      "Hawaii": { cities: ["Honolulu", "Hilo"] },
      "Idaho": { cities: ["Boise", "Idaho Falls"] },
      "Illinois": { cities: ["Chicago", "Springfield", "Naperville"] },
      "Indiana": { cities: ["Indianapolis", "Fort Wayne"] },
      "Iowa": { cities: ["Des Moines", "Cedar Rapids"] },
      "Kansas": { cities: ["Wichita", "Topeka"] },
      "Kentucky": { cities: ["Louisville", "Lexington"] },
      "Louisiana": { cities: ["New Orleans", "Baton Rouge"] },
      "Maine": { cities: ["Portland", "Augusta"] },
      "Maryland": { cities: ["Baltimore", "Annapolis"] },
      "Massachusetts": { cities: ["Boston", "Cambridge", "Worcester"] },
      "Michigan": { cities: ["Detroit", "Ann Arbor", "Grand Rapids"] },
      "Minnesota": { cities: ["Minneapolis", "Saint Paul"] },
      "Mississippi": { cities: ["Jackson", "Gulfport"] },
      "Missouri": { cities: ["Kansas City", "St. Louis", "Springfield"] },
      "Montana": { cities: ["Billings", "Missoula"] },
      "Nebraska": { cities: ["Omaha", "Lincoln"] },
      "Nevada": { cities: ["Las Vegas", "Reno"] },
      "New Hampshire": { cities: ["Manchester", "Concord"] },
      "New Jersey": { cities: ["Newark", "Jersey City", "Trenton"] },
      "New Mexico": { cities: ["Albuquerque", "Santa Fe"] },
      "New York": { cities: ["New York City", "Buffalo", "Albany", "Rochester"] },
      "North Carolina": { cities: ["Charlotte", "Raleigh", "Durham"] },
      "North Dakota": { cities: ["Fargo", "Bismarck"] },
      "Ohio": { cities: ["Columbus", "Cleveland", "Cincinnati"] },
      "Oklahoma": { cities: ["Oklahoma City", "Tulsa"] },
      "Oregon": { cities: ["Portland", "Eugene", "Salem"] },
      "Pennsylvania": { cities: ["Philadelphia", "Pittsburgh", "Harrisburg"] },
      "Rhode Island": { cities: ["Providence"] },
      "South Carolina": { cities: ["Charleston", "Columbia"] },
      "South Dakota": { cities: ["Sioux Falls", "Rapid City"] },
      "Tennessee": { cities: ["Nashville", "Memphis", "Knoxville"] },
      "Texas": { cities: ["Houston", "Dallas", "Austin", "San Antonio"] },
      "Utah": { cities: ["Salt Lake City", "Provo"] },
      "Vermont": { cities: ["Burlington", "Montpelier"] },
      "Virginia": { cities: ["Virginia Beach", "Richmond", "Arlington"] },
      "Washington": { cities: ["Seattle", "Spokane", "Tacoma"] },
      "West Virginia": { cities: ["Charleston", "Huntington"] },
      "Wisconsin": { cities: ["Milwaukee", "Madison"] },
      "Wyoming": { cities: ["Cheyenne", "Casper"] },
      "District of Columbia": { cities: ["Washington"] }
    }
  },

  // ---------------- SAUDI ARABIA (13 provinces) ----------------
  SA: {
    hasDistrict: false,
    provinces: {
      "Riyadh Province": { cities: ["Riyadh", "Al Kharj", "Diriyah"] },
      "Makkah Province": { cities: ["Jeddah", "Mecca", "Taif"] },
      "Madinah Province": { cities: ["Medina", "Yanbu"] },
      "Qassim Province": { cities: ["Buraydah", "Unaizah"] },
      "Eastern Province": { cities: ["Dammam", "Khobar", "Dhahran", "Jubail"] },
      "Asir Province": { cities: ["Abha", "Khamis Mushait"] },
      "Tabuk Province": { cities: ["Tabuk"] },
      "Hail Province": { cities: ["Hail"] },
      "Northern Borders Province": { cities: ["Arar"] },
      "Jazan Province": { cities: ["Jazan"] },
      "Najran Province": { cities: ["Najran"] },
      "Al Bahah Province": { cities: ["Al Bahah"] },
      "Al Jawf Province": { cities: ["Sakakah"] }
    }
  },

  // ---------------- UNITED ARAB EMIRATES (7 emirates) ----------------
  AE: {
    hasDistrict: false,
    provinces: {
      "Abu Dhabi": { cities: ["Abu Dhabi", "Al Ain"] },
      "Dubai": { cities: ["Dubai"] },
      "Sharjah": { cities: ["Sharjah"] },
      "Ajman": { cities: ["Ajman"] },
      "Umm Al Quwain": { cities: ["Umm Al Quwain"] },
      "Ras Al Khaimah": { cities: ["Ras Al Khaimah"] },
      "Fujairah": { cities: ["Fujairah"] }
    }
  },

  // ---------------- KUWAIT (6 governorates) ----------------
  KW: {
    hasDistrict: false,
    provinces: {
      "Al Asimah (Capital)": { cities: ["Kuwait City"] },
      "Hawalli": { cities: ["Hawalli", "Salmiya"] },
      "Farwaniya": { cities: ["Farwaniya"] },
      "Mubarak Al-Kabeer": { cities: ["Mubarak Al-Kabeer"] },
      "Ahmadi": { cities: ["Ahmadi", "Fahaheel"] },
      "Jahra": { cities: ["Jahra"] }
    }
  },

  // ---------------- QATAR (8 municipalities) ----------------
  QA: {
    hasDistrict: false,
    provinces: {
      "Doha": { cities: ["Doha"] },
      "Al Rayyan": { cities: ["Al Rayyan"] },
      "Al Wakrah": { cities: ["Al Wakrah"] },
      "Al Khor": { cities: ["Al Khor"] },
      "Umm Salal": { cities: ["Umm Salal"] },
      "Al Daayen": { cities: ["Al Daayen"] },
      "Al Shamal": { cities: ["Madinat ash Shamal"] },
      "Al Shahaniya": { cities: ["Al Shahaniya"] }
    }
  },

  // ---------------- BAHRAIN (4 governorates) ----------------
  BH: {
    hasDistrict: false,
    provinces: {
      "Capital Governorate": { cities: ["Manama"] },
      "Muharraq Governorate": { cities: ["Muharraq"] },
      "Northern Governorate": { cities: ["Hamad Town"] },
      "Southern Governorate": { cities: ["Isa Town", "Riffa"] }
    }
  },

  // ---------------- OMAN (11 governorates) ----------------
  OM: {
    hasDistrict: false,
    provinces: {
      "Muscat": { cities: ["Muscat"] },
      "Dhofar": { cities: ["Salalah"] },
      "Musandam": { cities: ["Khasab"] },
      "Al Buraimi": { cities: ["Al Buraimi"] },
      "Ad Dakhiliyah": { cities: ["Nizwa"] },
      "Al Batinah North": { cities: ["Sohar"] },
      "Al Batinah South": { cities: ["Rustaq"] },
      "Ash Sharqiyah North": { cities: ["Ibra"] },
      "Ash Sharqiyah South": { cities: ["Sur"] },
      "Ad Dhahirah": { cities: ["Ibri"] },
      "Al Wusta": { cities: ["Haima"] }
    }
  },

  // ---------------- SRI LANKA (9 provinces) ----------------
  LK: {
    hasDistrict: false,
    provinces: {
      "Western Province": { cities: ["Colombo", "Negombo", "Moratuwa"] },
      "Central Province": { cities: ["Kandy", "Nuwara Eliya"] },
      "Southern Province": { cities: ["Galle", "Matara"] },
      "Northern Province": { cities: ["Jaffna", "Vavuniya"] },
      "Eastern Province": { cities: ["Trincomalee", "Batticaloa"] },
      "North Western Province": { cities: ["Kurunegala", "Puttalam"] },
      "North Central Province": { cities: ["Anuradhapura", "Polonnaruwa"] },
      "Uva Province": { cities: ["Badulla"] },
      "Sabaragamuwa Province": { cities: ["Ratnapura", "Kegalle"] }
    }
  }
};

// ---------------- Helpers ----------------

export function countryHasDistricts(countryIso2) {
  return COUNTRIES_WITH_DISTRICTS.has(countryIso2);
}

export function getProvincesForCountry(countryIso2) {
  const country = LOCATION_DATA[countryIso2];
  return country ? Object.keys(country.provinces) : [];
}

export function getDistrictsForProvince(countryIso2, provinceLabel) {
  const province = LOCATION_DATA[countryIso2]?.provinces?.[provinceLabel];
  return province?.districts ? Object.keys(province.districts) : [];
}

export function getCitiesForDistrict(countryIso2, provinceLabel, districtName) {
  return LOCATION_DATA[countryIso2]?.provinces?.[provinceLabel]?.districts?.[districtName] || [];
}

// For countries with no district layer, get cities straight off the province.
export function getCitiesForProvince(countryIso2, provinceLabel) {
  return LOCATION_DATA[countryIso2]?.provinces?.[provinceLabel]?.cities || [];
}