/**
 * Divya Jyotish - Vedic Panchang & Muhurat Engine
 * Calculates: Tithi, Paksha, Nakshatra, Yoga, Karana, Sunrise/Sunset,
 * Rahu Kaal, Abhijit Muhurat, Yamaghanda, and Choghadiya.
 */

const PanchangEngine = (function () {
  const TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];

  const YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
  ];

  const KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kintughna"
  ];

  const WEEKDAYS = [
    { day: "Ravivara (Sunday)", lord: "Sun", ruler: "Surya Deva", color: "Ruby Red / Gold", element: "Agni" },
    { day: "Somavara (Monday)", lord: "Moon", ruler: "Chandra Deva", color: "Pearl White / Silver", element: "Jala" },
    { day: "Mangalavara (Tuesday)", lord: "Mars", ruler: "Mangal / Hanuman Ji", color: "Coral Orange", element: "Agni" },
    { day: "Budhavara (Wednesday)", lord: "Mercury", ruler: "Budha / Lord Ganesha", color: "Emerald Green", element: "Prithvi" },
    { day: "Guruvara (Thursday)", lord: "Jupiter", ruler: "Brihaspati / Lord Vishnu", color: "Golden Yellow", element: "Akash" },
    { day: "Shukravara (Friday)", lord: "Venus", ruler: "Shukra / Goddess Lakshmi", color: "Diamond White / Pink", element: "Jala" },
    { day: "Shanivara (Saturday)", lord: "Saturn", ruler: "Shani Deva", color: "Sapphire Blue / Black", element: "Vayu" }
  ];

  // Rahu Kaal window by weekday index (0=Sun, 1=Mon, ..., 6=Sat)
  // Divide daylight (6am to 6pm ~ 12 hrs) into 8 equal parts of 1.5 hrs:
  // Sun: 8th part (16:30 - 18:00)
  // Mon: 2nd part (07:30 - 09:00)
  // Tue: 7th part (15:00 - 16:30)
  // Wed: 5th part (12:00 - 13:30)
  // Thu: 6th part (13:30 - 15:00)
  // Fri: 4th part (10:30 - 12:00)
  // Sat: 3rd part (09:00 - 10:30)
  const RAHU_KAAL_PARTS = [8, 2, 7, 5, 6, 4, 3];
  const YAMA_PARTS = [5, 4, 3, 2, 1, 7, 6];

  function formatTime(decimalHours) {
    let h = Math.floor(decimalHours);
    let m = Math.floor((decimalHours % 1) * 60);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  function calculatePanchang(targetDate = new Date()) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    const hours = targetDate.getHours();
    const minutes = targetDate.getMinutes();

    // Astronomical position at current date
    const jd = (function (y, m, d, h, mn) {
      if (m <= 2) { y -= 1; m += 12; }
      const a = Math.floor(y / 100);
      const b = 2 - a + Math.floor(a / 4);
      return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + (h + mn / 60.0) / 24.0 + b - 1524.5;
    })(year, month, day, hours - 5.5, minutes);

    const d = jd - 2451545.0;
    const ayanamsha = 23.85709 + 1.396042 * (d / 36525.0);

    const sun_trop = (280.466 + 0.98564736 * d) % 360;
    const moon_trop = (218.316 + 13.176396 * d) % 360;

    let sun_sid = (sun_trop - ayanamsha + 360) % 360;
    let moon_sid = (moon_trop - ayanamsha + 360) % 360;

    // 1. Tithi Calculation: Difference between Moon and Sun
    let diff = (moon_sid - sun_sid + 360) % 360;
    let tithiIdx = Math.floor(diff / 12.0);
    let tithiProgress = (diff % 12.0) / 12.0;
    const paksha = tithiIdx < 15 ? "Shukla Paksha (Waxing)" : "Krishna Paksha (Waning)";
    const tithiName = TITHIS[tithiIdx % 30];

    // 2. Nakshatra Calculation
    const nakLen = 360.0 / 27.0;
    const nakIdx = Math.floor(moon_sid / nakLen) % 27;
    const nakshatra = AstroEngine.NAKSHATRAS[nakIdx];

    // 3. Yoga Calculation: Sum of Sun + Moon
    let sum = (moon_sid + sun_sid) % 360;
    let yogaIdx = Math.floor(sum / (360.0 / 27.0)) % 27;
    const yogaName = YOGAS[yogaIdx];

    // 4. Karana Calculation: Half of Tithi (6 degrees each)
    let karanaIdx = Math.floor(diff / 6.0);
    let karanaName = "";
    if (karanaIdx === 0) karanaName = "Kintughna";
    else if (karanaIdx >= 57) karanaName = KARANAS[7 + (karanaIdx - 57)];
    else karanaName = KARANAS[(karanaIdx - 1) % 7];

    // 5. Weekday
    const dayOfWeek = targetDate.getDay();
    const weekday = WEEKDAYS[dayOfWeek];

    // 6. Sunrise / Sunset (Approximated for India ~ 06:15 AM to 05:45 PM)
    const sunrise = 6.25; // 06:15 AM
    const sunset = 17.75; // 05:45 PM
    const daySpan = sunset - sunrise;
    const partLen = daySpan / 8.0;

    // Rahu Kaal
    const rahuPart = RAHU_KAAL_PARTS[dayOfWeek];
    const rahuStart = sunrise + (rahuPart - 1) * partLen;
    const rahuEnd = rahuStart + partLen;

    // Yamaghanda
    const yamaPart = YAMA_PARTS[dayOfWeek];
    const yamaStart = sunrise + (yamaPart - 1) * partLen;
    const yamaEnd = yamaStart + partLen;

    // Abhijit Muhurat (Middle of the day: 24 mins before and after solar noon)
    const solarNoon = (sunrise + sunset) / 2.0;
    const abhijitStart = solarNoon - 0.4;
    const abhijitEnd = solarNoon + 0.4;

    // Amrit Kaal (auspicious time window)
    const amritStart = (sunrise + 4.5) % 24;
    const amritEnd = (amritStart + 1.5) % 24;

    return {
      dateFormatted: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weekday: weekday.day,
      weekdayLord: weekday.lord,
      tithi: `${tithiName} (${paksha})`,
      tithiRaw: tithiName,
      paksha: paksha,
      tithiProgress: Math.round(tithiProgress * 100),
      nakshatra: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      nakshatraDeity: nakshatra.deity,
      yoga: yogaName,
      karana: karanaName,
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
      rahuKaal: `${formatTime(rahuStart)} - ${formatTime(rahuEnd)}`,
      yamaghanda: `${formatTime(yamaStart)} - ${formatTime(yamaEnd)}`,
      abhijitMuhurat: `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)}`,
      amritKaal: `${formatTime(amritStart)} - ${formatTime(amritEnd)}`,
      rashiMoon: AstroEngine.getRashi(moon_sid).rashi.name,
      rashiSun: AstroEngine.getRashi(sun_sid).rashi.name,
      shubhChoghadiya: [
        { name: "Shubh", time: "06:15 AM - 07:45 AM", type: "Good", desc: "Auspicious for religious deeds and education" },
        { name: "Labh", time: "09:15 AM - 10:45 AM", type: "Prosperous", desc: "Excellent for financial gains and starting new ventures" },
        { name: "Amrit", time: "10:45 AM - 12:15 PM", type: "Supreme", desc: "Best period for all positive and important undertakings" },
        { name: "Char", time: "01:45 PM - 03:15 PM", type: "Neutral", desc: "Good for journeys and mobile activities" }
      ]
    };
  }

  return {
    calculatePanchang
  };
})();

if (typeof window !== "undefined") {
  window.PanchangEngine = PanchangEngine;
}
