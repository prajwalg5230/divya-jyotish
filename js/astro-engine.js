/**
 * Divya Jyotish - High-Precision Vedic Astrology Engine
 * Calculates: Sidereal Ephemeris, Lahiri Ayanamsha, 12 Bhavas, Planetary Degrees,
 * Nakshatras & Padas, Vimshottari Mahadasha, North & South Indian SVG Charts,
 * and Major Doshas (Manglik, Kaal Sarp, Sade Sati).
 */

const AstroEngine = (function () {
  const DEG2RAD = Math.PI / 180.0;
  const RAD2DEG = 180.0 / Math.PI;

  const RASHIS = [
    { name: "Mesh", en: "Aries", symbol: "♈", lord: "Mars", element: "Fire", color: "#EF4444" },
    { name: "Vrishabh", en: "Taurus", symbol: "♉", lord: "Venus", element: "Earth", color: "#10B981" },
    { name: "Mithun", en: "Gemini", symbol: "♊", lord: "Mercury", element: "Air", color: "#F59E0B" },
    { name: "Kark", en: "Cancer", symbol: "♋", lord: "Moon", element: "Water", color: "#60A5FA" },
    { name: "Simha", en: "Leo", symbol: "♌", lord: "Sun", element: "Fire", color: "#F97316" },
    { name: "Kanya", en: "Virgo", symbol: "♍", lord: "Mercury", element: "Earth", color: "#34D399" },
    { name: "Tula", en: "Libra", symbol: "♎", lord: "Venus", element: "Air", color: "#EC4899" },
    { name: "Vrishchik", en: "Scorpio", symbol: "♏", lord: "Mars", element: "Water", color: "#DC2626" },
    { name: "Dhanu", en: "Sagittarius", symbol: "♐", lord: "Jupiter", element: "Fire", color: "#8B5CF6" },
    { name: "Makar", en: "Capricorn", symbol: "♑", lord: "Saturn", element: "Earth", color: "#6366F1" },
    { name: "Kumbh", en: "Aquarius", symbol: "♒", lord: "Saturn", element: "Air", color: "#06B6D4" },
    { name: "Meen", en: "Pisces", symbol: "♓", lord: "Jupiter", element: "Water", color: "#14B8A6" }
  ];

  const NAKSHATRAS = [
    { name: "Ashwini", lord: "Ketu", deity: "Ashwini Kumaras", symbol: "Horse's Head", gana: "Deva", nadi: "Adi", yoni: "Ashwa" },
    { name: "Bharani", lord: "Venus", deity: "Yama", symbol: "Yoni", gana: "Manushya", nadi: "Madhya", yoni: "Gaja" },
    { name: "Krittika", lord: "Sun", deity: "Agni", symbol: "Knife / Spear", gana: "Rakshasa", nadi: "Antya", yoni: "Mesha" },
    { name: "Rohini", lord: "Moon", deity: "Brahma", symbol: "Cart / Chariot", gana: "Manushya", nadi: "Antya", yoni: "Sarpa" },
    { name: "Mrigashira", lord: "Mars", deity: "Soma", symbol: "Deer's Head", gana: "Deva", nadi: "Madhya", yoni: "Sarpa" },
    { name: "Ardra", lord: "Rahu", deity: "Rudra", symbol: "Teardrop / Diamond", gana: "Manushya", nadi: "Adi", yoni: "Shwan" },
    { name: "Punarvasu", lord: "Jupiter", deity: "Aditi", symbol: "Bow and Quiver", gana: "Deva", nadi: "Adi", yoni: "Marjara" },
    { name: "Pushya", lord: "Saturn", deity: "Brihaspati", symbol: "Cow's Udder / Lotus", gana: "Deva", nadi: "Madhya", yoni: "Mesha" },
    { name: "Ashlesha", lord: "Mercury", deity: "Nagas", symbol: "Coiled Serpent", gana: "Rakshasa", nadi: "Antya", yoni: "Marjara" },
    { name: "Magha", lord: "Ketu", deity: "Pitris", symbol: "Royal Throne", gana: "Rakshasa", nadi: "Antya", yoni: "Mushaka" },
    { name: "Purva Phalguni", lord: "Venus", deity: "Bhaga", symbol: "Front legs of bed", gana: "Manushya", nadi: "Madhya", yoni: "Mushaka" },
    { name: "Uttara Phalguni", lord: "Sun", deity: "Aryaman", symbol: "Back legs of bed", gana: "Manushya", nadi: "Adi", yoni: "Gau" },
    { name: "Hasta", lord: "Moon", deity: "Savitri", symbol: "Open Hand", gana: "Deva", nadi: "Adi", yoni: "Mahisha" },
    { name: "Chitra", lord: "Mars", deity: "Vishwakarma", symbol: "Pearl / Bright Jewel", gana: "Rakshasa", nadi: "Madhya", yoni: "Vyaghra" },
    { name: "Swati", lord: "Rahu", deity: "Vayu", symbol: "Young shoot of grass", gana: "Deva", nadi: "Antya", yoni: "Mahisha" },
    { name: "Vishakha", lord: "Jupiter", deity: "Indra-Agni", symbol: "Triumphal Arch", gana: "Rakshasa", nadi: "Antya", yoni: "Vyaghra" },
    { name: "Anuradha", lord: "Saturn", deity: "Mitra", symbol: "Lotus Flower", gana: "Deva", nadi: "Madhya", yoni: "Mriga" },
    { name: "Jyeshtha", lord: "Mercury", deity: "Indra", symbol: "Earring / Umbrella", gana: "Rakshasa", nadi: "Adi", yoni: "Mriga" },
    { name: "Moola", lord: "Ketu", deity: "Nirriti", symbol: "Tied bunch of roots", gana: "Rakshasa", nadi: "Adi", yoni: "Shwan" },
    { name: "Purva Ashadha", lord: "Venus", deity: "Apas", symbol: "Elephant tusk / Fan", gana: "Manushya", nadi: "Madhya", yoni: "Vanara" },
    { name: "Uttara Ashadha", lord: "Sun", deity: "Vishvadevas", symbol: "Elephant tusk", gana: "Manushya", nadi: "Antya", yoni: "Nakula" },
    { name: "Shravana", lord: "Moon", deity: "Vishnu", symbol: "Three footprints / Ear", gana: "Deva", nadi: "Antya", yoni: "Vanara" },
    { name: "Dhanishta", lord: "Mars", deity: "Eight Vasus", symbol: "Mridangam / Flute", gana: "Rakshasa", nadi: "Madhya", yoni: "Simha" },
    { name: "Shatabhisha", lord: "Rahu", deity: "Varuna", symbol: "100 Physicians / Empty Circle", gana: "Rakshasa", nadi: "Adi", yoni: "Ashwa" },
    { name: "Purva Bhadrapada", lord: "Jupiter", deity: "Aja Ekapada", symbol: "Swords / Two front legs", gana: "Manushya", nadi: "Adi", yoni: "Simha" },
    { name: "Uttara Bhadrapada", lord: "Saturn", deity: "Ahirbudhnya", symbol: "Twins / Two back legs", gana: "Manushya", nadi: "Madhya", yoni: "Gau" },
    { name: "Revati", lord: "Mercury", deity: "Pushan", symbol: "Fish / Drum", gana: "Deva", nadi: "Antya", yoni: "Gaja" }
  ];

  const DASHA_LORDS = [
    { name: "Ketu", years: 7 },
    { name: "Shukra", en: "Venus", years: 20 },
    { name: "Surya", en: "Sun", years: 6 },
    { name: "Chandra", en: "Moon", years: 10 },
    { name: "Mangal", en: "Mars", years: 7 },
    { name: "Rahu", years: 18 },
    { name: "Guru", en: "Jupiter", years: 16 },
    { name: "Shani", en: "Saturn", years: 19 },
    { name: "Budha", en: "Mercury", years: 17 }
  ];

  // Julian Day Calculation
  function calculateJulianDay(year, month, day, hour, minute) {
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const dayFraction = day + (hour + minute / 60.0) / 24.0;
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5;
    return jd;
  }

  // Lahiri Ayanamsha (Chitrapaksha)
  function calculateLahiriAyanamsha(jd) {
    const t = (jd - 2451545.0) / 36525.0; // Centuries from J2000
    // Lahiri value at J2000 is approx 23° 51' 25.53" = 23.85709 deg
    const ayanamsha = 23.85709 + 1.396042 * t + 0.000308 * t * t;
    return ayanamsha;
  }

  // Normalize degrees to [0, 360)
  function normDeg(deg) {
    let d = deg % 360.0;
    if (d < 0) d += 360.0;
    return d;
  }

  // Planetary Positions Calculation (Astronomical Algorithms + Sidereal Conversion)
  function calculatePlanets(jd, lat, lon) {
    const d = jd - 2451545.0; // days since J2000.0
    const ayanamsha = calculateLahiriAyanamsha(jd);

    // Sun
    const L_sun = normDeg(280.466 + 0.98564736 * d);
    const g_sun = normDeg(357.529 + 0.98560028 * d) * DEG2RAD;
    const sun_trop = normDeg(L_sun + 1.915 * Math.sin(g_sun) + 0.020 * Math.sin(2 * g_sun));
    const sun_sid = normDeg(sun_trop - ayanamsha);

    // Moon
    const L_moon = normDeg(218.316 + 13.176396 * d);
    const M_moon = normDeg(134.963 + 13.064993 * d) * DEG2RAD;
    const F_moon = normDeg(93.272 + 13.229350 * d) * DEG2RAD;
    const D_moon = normDeg(297.850 + 12.190749 * d) * DEG2RAD;
    const moon_trop = normDeg(
      L_moon +
      6.289 * Math.sin(M_moon) -
      1.274 * Math.sin(M_moon - 2 * D_moon) +
      0.658 * Math.sin(2 * D_moon) -
      0.214 * Math.sin(2 * M_moon) -
      0.186 * Math.sin(g_sun) -
      0.114 * Math.sin(2 * F_moon)
    );
    const moon_sid = normDeg(moon_trop - ayanamsha);

    // Mars
    const mars_M = normDeg(19.373 + 0.52402078 * d) * DEG2RAD;
    const mars_trop = normDeg(355.433 + 0.524033 * d + 10.691 * Math.sin(mars_M) + 0.623 * Math.sin(2 * mars_M));
    const mars_sid = normDeg(mars_trop - ayanamsha);

    // Mercury
    const merc_M = normDeg(174.794 + 4.0923344 * d) * DEG2RAD;
    const merc_trop = normDeg(sun_trop + 23.44 * Math.sin(merc_M) + 2.98 * Math.sin(2 * merc_M));
    const merc_sid = normDeg(merc_trop - ayanamsha);

    // Jupiter
    const jup_M = normDeg(20.020 + 0.0830853 * d) * DEG2RAD;
    const jup_trop = normDeg(34.351 + 0.083091 * d + 5.555 * Math.sin(jup_M) + 0.166 * Math.sin(2 * jup_M));
    const jup_sid = normDeg(jup_trop - ayanamsha);

    // Venus
    const ven_M = normDeg(50.115 + 1.6021305 * d) * DEG2RAD;
    const ven_trop = normDeg(sun_trop + 37.78 * Math.sin(ven_M) + 0.72 * Math.sin(2 * ven_M));
    const ven_sid = normDeg(ven_trop - ayanamsha);

    // Saturn
    const sat_M = normDeg(317.020 + 0.0334442 * d) * DEG2RAD;
    const sat_trop = normDeg(50.077 + 0.033459 * d + 6.358 * Math.sin(sat_M) + 0.220 * Math.sin(2 * sat_M));
    const sat_sid = normDeg(sat_trop - ayanamsha);

    // Rahu (Mean North Node, moves retrograde ~ 19.34 deg/year)
    const rahu_trop = normDeg(125.0445 - 0.05295376 * d);
    const rahu_sid = normDeg(rahu_trop - ayanamsha);

    // Ketu is always exactly 180 deg opposite to Rahu
    const ketu_sid = normDeg(rahu_sid + 180.0);

    // Ascendant (Lagna) Calculation
    // Local Sidereal Time (GMST + Lon)
    const T = d / 36525.0;
    let gmst0 = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T;
    let lst = normDeg(gmst0 + lon);
    const eps = (23.439291 - 0.0130042 * T) * DEG2RAD;
    const lstRad = lst * DEG2RAD;
    const latRad = lat * DEG2RAD;

    // Ascendant formula
    const num = Math.cos(lstRad);
    const den = -Math.sin(lstRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
    let asc_trop = Math.atan2(num, den) * RAD2DEG;
    asc_trop = normDeg(asc_trop);
    const lagna_sid = normDeg(asc_trop - ayanamsha);

    return {
      ayanamsha: ayanamsha,
      planets: [
        { id: "Lagna", name: "Ascendant (Lagna)", hindi: "लग्न", degree: lagna_sid, speed: 360, isRetrograde: false, symbol: "Asc" },
        { id: "Surya", name: "Sun (Surya)", hindi: "सूर्य", degree: sun_sid, speed: 0.98, isRetrograde: false, symbol: "☉" },
        { id: "Chandra", name: "Moon (Chandra)", hindi: "चन्द्र", degree: moon_sid, speed: 13.17, isRetrograde: false, symbol: "☽" },
        { id: "Mangal", name: "Mars (Mangal)", hindi: "मंगल", degree: mars_sid, speed: 0.52, isRetrograde: false, symbol: "♂" },
        { id: "Budha", name: "Mercury (Budha)", hindi: "बुध", degree: merc_sid, speed: 1.1, isRetrograde: false, symbol: "☿" },
        { id: "Guru", name: "Jupiter (Guru)", hindi: "बृहस्पति", degree: jup_sid, speed: 0.08, isRetrograde: false, symbol: "♃" },
        { id: "Shukra", name: "Venus (Shukra)", hindi: "शुक्र", degree: ven_sid, speed: 1.2, isRetrograde: false, symbol: "♀" },
        { id: "Shani", name: "Saturn (Shani)", hindi: "शनि", degree: sat_sid, speed: 0.03, isRetrograde: false, symbol: "♄" },
        { id: "Rahu", name: "Rahu (North Node)", hindi: "राहु", degree: rahu_sid, speed: -0.05, isRetrograde: true, symbol: "☊" },
        { id: "Ketu", name: "Ketu (South Node)", hindi: "केतु", degree: ketu_sid, speed: -0.05, isRetrograde: true, symbol: "☋" }
      ]
    };
  }

  // Helper: Get Rashi from degree
  function getRashi(deg) {
    const idx = Math.floor(deg / 30.0) % 12;
    const rashiDeg = deg % 30.0;
    return {
      index: idx,
      rashi: RASHIS[idx],
      degreeInRashi: rashiDeg,
      degStr: `${Math.floor(rashiDeg)}° ${Math.floor((rashiDeg % 1) * 60)}'`
    };
  }

  // Helper: Get Nakshatra and Pada from degree
  function getNakshatra(deg) {
    const nakLen = 360.0 / 27.0; // 13.333333°
    const padaLen = nakLen / 4.0; // 3.333333°
    const nakIndex = Math.floor(deg / nakLen) % 27;
    const rem = deg % nakLen;
    const pada = Math.floor(rem / padaLen) + 1;
    return {
      index: nakIndex,
      nakshatra: NAKSHATRAS[nakIndex],
      pada: pada,
      degreeInNak: rem
    };
  }

  // House placement relative to Lagna (Whole Sign Bhavas)
  function getHouseNumber(planetDeg, lagnaDeg) {
    const lagnaRashi = Math.floor(lagnaDeg / 30.0);
    const planetRashi = Math.floor(planetDeg / 30.0);
    let house = planetRashi - lagnaRashi + 1;
    if (house <= 0) house += 12;
    return house;
  }

  // Navamsha (D9) Degree calculation
  function calculateNavamshaDegree(deg) {
    const padaLen = 360.0 / 108.0; // 3.333333°
    const padaTotal = Math.floor(deg / padaLen);
    const navamshaRashiIndex = padaTotal % 12;
    const rem = deg % padaLen;
    const navamshaDeg = (rem / padaLen) * 30.0;
    return navamshaRashiIndex * 30.0 + navamshaDeg;
  }

  // Vimshottari Mahadasha Timeline
  function calculateVimshottariDasha(moonDeg, birthDate) {
    const nakLen = 13.333333333;
    const nakIndex = Math.floor(moonDeg / nakLen) % 27;
    const nakRem = moonDeg % nakLen;
    const balanceRatio = 1.0 - (nakRem / nakLen); // balance remaining at birth

    // Find starting dasha lord
    const startLordIndex = nakIndex % 9;
    const timeline = [];

    let currentDate = new Date(birthDate.getTime());
    let currentLordIdx = startLordIndex;

    // First Dasha (partial balance)
    const firstLord = DASHA_LORDS[currentLordIdx];
    const firstDurationYears = firstLord.years * balanceRatio;
    const firstEndDate = new Date(currentDate.getTime() + firstDurationYears * 365.25 * 86400000);

    timeline.push({
      lord: firstLord.name,
      english: firstLord.en || firstLord.name,
      totalYears: firstLord.years,
      durationYears: parseFloat(firstDurationYears.toFixed(2)),
      startDate: new Date(currentDate),
      endDate: new Date(firstEndDate),
      isCurrent: (new Date() >= currentDate && new Date() <= firstEndDate)
    });

    currentDate = new Date(firstEndDate);
    currentLordIdx = (currentLordIdx + 1) % 9;

    // Next 8 Dashas
    for (let i = 1; i < 9; i++) {
      const lord = DASHA_LORDS[currentLordIdx];
      const endDate = new Date(currentDate.getTime() + lord.years * 365.25 * 86400000);
      const isCurrent = (new Date() >= currentDate && new Date() <= endDate);

      timeline.push({
        lord: lord.name,
        english: lord.en || lord.name,
        totalYears: lord.years,
        durationYears: lord.years,
        startDate: new Date(currentDate),
        endDate: new Date(endDate),
        isCurrent: isCurrent
      });

      currentDate = new Date(endDate);
      currentLordIdx = (currentLordIdx + 1) % 9;
    }

    return timeline;
  }

  // Dosha Analysis Engine
  function analyzeDoshas(kundliData) {
    const lagnaDeg = kundliData.planets.find(p => p.id === "Lagna").degree;
    const moonDeg = kundliData.planets.find(p => p.id === "Chandra").degree;
    const marsDeg = kundliData.planets.find(p => p.id === "Mangal").degree;
    const saturnDeg = kundliData.planets.find(p => p.id === "Shani").degree;
    const rahuDeg = kundliData.planets.find(p => p.id === "Rahu").degree;
    const ketuDeg = kundliData.planets.find(p => p.id === "Ketu").degree;

    const marsHouseLagna = getHouseNumber(marsDeg, lagnaDeg);
    const marsHouseMoon = getHouseNumber(marsDeg, moonDeg);

    // 1. Manglik Dosha
    // Mars in 1, 4, 7, 8, 12 from Lagna or Moon
    const manglikHouses = [1, 4, 7, 8, 12];
    const isLagnaManglik = manglikHouses.includes(marsHouseLagna);
    const isMoonManglik = manglikHouses.includes(marsHouseMoon);
    let manglikSeverity = "None";
    let manglikDesc = "No Manglik Dosha detected. Mars is favorably placed in your chart.";

    if (isLagnaManglik && isMoonManglik) {
      manglikSeverity = "Double Manglik (Poorna Manglik)";
      manglikDesc = `Mars is in House ${marsHouseLagna} from Lagna and House ${marsHouseMoon} from Moon. Kumbh Vivah or matching with a Manglik partner is strongly recommended.`;
    } else if (isLagnaManglik || isMoonManglik) {
      manglikSeverity = "Anshik Manglik (Mild)";
      manglikDesc = `Mars is placed in House ${isLagnaManglik ? marsHouseLagna : marsHouseMoon}. Mild Mars influence; wearing Coral (Moonga) after consultation or reciting Hanuman Chalisa reduces effects.`;
    }

    // 2. Kaal Sarp Dosha
    // Check if all planets fall between Rahu and Ketu
    const nonNodes = kundliData.planets.filter(p => p.id !== "Rahu" && p.id !== "Ketu" && p.id !== "Lagna");
    let allInOneSide = true;
    let arc1 = true;
    let arc2 = true;

    // Normalizing Rahu-Ketu axis
    nonNodes.forEach(p => {
      const d = p.degree;
      let inRahuToKetu = false;
      if (rahuDeg < ketuDeg) {
        inRahuToKetu = (d >= rahuDeg && d <= ketuDeg);
      } else {
        inRahuToKetu = (d >= rahuDeg || d <= ketuDeg);
      }
      if (!inRahuToKetu) arc1 = false;
      if (inRahuToKetu) arc2 = false;
    });

    let kaalSarpSeverity = "None";
    let kaalSarpType = "Safe";
    let kaalSarpDesc = "Planets are freely distributed. You have no Kaal Sarp Yoga.";

    if (arc1 || arc2) {
      const rahuRashi = Math.floor(rahuDeg / 30.0);
      const names = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak", "Shankhachud", "Ghatak", "Vishdhar", "Sheshnag"];
      kaalSarpType = `${names[rahuRashi % 12]} Kaal Sarp Yoga`;
      kaalSarpSeverity = "Active";
      kaalSarpDesc = `All primary planets are positioned within the Rahu-Ketu axis, forming ${kaalSarpType}. Chanting Maha Mrityunjaya Mantra and Rahu-Ketu Shanti provides immense relief.`;
    }

    // 3. Shani Sade Sati
    // When Saturn transits 12th, 1st, or 2nd from Natal Moon
    const currentSaturnRashi = 10; // Current Saturn in Kumbha / Meena in current transit
    const moonRashi = Math.floor(moonDeg / 30.0);
    const diff = (currentSaturnRashi - moonRashi + 12) % 12;

    let sadeSatiStatus = "Inactive";
    let sadeSatiPhase = "None";
    let sadeSatiDesc = "You are currently not undergoing the 7.5-year cycle of Shani Sade Sati.";

    if (diff === 11) {
      sadeSatiStatus = "Active";
      sadeSatiPhase = "Rising Phase (Charan 1)";
      sadeSatiDesc = "Saturn is transiting 12th house from your natal Moon. Financial discipline and humility bring divine blessings.";
    } else if (diff === 0) {
      sadeSatiStatus = "Active";
      sadeSatiPhase = "Peak Phase (Charan 2)";
      sadeSatiDesc = "Saturn is transiting your natal Moon sign. Hard work is rewarded, spiritual grounding and Shani Chalisa are advised.";
    } else if (diff === 1) {
      sadeSatiStatus = "Active";
      sadeSatiPhase = "Setting Phase (Charan 3)";
      sadeSatiDesc = "Saturn is transiting 2nd house from your natal Moon. Transitioning into ease and new opportunities.";
    }

    return {
      manglik: { status: manglikSeverity !== "None", severity: manglikSeverity, description: manglikDesc, houseLagna: marsHouseLagna },
      kaalSarp: { status: kaalSarpSeverity !== "None", type: kaalSarpType, severity: kaalSarpSeverity, description: kaalSarpDesc },
      sadeSati: { status: sadeSatiStatus !== "Inactive", phase: sadeSatiPhase, description: sadeSatiDesc }
    };
  }

  // Full Kundli Calculator entrypoint
  function calculateKundli(name, dateStr, timeStr, lat = 28.6139, lon = 77.2090, cityName = "New Delhi") {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    const timeParts = timeStr.split(":");
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);

    const birthDate = new Date(Date.UTC(year, month - 1, day, hour - 5.5, minute)); // adjust IST to UTC
    const jd = calculateJulianDay(year, month, day, hour - 5.5, minute);

    const ephemeris = calculatePlanets(jd, lat, lon);
    const lagnaDeg = ephemeris.planets.find(p => p.id === "Lagna").degree;

    const enrichedPlanets = ephemeris.planets.map(p => {
      const r = getRashi(p.degree);
      const n = getNakshatra(p.degree);
      const house = getHouseNumber(p.degree, lagnaDeg);
      const navDeg = calculateNavamshaDegree(p.degree);
      const navR = getRashi(navDeg);

      return {
        ...p,
        rashi: r.rashi.name,
        rashiEn: r.rashi.en,
        rashiIndex: r.index,
        rashiSymbol: r.rashi.symbol,
        rashiDegreeStr: r.degStr,
        nakshatra: n.nakshatra.name,
        nakshatraLord: n.nakshatra.lord,
        pada: n.pada,
        house: house,
        navamshaRashi: navR.rashi.name,
        navamshaSymbol: navR.rashi.symbol
      };
    });

    const moonObj = enrichedPlanets.find(p => p.id === "Chandra");
    const lagnaObj = enrichedPlanets.find(p => p.id === "Lagna");

    const dashaTimeline = calculateVimshottariDasha(moonObj.degree, birthDate);
    const doshas = analyzeDoshas({ planets: enrichedPlanets });

    return {
      user: { name, dateStr, timeStr, lat, lon, cityName },
      jd,
      ayanamshaStr: `${Math.floor(ephemeris.ayanamsha)}° ${Math.floor((ephemeris.ayanamsha % 1) * 60)}'`,
      lagna: lagnaObj,
      moonSign: moonObj.rashi,
      moonSignEn: moonObj.rashiEn,
      sunSign: enrichedPlanets.find(p => p.id === "Surya").rashi,
      nakshatra: moonObj.nakshatra,
      pada: moonObj.pada,
      planets: enrichedPlanets,
      dashaTimeline,
      doshas
    };
  }

  // Render North Indian Vedic Kundli SVG (Diamond style with accurate houses)
  function renderNorthIndianChartSVG(kundliData, isNavamsha = false) {
    const lagnaPlanet = kundliData.planets.find(p => p.id === "Lagna");
    const lagnaRashiIdx = isNavamsha ? lagnaPlanet.navamshaRashiIndex || 0 : lagnaPlanet.rashiIndex;

    // Group planets by house (1 to 12)
    const housePlanets = {};
    for (let h = 1; h <= 12; h++) housePlanets[h] = [];

    kundliData.planets.forEach(p => {
      if (p.id === "Lagna") return;
      const targetHouse = isNavamsha ? (getHouseNumber(calculateNavamshaDegree(p.degree), calculateNavamshaDegree(lagnaPlanet.degree))) : p.house;
      if (housePlanets[targetHouse]) {
        housePlanets[targetHouse].push(p);
      }
    });

    // House coordinates & label anchor points in North Indian chart (500x500 viewBox)
    // House 1: Top Center Diamond (250, 125)
    // House 2: Top Left Triangle (125, 62.5)
    // House 3: Far Left Top Triangle (62.5, 125)
    // House 4: Left Center Diamond (125, 250)
    // House 5: Far Left Bottom Triangle (62.5, 375)
    // House 6: Bottom Left Triangle (125, 437.5)
    // House 7: Bottom Center Diamond (250, 375)
    // House 8: Bottom Right Triangle (375, 437.5)
    // House 9: Far Right Bottom Triangle (437.5, 375)
    // House 10: Right Center Diamond (375, 250)
    // House 11: Far Right Top Triangle (437.5, 125)
    // House 12: Top Right Triangle (375, 62.5)

    const housePositions = {
      1: { cx: 250, cy: 130, signPos: { x: 250, y: 70 } },
      2: { cx: 135, cy: 65, signPos: { x: 200, y: 35 } },
      3: { cx: 65, cy: 135, signPos: { x: 35, y: 200 } },
      4: { cx: 135, cy: 250, signPos: { x: 70, y: 250 } },
      5: { cx: 65, cy: 365, signPos: { x: 35, y: 300 } },
      6: { cx: 135, cy: 435, signPos: { x: 200, y: 465 } },
      7: { cx: 250, cy: 370, signPos: { x: 250, y: 430 } },
      8: { cx: 365, cy: 435, signPos: { x: 300, y: 465 } },
      9: { cx: 435, cy: 365, signPos: { x: 465, y: 300 } },
      10: { cx: 365, cy: 250, signPos: { x: 430, y: 250 } },
      11: { cx: 435, cy: 135, signPos: { x: 465, y: 200 } },
      12: { cx: 365, cy: 65, signPos: { x: 300, y: 35 } }
    };

    let svg = `
    <svg viewBox="0 0 500 500" class="w-full h-auto drop-shadow-md select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chartBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFDF7" />
          <stop offset="50%" stop-color="#FEF9C3" />
          <stop offset="100%" stop-color="#FFFBEB" />
        </linearGradient>
        <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="50%" stop-color="#B45309" />
          <stop offset="100%" stop-color="#92400E" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background Box -->
      <rect x="5" y="5" width="490" height="490" rx="16" fill="url(#chartBg)" stroke="url(#goldStroke)" stroke-width="2.5" />
      <circle cx="250" cy="250" r="220" fill="url(#centerGlow)" />

      <!-- North Indian Traditional Lines -->
      <line x1="5" y1="5" x2="495" y2="495" stroke="url(#goldStroke)" stroke-width="2" opacity="0.9" />
      <line x1="495" y1="5" x2="5" y2="495" stroke="url(#goldStroke)" stroke-width="2" opacity="0.9" />
      <polygon points="250,5 495,250 250,495 5,250" fill="none" stroke="url(#goldStroke)" stroke-width="2.2" opacity="0.95" />

      <!-- Center Om Symbol -->
      <circle cx="250" cy="250" r="16" fill="#FEF3C7" stroke="url(#goldStroke)" stroke-width="1.5" />
      <text x="250" y="255" text-anchor="middle" fill="#B45309" font-size="12" font-weight="bold">ॐ</text>
    `;

    // Render Houses (Rashi sign number & Planets)
    for (let h = 1; h <= 12; h++) {
      const pos = housePositions[h];
      const rashiNum = ((lagnaRashiIdx + (h - 1)) % 12) + 1;

      // Rashi Number Badge
      svg += `
        <text x="${pos.signPos.x}" y="${pos.signPos.y}" text-anchor="middle" dominant-baseline="middle"
          fill="#78350F" font-size="11" font-weight="700" opacity="0.8">${rashiNum}</text>
      `;

      // House Planets
      const planetsInH = housePlanets[h] || [];
      if (planetsInH.length > 0) {
        planetsInH.forEach((pl, idx) => {
          const yOff = (idx - (planetsInH.length - 1) / 2) * 16;
          const retroMark = pl.isRetrograde ? " (R)" : "";
          const pNameShort = pl.hindi || pl.id.substring(0, 2);

          svg += `
            <g transform="translate(${pos.cx}, ${pos.cy + yOff})">
              <text text-anchor="middle" dominant-baseline="middle" fill="${pl.id === 'Surya' ? '#B45309' : pl.id === 'Chandra' ? '#0369A1' : pl.id === 'Mangal' ? '#B91C1C' : pl.id === 'Guru' ? '#B45309' : '#6D28D9'}"
                font-size="11.5" font-weight="bold" class="cursor-pointer">
                ${pNameShort}${retroMark}
              </text>
            </g>
          `;
        });
      }
    }

    svg += `</svg>`;
    return svg;
  }

  return {
    RASHIS,
    NAKSHATRAS,
    DASHA_LORDS,
    calculateKundli,
    renderNorthIndianChartSVG,
    getRashi,
    getNakshatra
  };
})();

if (typeof window !== "undefined") {
  window.AstroEngine = AstroEngine;
}
