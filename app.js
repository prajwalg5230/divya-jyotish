/**
 * Divya Jyotish - Master Application Controller
 * Wires up AstroTalk-grade Light Mode UI, 32 Verified Astrologers,
 * Someday AI RAG Cognitive Engine, Gemini API Key Rotation, 3D Tarot,
 * Kundli calculations, Panchang, 36 Gun Milan, and 108 Jaap Mala.
 */

// -------------------------------------------------------------
// GLOBAL STATE VARIABLES (HOISTED AT TOP TO AVOID TDZ ERRORS)
// -------------------------------------------------------------
var currentAstroCategory = "all";
var currentAstroSearch = "";
var currentAstroSort = "popular";
var activeChatAstrologer = null;
var activeRashiIndex = 0;
var beadCount = 0;
var malaRounds = 0;

var chatTimerInterval = null;
var chatElapsedSeconds = 0;

var audioCallInterval = null;
var audioCallSeconds = 0;
var isAudioCallMuted = false;
var isAudioCallSpeaker = false;

// Safe Lucide Icon Renderer
function safeLucide() {
  if (typeof window !== "undefined" && window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch (e) {
      console.warn("Lucide render error:", e);
    }
  }
}

// -------------------------------------------------------------
// HOROSCOPE DATA (12 RASHIS - LIGHT MODE READY)
// -------------------------------------------------------------
const HOROSCOPE_DATA = [
  {
    rashi: "मेष (Mesh)", en: "Aries", dates: "Mar 21 - Apr 19", symbol: "♈", element: "Fire", energy: 94,
    overview: "आज का दिन साहस और नई ऊर्जा से परिपूर्ण रहेगा। कार्यक्षेत्र में आपके निर्णय सराहे जाएंगे। आत्मविश्वास के बल पर आप लंबित कार्यों को पूर्ण करेंगे।",
    love: "साथी के साथ मधुर संवाद रहेगा। शाम को सुखद बातचीत के योग हैं।",
    career: "उच्च अधिकारियों का सहयोग प्राप्त होगा। व्यापार में नए अनुबंध पर हस्ताक्षर हो सकते हैं।",
    health: "ऊर्जा का स्तर उच्च रहेगा। पर्याप्त जल पिएं।",
    luckyNumber: "9", luckyColor: "केसरिया (Saffron)", luckyTime: "09:30 AM - 11:00 AM", mantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः"
  },
  {
    rashi: "वृषभ (Vrishabh)", en: "Taurus", dates: "Apr 20 - May 20", symbol: "♉", element: "Earth", energy: 89,
    overview: "आर्थिक रूप से आज का दिन अत्यंत शुभ है। सुख-सुविधाओं में वृद्धि होगी और परिवार में उत्सव जैसा वातावरण रहेगा।",
    love: "दांपत्य जीवन में स्थायित्व और सामंजस्य बना रहेगा।",
    career: "वित्तीय लेन-देन में भारी लाभ के संकेत हैं। कला और डिजाइन में तरक्की होगी।",
    health: "गले और खान-पान का विशेष ध्यान रखें।",
    luckyNumber: "6", luckyColor: "गुलाबी (Pink)", luckyTime: "02:15 PM - 03:45 PM", mantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः"
  },
  {
    rashi: "मिथुन (Mithun)", en: "Gemini", dates: "May 21 - Jun 20", symbol: "♊", element: "Air", energy: 96,
    overview: "बुद्धि और वाकपटुता आज आपकी सबसे बड़ी शक्ति बनेगी। आपकी बातचीत से नए रास्ते खुलेंगे।",
    love: "दिल की बात साझा करने के लिए आज का दिन सर्वोत्तम है।",
    career: "मार्केटिंग, आईटी और सेल्स में बड़ी डील फाइनल होने के योग हैं।",
    health: "मानसिक रूप से तरोताजा महसूस करेंगे।",
    luckyNumber: "5", luckyColor: "हल्का हरा (Emerald)", luckyTime: "11:00 AM - 12:30 PM", mantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः"
  },
  {
    rashi: "कर्क (Kark)", en: "Cancer", dates: "Jun 21 - Jul 22", symbol: "♋", element: "Water", energy: 86,
    overview: "भावनात्मक रूप से संतुलित रहने का प्रयास करें। परिवार का पूरा सहयोग मिलेगा।",
    love: "साथी की भावनाओं का आदर करें। छोटी बातों पर तनाव से बचें।",
    career: "सरकारी काम या वरिष्ठों के सहयोग से प्रोजेक्ट गति पकड़ेगा।",
    health: "कफ और मौसमी जुकाम से सावधान रहें।",
    luckyNumber: "2", luckyColor: "दूधिया सफेद (Pearl)", luckyTime: "07:00 PM - 08:30 PM", mantra: "ॐ श्रां श्रीं श्रौं सः चंद्राय नमः"
  },
  {
    rashi: "सिंह (Simha)", en: "Leo", dates: "Jul 23 - Aug 22", symbol: "♌", element: "Fire", energy: 98,
    overview: "सूर्य के प्रभाव से आपका प्रभाव और आकर्षण चरम पर रहेगा। समाज में मान-सम्मान बढ़ेगा।",
    love: "प्रेम संबंधों में नया उत्साह और आकर्षण बढ़ेगा।",
    career: "लीडरशिप भूमिकाओं में चमकेंगे। उच्च अधिकारियों से प्रशंसा मिलेगी।",
    health: "ऊर्जा भरपूर रहेगी। नियमित योगाभ्यास करें।",
    luckyNumber: "1", luckyColor: "सुनहरा (Royal Gold)", luckyTime: "08:00 AM - 10:00 AM", mantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः"
  },
  {
    rashi: "कन्या (Kanya)", en: "Virgo", dates: "Aug 23 - Sep 22", symbol: "♍", element: "Earth", energy: 88,
    overview: "बारीकियों पर आपका ध्यान आपको दूसरों से आगे रखेगा। योजनाबद्ध तरीके से काम करना अत्यंत फलदायी रहेगा।",
    love: "साथी को आपकी सलाह से लाभ होगा। भावनात्मक जुड़ाव बनाए रखें।",
    career: "रिसर्च, डेटा, फाइनेंस या कोडिंग में बड़ी सफलता के योग हैं।",
    health: "पाचन तंत्र का ध्यान रखें। सुपाच्य आहार ग्रहण करें।",
    luckyNumber: "5", luckyColor: "तोतिया हरा (Pistachio)", luckyTime: "04:00 PM - 05:30 PM", mantra: "ॐ बुं बुधाय नमः"
  },
  {
    rashi: "तुला (Tula)", en: "Libra", dates: "Sep 23 - Oct 22", symbol: "♎", element: "Air", energy: 91,
    overview: "जीवन में संतुलन और सौंदर्य का वास होगा। कलात्मक रुचियों को आगे बढ़ाने का समय है।",
    love: "रोमांस और आकर्षण से भरा दिन। दांपत्य जीवन सुखद रहेगा।",
    career: "साझेदारी के व्यापार में अप्रत्याशित लाभ होगा।",
    health: "खूब पानी पिएं और पर्याप्त विश्राम करें।",
    luckyNumber: "6", luckyColor: "आसमानी (Sky Blue)", luckyTime: "12:30 PM - 02:00 PM", mantra: "ॐ शुं शुक्राय नमः"
  },
  {
    rashi: "वृश्चिक (Vrishchik)", en: "Scorpio", dates: "Oct 23 - Nov 21", symbol: "♏", element: "Water", energy: 92,
    overview: "गहन शोध और अंतर्दृष्टि का दिन है। छिपे हुए समाधान आपके सामने प्रकट होंगे।",
    love: "तीव्र आकर्षण और भावनात्मक गहराई का अनुभव होगा।",
    career: "प्रतिद्वंद्वियों पर विजय प्राप्त होगी। नए वित्तीय अवसर मिलेंगे।",
    health: "ध्यान और प्राणायाम से मानसिक शांति मिलेगी।",
    luckyNumber: "9", luckyColor: "गहरा लाल (Maroon)", luckyTime: "06:00 AM - 07:30 AM", mantra: "ॐ भौं भौमाय नमः"
  },
  {
    rashi: "धनु (Dhanu)", en: "Sagittarius", dates: "Nov 22 - Dec 21", symbol: "♐", element: "Fire", energy: 95,
    overview: "भाग्य आज आपका पूरा साथ देगा। आध्यात्मिक ज्ञान और यात्रा के अवसर बनेंगे।",
    love: "साथी के साथ सामंजस्य बेहतरीन रहेगा। शुभ समाचार मिलेगा।",
    career: "सलाहकार, शिक्षक या वित्त से जुड़े लोगों के लिए आज का दिन स्वर्ण अवसर लाएगा।",
    health: "तैलीय खान-पान से बचें। स्फूर्ति बनी रहेगी।",
    luckyNumber: "3", luckyColor: "पीला (Yellow)", luckyTime: "10:00 AM - 11:30 AM", mantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः"
  },
  {
    rashi: "मकर (Makar)", en: "Capricorn", dates: "Dec 22 - Jan 19", symbol: "♑", element: "Earth", energy: 90,
    overview: "कठिन परिश्रम का फल मिलने का समय आ गया है। आपकी निष्ठा वरिष्ठों को प्रभावित करेगी।",
    love: "रिश्तों में भरोसा और प्रतिबद्धता बढ़ेगी।",
    career: "करियर में स्थायित्व और पदोन्नति के योग हैं। अचल संपत्ति से लाभ।",
    health: "हल्की स्ट्रेचिंग करें और विश्राम लें।",
    luckyNumber: "8", luckyColor: "गहरा नीला (Navy Blue)", luckyTime: "05:00 PM - 06:30 PM", mantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः"
  },
  {
    rashi: "कुंभ (Kumbh)", en: "Aquarius", dates: "Jan 20 - Feb 18", symbol: "♒", element: "Air", energy: 93,
    overview: "नवाचार और मौलिक विचार आपके दिन को खास बनाएंगे। मित्रों के समूह में आपकी पूछ बढ़ेगी।",
    love: "मित्रता प्रेम में बदल सकती है। समझदारी बढ़ेगी।",
    career: "टेक्नोलॉजी, स्टार्टअप या सामाजिक उपक्रमों में अप्रत्याशित सफलता मिलेगी।",
    health: "पैरों और टखनों का ध्यान रखें।",
    luckyNumber: "8", luckyColor: "नीला (Cyan)", luckyTime: "01:00 PM - 02:30 PM", mantra: "ॐ शं शनैश्चराय नमः"
  },
  {
    rashi: "मीन (Meen)", en: "Pisces", dates: "Feb 19 - Mar 20", symbol: "♓", element: "Water", energy: 87,
    overview: "अंतर्ज्ञान और कल्पना शक्ति बहुत प्रबल रहेगी। रचनात्मक कार्यों और ध्यान में आनंद मिलेगा।",
    love: "अलौकिक और निःस्वार्थ प्रेम की भावना रहेगी।",
    career: "कला, परामर्श या विदेशी व्यापार से जुड़े लोगों को लाभ होगा।",
    health: "रोग प्रतिरोधक क्षमता का ध्यान रखें।",
    luckyNumber: "3", luckyColor: "हल्का पीला (Light Yellow)", luckyTime: "03:00 PM - 04:30 PM", mantra: "ॐ बृं बृहस्पतये नमः"
  }
];

// Gemstones Database (Light Mode Ready)
const GEMSTONES = [
  { name: "Yellow Sapphire (पुखराज)", hindi: "बृहस्पति का दिव्य रत्न", planet: "Guru (Jupiter)", rashi: "धनु, मीन", benefit: "ज्ञान, समृद्धि, वैवाहिक सुख एवं संतान सुख में अपार वृद्धि करता है।", metal: "स्वर्ण (Gold) या पंचधातु", finger: "तर्जनी (Index)", color: "#FBBF24" },
  { name: "Blue Sapphire (नीलम)", hindi: "शनि का चमत्कारी रत्न", planet: "Shani (Saturn)", rashi: "मकर, कुंभ", benefit: "तुरंत प्रभाव, अपार धन, शक्ति और करियर में असाधारण सफलता दिलाता है।", metal: "चांदी या पंचधातु", finger: "मध्यमा (Middle)", color: "#3B82F6" },
  { name: "Emerald (पन्ना)", hindi: "बुध का ज्ञान रत्न", planet: "Budha (Mercury)", rashi: "मिथुन, कन्या", benefit: "तीक्ष्ण बुद्धि, वाकपटुता, व्यापारिक लाभ और एकाग्रता को जागृत करता है।", metal: "स्वर्ण या कांसा", finger: "कनिष्ठिका (Little)", color: "#10B981" },
  { name: "Ruby (माणिक्य)", hindi: "सूर्य का राजसी रत्न", planet: "Surya (Sun)", rashi: "सिंह", benefit: "नेतृत्व क्षमता, आत्मबल, सरकारी कार्यों में विजय एवं मान-सम्मान देता है।", metal: "स्वर्ण या तांबा", finger: "अनामिका (Ring)", color: "#EF4444" }
];

// 12 Bhavas Significance
const BHAVA_DETAILS = {
  1: { name: "प्रथम भाव (तनु भाव / लग्न)", desc: "शारीरिक संरचना, आत्मबल, व्यक्तित्व, आरोग्य एवं जीवन की सामान्य दिशा।" },
  2: { name: "द्वितीय भाव (धन भाव)", desc: "पारिवारिक संपत्ति, वाणी, संचित धन एवं प्रारंभिक शिक्षा।" },
  3: { name: "तृतीय भाव (सहज भाव)", desc: "साहस, पराक्रम, छोटे भाई-बहन, लघु यात्राएं एवं संचार कौशल।" },
  4: { name: "चतुर्थ भाव (सुख भाव)", desc: "माता, गृह सुख, वाहन, भूमि, मानसिक शांति एवं अचल संपत्ति।" },
  5: { name: "पंचम भाव (पुत्र / बुद्धि भाव)", desc: "संतान, उच्च बुद्धि, विद्या, पूर्व जन्म के पुण्य एवं आकस्मिक लाभ।" },
  6: { name: "षष्ठ भाव (रिपु / रोग भाव)", desc: "शत्रु पर विजय, रोग, ऋण (कर्ज), प्रतिस्पर्धा एवं नौकरी।" },
  7: { name: "सप्तम भाव (जाया / कलत्र भाव)", desc: "विवाह, जीवनसाथी, साझेदारी (Partnership) एवं व्यापारिक अनुबंध।" },
  8: { name: "अष्टम भाव (आयु भाव)", desc: "दीर्घायु, गुप्त ज्ञान, अकस्मात परिवर्तन, शोध एवं वसीयत।" },
  9: { name: "नवम भाव (भाग्य भाव)", desc: "भाग्य, धर्म, गुरु, पिता, तीर्थ यात्रा एवं उच्च दर्शन।" },
  10: { name: "दशम भाव (कर्म भाव)", desc: "करियर, पदोन्नति, सामाजिक प्रतिष्ठा, अधिकार एवं राजकीय सम्मान।" },
  11: { name: "एकादश भाव (लाभ भाव)", desc: "आय के साधन, इच्छा पूर्ति, बड़े भाई-बहन एवं सामाजिक नेटवर्क।" },
  12: { name: "द्वादश भाव (व्यय / मोक्ष भाव)", desc: "विदेश यात्रा, व्यय, दान, आध्यात्मिक मोक्ष एवं शयन सुख।" }
};

// Live comments stream buffer
const SAMPLE_LIVE_COMMENTS = [
  { user: "Ramesh Sharma", text: "हर हर महादेव दीदी! 🙏", badge: "VIP" },
  { user: "Pooja Mishra", text: "मेरे विवाह में देरी हो रही है, क्या करूं?", badge: "Member" },
  { user: "Aman Gupta", text: "दीदी की पिछली भविष्यवाणी सच निकली! 🌟", badge: "Top Fan" },
  { user: "Suresh Patil", text: "बिजनेस में लाभ के लिए उपाय बताएं।", badge: "Fan" },
  { user: "Neha Rajput", text: "दीपक अर्पण किया 🪔", badge: "Supporter" },
  { user: "Prajwal", text: "प्रणाम आचार्य जी!", badge: "Seeker" }
];

// Helper to get fallback avatar safely without HTML quote corruption
function getFallbackAvatar(name) {
  const char = encodeURIComponent((name || "A").trim().charAt(0) || "A");
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='16' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='55%25' font-size='32' font-weight='bold' fill='%23ffffff' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif'%3E" + char + "%3C/text%3E%3C/svg%3E";
}

function handleAvatarError(img) {
  img.onerror = null;
  img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='16' fill='%23f59e0b'/%3E%3Ctext x='50%25' y='55%25' font-size='32' font-weight='bold' fill='%23ffffff' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif'%3E%E0%A5%90%3C/text%3E%3C/svg%3E";
}

// -------------------------------------------------------------
// ASTROLOGERS DIRECTORY RENDERING (32 VERIFIED MASTERS)
// -------------------------------------------------------------
function filterAstroCategory(cat, btn) {
  currentAstroCategory = cat;
  document.querySelectorAll(".astro-cat-pill").forEach(p => {
    p.classList.remove("active", "bg-amber-500", "text-white", "font-bold", "shadow-sm");
    p.classList.add("bg-slate-100", "text-slate-700");
  });
  if (btn) {
    btn.classList.remove("bg-slate-100", "text-slate-700");
    btn.classList.add("active", "bg-amber-500", "text-white", "font-bold", "shadow-sm");
  }
  renderConsultAstrologers();
}

function handleAstroSearch() {
  const input = document.getElementById("astroSearchInput");
  currentAstroSearch = input ? input.value : "";
  renderConsultAstrologers();
}

function handleAstroSort() {
  const select = document.getElementById("astroSortSelect");
  currentAstroSort = select ? select.value : "popular";
  renderConsultAstrologers();
}

function renderAstrologersDirectories() {
  const list = (window.ASTROLOGERS_DATABASE && Array.isArray(window.ASTROLOGERS_DATABASE)) 
    ? window.ASTROLOGERS_DATABASE 
    : (typeof ConsultationEngine !== "undefined" && ConsultationEngine.ASTROLOGERS ? ConsultationEngine.ASTROLOGERS : []);

  if (!list || list.length === 0) {
    console.warn("Astrologers database is loading or empty.");
    return;
  }

  // 1. Home Screen Top 6 Astrologers (Compact Native Mobile Layout)
  const homeContainer = document.getElementById("homeAstrologersDirectory");
  if (homeContainer) {
    homeContainer.innerHTML = list.slice(0, 6).map(ast => `
      <div class="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-amber-400 flex flex-col justify-between space-y-2.5 transition-all shadow-xs hover:shadow-md">
        <div class="flex items-start space-x-3">
          <div class="relative shrink-0">
            <img src="${ast.avatar}" onerror="handleAvatarError(this)" class="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover border-2 border-amber-300 shadow-xs">
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online Now"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex items-center space-x-1">
                <span class="truncate">${ast.name}</span>
                <span class="text-[10px] text-amber-800 font-medium shrink-0">(${ast.nameHindi})</span>
                <i data-lucide="check-circle" class="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0"></i>
              </h4>
              <span class="text-[11px] sm:text-xs text-amber-600 font-bold shrink-0">★ ${ast.rating}</span>
            </div>
            <p class="text-[10px] sm:text-[11px] text-amber-700 font-semibold truncate">${ast.title}</p>
            <p class="text-[10px] text-slate-500 truncate">${ast.skills.join(" • ")}</p>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <p class="font-black text-slate-900 text-xs sm:text-sm">₹ ${ast.ratePerMin}<span class="text-[9px] sm:text-[10px] text-slate-500 font-normal">/min</span></p>
          <div class="flex items-center space-x-1.5">
            <button onclick="startChatConsultation('${ast.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-xs transition-all active:scale-95 flex items-center space-x-1">
              <i data-lucide="message-circle" class="w-3 h-3"></i>
              <span>Chat (Free)</span>
            </button>
            <button onclick="startAudioCallConsultation('${ast.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs transition-all active:scale-95 flex items-center space-x-1">
              <i data-lucide="phone" class="w-3 h-3"></i>
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  // 2. Full Consult Tab
  renderConsultAstrologers();
  safeLucide();
}

function renderConsultAstrologers() {
  const consultContainer = document.getElementById("consultAstrologersDirectory");
  if (!consultContainer) return;

  let list = (window.ASTROLOGERS_DATABASE && Array.isArray(window.ASTROLOGERS_DATABASE)) 
    ? [...window.ASTROLOGERS_DATABASE] 
    : (typeof ConsultationEngine !== "undefined" && ConsultationEngine.ASTROLOGERS ? [...ConsultationEngine.ASTROLOGERS] : []);

  if (!list.length) return;

  // Filter Category
  if (currentAstroCategory !== "all") {
    list = list.filter(a => a.category === currentAstroCategory);
  }

  // Search Filter
  if (currentAstroSearch && currentAstroSearch.trim()) {
    const q = currentAstroSearch.toLowerCase().trim();
    list = list.filter(a =>
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.skills && a.skills.some(s => s.toLowerCase().includes(q))) ||
      (a.languages && a.languages.some(l => l.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (currentAstroSort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (currentAstroSort === "exp") {
    list.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
  } else if (currentAstroSort === "price_low") {
    list.sort((a, b) => a.ratePerMin - b.ratePerMin);
  }

  if (list.length === 0) {
    consultContainer.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <p class="text-sm font-semibold text-slate-800">कोई ज्योतिषी नहीं मिला।</p>
        <p class="text-xs mt-1 text-slate-500">कृपया दूसरा शब्द खोजें या फ़िल्टर बदलें।</p>
        <button onclick="filterAstroCategory('all', null)" class="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold">सभी 48 ज्योतिषी देखें</button>
      </div>
    `;
    return;
  }

  consultContainer.innerHTML = list.map(ast => `
    <div class="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-amber-400 flex flex-col justify-between space-y-2.5 transition-all shadow-xs hover:shadow-md">
      <div class="flex items-start space-x-3">
        <div class="relative shrink-0">
          <img src="${ast.avatar}" onerror="handleAvatarError(this)" class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-xs">
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online Now"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex items-center space-x-1">
              <span class="truncate">${ast.name}</span>
              <span class="text-[10px] text-amber-800 font-medium shrink-0">(${ast.nameHindi})</span>
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 shrink-0"></i>
            </h4>
            <div class="flex items-center space-x-0.5 text-[11px] sm:text-xs text-amber-600 font-black shrink-0">
              <span>★</span>
              <span>${ast.rating}</span>
            </div>
          </div>
          <p class="text-[10px] sm:text-[11px] text-amber-700 font-semibold truncate">${ast.title}</p>
          <p class="text-[10px] text-slate-500 truncate">${ast.skills.join(" • ")}</p>
          <p class="text-[9px] sm:text-[10px] text-slate-400">${ast.experience} • ${ast.orders || '10,000+'} consultations</p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div>
          <span class="text-[9px] text-slate-400">Fee</span>
          <p class="font-black text-slate-900 text-xs sm:text-sm">₹ ${ast.ratePerMin}<span class="text-[9px] text-slate-500 font-normal">/min</span></p>
        </div>
        <div class="flex items-center space-x-1.5">
          <button onclick="startChatConsultation('${ast.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white font-extrabold border border-amber-300 flex items-center space-x-1 transition-all active:scale-95 text-[11px] shadow-xs">
            <i data-lucide="message-square" class="w-3 h-3"></i>
            <span>Chat</span>
          </button>
          <button onclick="startAudioCallConsultation('${ast.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center space-x-1 transition-all active:scale-95 text-[11px] shadow-xs">
            <i data-lucide="phone" class="w-3 h-3"></i>
            <span>Call</span>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  safeLucide();
}

// -------------------------------------------------------------
// TAB SWITCHING (NATIVE ANDROID NAVIGATION FEEL)
// -------------------------------------------------------------
function switchTab(tabId) {
  if (navigator.vibrate) {
    try { navigator.vibrate(12); } catch (e) { }
  }

  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));

  const target = document.getElementById(`section-${tabId}`);
  if (target) {
    target.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update Bottom Navigation button active styles
  document.querySelectorAll(".nav-btn").forEach(btn => {
    const isThisTab = btn.getAttribute("onclick")?.includes(`'${tabId}'`);
    if (isThisTab) {
      btn.classList.add("text-amber-600", "font-black");
      btn.classList.remove("text-slate-500");
    } else {
      btn.classList.remove("text-amber-600", "font-black");
      btn.classList.add("text-slate-500");
    }
  });

  // Re-render consult tab if switched to consult
  if (tabId === "consult") {
    renderConsultAstrologers();
  }

  safeLucide();
}

// -------------------------------------------------------------
// LIVE 1-ON-1 CHAT WITH GEMINI AI & RAG MEMORY
// -------------------------------------------------------------
function startChatConsultation(astId) {
  // Gatekeeper: Require Google Login before starting chat
  if (typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => startChatConsultation(astId))) {
    return;
  }

  const list = (window.ASTROLOGERS_DATABASE && Array.isArray(window.ASTROLOGERS_DATABASE)) 
    ? window.ASTROLOGERS_DATABASE 
    : (typeof ConsultationEngine !== "undefined" && ConsultationEngine.ASTROLOGERS ? ConsultationEngine.ASTROLOGERS : []);

  const ast = list.find(a => a.id === astId) || list[0] || {
    id: "ast_1",
    name: "आचार्य देविका शर्मा",
    title: "स्वर्ण पदक विजेता वैदिक ज्योतिषी",
    ratePerMin: 25,
    avatar: "avatars/ast_1.jpg"
  };

  activeChatAstrologer = ast;

  const chatNameEl = document.getElementById("chatAstName");
  if (chatNameEl) {
    chatNameEl.innerHTML = `<span>${ast.name}</span> <span class="text-[10px] text-amber-800 font-normal">(${ast.nameHindi || ''})</span>`;
  }
  const avatarEl = document.getElementById("chatAstAvatar");
  avatarEl.src = ast.avatar;
  avatarEl.onerror = () => { avatarEl.src = getFallbackAvatar(ast.name); };
  document.getElementById("chatRate").textContent = ast.ratePerMin;

  const messagesBox = document.getElementById("chatMessages");
  messagesBox.innerHTML = "";

  // Render past history if available
  const pastHistory = AiAstrologerEngine.getChatHistory(ast.id);
  if (pastHistory && pastHistory.length > 0) {
    pastHistory.forEach(item => {
      if (item.role === "user") {
        messagesBox.innerHTML += `
          <div class="flex items-start justify-end space-x-2">
            <div class="bg-amber-50 border border-amber-200 text-slate-900 rounded-2xl rounded-tr-none p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
              <p>${item.text}</p>
              <div class="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-400">
                <span>${item.timestamp || 'अभी'}</span>
                <span class="text-blue-500 font-bold">✓✓</span>
              </div>
            </div>
          </div>
        `;
      } else {
        messagesBox.innerHTML += `
          <div class="flex items-start space-x-2.5">
            <img src="${ast.avatar}" onerror="handleAvatarError(this)" class="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0">
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-800 leading-relaxed max-w-[85%] shadow-sm space-y-1">
              <p class="font-bold text-amber-800 text-[11px]">${ast.name}</p>
              <div class="space-y-1">${item.text.replace(/\n\n/g, '<br><br>')}</div>
              <span class="block text-[9px] text-slate-400 mt-1">${item.timestamp || 'अभी'}</span>
            </div>
          </div>
        `;
      }
    });
  } else {
    // Welcome initial message
    messagesBox.innerHTML = `
      <div class="flex items-start space-x-2.5">
        <img src="${ast.avatar}" onerror="handleAvatarError(this)" class="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0">
        <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-800 leading-relaxed max-w-[85%] shadow-sm space-y-1">
          <p class="font-bold text-amber-800 text-[11px]">${ast.name}</p>
          <p>प्रणाम प्रिय! मैं <strong>${ast.name}</strong>। आपकी जन्म कुंडली और 2026 गोचर ग्रहों की ऊर्जा को देखकर आपका मार्गदर्शन करने के लिए उपस्थित हूँ। अपने करियर, विवाह, प्रेम, धन या मानसिक शांति के विषय में निःसंकोच पूछें।</p>
          <span class="block text-[9px] text-slate-400 mt-1">अभी</span>
        </div>
      </div>
    `;
  }

  document.getElementById("liveChatModal").classList.remove("hidden");
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Live Consultation Timer
  chatElapsedSeconds = 0;
  if (chatTimerInterval) clearInterval(chatTimerInterval);
  chatTimerInterval = setInterval(() => {
    chatElapsedSeconds++;
    const m = Math.floor(chatElapsedSeconds / 60).toString().padStart(2, '0');
    const s = (chatElapsedSeconds % 60).toString().padStart(2, '0');
    document.getElementById("chatTimer").textContent = `${m}:${s}`;
  }, 1000);
}

function closeChatModal() {
  document.getElementById("liveChatModal").classList.add("hidden");
  if (chatTimerInterval) clearInterval(chatTimerInterval);
}

async function submitChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  await sendChatMessage(text);
}

function sendQuickChatMessage(text) {
  sendChatMessage(text);
}

async function sendChatMessage(text) {
  const box = document.getElementById("chatMessages");
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Native WhatsApp User Message with Blue Ticks
  box.innerHTML += `
    <div class="flex items-start justify-end space-x-2">
      <div class="bg-amber-50 border border-amber-200 text-slate-900 rounded-2xl rounded-tr-none p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
        <p>${text}</p>
        <div class="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-400">
          <span>${timeStr}</span>
          <span class="text-blue-500 font-bold">✓✓</span>
        </div>
      </div>
    </div>
  `;
  box.scrollTop = box.scrollHeight;

  // Typing Indicator with Astrologer Action
  const typingId = `typing_${Date.now()}`;
  box.innerHTML += `
    <div id="${typingId}" class="flex items-start space-x-2 text-xs text-slate-500 italic py-1">
      <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0 mt-1"></span>
      <span>${activeChatAstrologer.name} जन्म कुंडली और गोचर ग्रहों का सूक्ष्म अध्ययन कर रहे हैं...</span>
    </div>
  `;
  box.scrollTop = box.scrollHeight;

  try {
    const aiReply = await AiAstrologerEngine.generateAstrologerReply(text, activeChatAstrologer.id);

    const el = document.getElementById(typingId);
    if (el) el.remove();

    box.innerHTML += `
      <div class="flex items-start space-x-2.5">
        <img src="${activeChatAstrologer.avatar}" onerror="handleAvatarError(this)" class="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0">
        <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-800 leading-relaxed max-w-[85%] shadow-sm space-y-1.5">
          <p class="font-bold text-amber-800 text-[11px]">${activeChatAstrologer.name}</p>
          <div class="space-y-1">${aiReply.replace(/\n\n/g, '<br><br>')}</div>
          <span class="block text-[9px] text-slate-400 pt-1">${timeStr}</span>
        </div>
      </div>
    `;
    box.scrollTop = box.scrollHeight;
  } catch (err) {
    const el = document.getElementById(typingId);
    if (el) el.remove();
    console.error("Chat error:", err);
  }
}

// -------------------------------------------------------------
// TOAST NOTIFICATION UTILITY
// -------------------------------------------------------------
function showToast(msg) {
  let toast = document.getElementById("divyaToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "divyaToast";
    toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove("opacity-0", "translate-y-2");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
  }, 2600);
}

// -------------------------------------------------------------
// AUDIO CALL SCREEN & INTERACTIVE HD VOICE CONSULTATION
// -------------------------------------------------------------
var activeCallAstrologer = null;
var callSpeechUtterance = null;

function startAudioCallConsultation(astId) {
  // Gatekeeper: Require Google Login before starting audio call
  if (typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => startAudioCallConsultation(astId))) {
    return;
  }

  const list = (window.ASTROLOGERS_DATABASE && Array.isArray(window.ASTROLOGERS_DATABASE)) 
    ? window.ASTROLOGERS_DATABASE 
    : (typeof ConsultationEngine !== "undefined" && ConsultationEngine.ASTROLOGERS ? ConsultationEngine.ASTROLOGERS : []);

  const ast = list.find(a => a.id === astId) || list[0];
  activeCallAstrologer = ast;

  const nameEl = document.getElementById("callAstName");
  if (nameEl) {
    nameEl.innerHTML = `<span>${ast.name}</span><span class="text-xs text-amber-800 font-medium ml-1">(${ast.nameHindi || ''})</span><i data-lucide="check-circle" class="w-4 h-4 text-blue-500 fill-blue-500/20 shrink-0 ml-1"></i>`;
  }
  const avatarEl = document.getElementById("callAstAvatar");
  if (avatarEl) {
    avatarEl.src = ast.avatar;
    avatarEl.onerror = () => { avatarEl.src = getFallbackAvatar(ast.name); };
  }
  
  const statusEl = document.getElementById("callStatusText");
  if (statusEl) statusEl.textContent = "कॉल जुड़ रही है (Connecting)...";

  const durationEl = document.getElementById("callDuration");
  if (durationEl) durationEl.textContent = "00:00";

  const subtitleEl = document.getElementById("callSubtitleText");
  if (subtitleEl) subtitleEl.textContent = `"${ast.name} (${ast.nameHindi || ''}) जी से संपर्क स्थापित हो रहा है..."`;

  document.getElementById("audioCallModal").classList.remove("hidden");
  safeLucide();

  setTimeout(() => {
    if (statusEl) statusEl.textContent = "🟢 परामर्श जारी है (HD Voice Active)";
    audioCallSeconds = 0;
    if (audioCallInterval) clearInterval(audioCallInterval);
    audioCallInterval = setInterval(() => {
      audioCallSeconds++;
      const m = Math.floor(audioCallSeconds / 60).toString().padStart(2, '0');
      const s = (audioCallSeconds % 60).toString().padStart(2, '0');
      if (durationEl) durationEl.textContent = `${m}:${s}`;
    }, 1000);

    // Initial greeting voice from the Astrologer
    const spokenName = ast.nameHindi || ast.name;
    const welcomeSpeech = `प्रणाम! मैं ${spokenName} बोल रहा हूँ। आपकी जन्म कुंडली मेरे सम्मुख खुली है, बताइए आज क्या मार्गदर्शन चाहते हैं?`;
    speakAstrologerVoice(welcomeSpeech);
  }, 1200);
}

function speakAstrologerVoice(text) {
  const subtitleEl = document.getElementById("callSubtitleText");
  if (subtitleEl) {
    subtitleEl.textContent = `"${text}"`;
  }

  const waveContainer = document.getElementById("callWaveContainer");

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    
    // If speaker is turned off (muted), do not speak audio out loud
    if (isAudioCallSpeaker) return;

    const cleanText = text.replace(/[*#📌_]/g, "").trim();
    callSpeechUtterance = new SpeechSynthesisUtterance(cleanText);
    callSpeechUtterance.lang = "hi-IN";
    callSpeechUtterance.rate = 0.95;
    callSpeechUtterance.pitch = 1.0;

    // Pick Hindi voice if browser has one installed
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => v.lang.startsWith("hi") || v.lang.includes("IN"));
    if (hiVoice) callSpeechUtterance.voice = hiVoice;

    if (waveContainer) {
      callSpeechUtterance.onstart = () => { waveContainer.style.opacity = "1"; };
      callSpeechUtterance.onend = () => { waveContainer.style.opacity = "0.4"; };
      callSpeechUtterance.onerror = () => { waveContainer.style.opacity = "0.4"; };
    }

    window.speechSynthesis.speak(callSpeechUtterance);
  }
}

function askCallQuestion(topic) {
  if (!activeCallAstrologer) return;
  const mem = (typeof AiAstrologerEngine !== "undefined") 
    ? AiAstrologerEngine.getUserMemory() 
    : { name: "Prajwal", lagna: "कन्या", moonSign: "वृषभ" };

  let answerText = "";
  if (topic === "career") {
    answerText = `आपकी कुंडली के दशम कर्म भाव में सूर्य व बुध की शुभ स्थिति है। आगामी 45 से 60 दिनों में नई नौकरी और पदोन्नति का प्रबल योग बन रहा है। प्रतिदिन प्रातः सूर्य को तांबे के पात्र से जल अर्पित करें।`;
  } else if (topic === "marriage") {
    answerText = `सप्तमेश देवगुरु बृहस्पति की शुभ दृष्टि के कारण विवाह योग अत्यंत अनुकूल है। वर्ष 2026 के मध्य में एक सुयोग्य व संस्कारी जीवनसाथी से संबंध पक्का होगा। गुरुवार को पीले वस्त्र पहनें।`;
  } else if (topic === "money") {
    answerText = `द्वितीय धन भाव और एकादश लाभ भाव में ग्रह सुधार दर्शा रहे हैं। आगामी 50 दिनों में अटका हुआ धन प्राप्त होगा और व्यापार में वृद्धि होगी। शुक्रवार को लक्ष्मी जी की आराधना करें।`;
  } else if (topic === "dosha") {
    answerText = `आपकी कुंडली पूर्णतः मांगलिक दोष मुक्त है और साढ़े साती से भी मुक्त है। शनिवार को पीपल के नीचे सरसों के तेल का दीपक प्रज्वलित करें, सर्व विघ्न शांत होंगे।`;
  }

  speakAstrologerVoice(answerText);
}

function endAudioCall() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  document.getElementById("audioCallModal").classList.add("hidden");
  if (audioCallInterval) clearInterval(audioCallInterval);
  showToast("कॉल परामर्श सफलतापूर्वक समाप्त हुआ। शुभम भवतु!");
}

function toggleCallMute(btn) {
  isAudioCallMuted = !isAudioCallMuted;
  btn.classList.toggle("bg-rose-600", isAudioCallMuted);
  btn.classList.toggle("text-white", isAudioCallMuted);
  showToast(isAudioCallMuted ? "माइक म्यूट किया गया" : "माइक अनम्यूट किया गया");
}

function toggleCallSpeaker(btn) {
  isAudioCallSpeaker = !isAudioCallSpeaker;
  btn.classList.toggle("bg-amber-500", isAudioCallSpeaker);
  btn.classList.toggle("text-white", isAudioCallSpeaker);
  if (isAudioCallSpeaker && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  showToast(isAudioCallSpeaker ? "स्पीकर म्यूट" : "स्पीकर चालू (HD Voice)");
}

// -------------------------------------------------------------
// LOCALSTORAGE PERSISTENCE (AUTO-SAVE & AUTO-FILL)
// -------------------------------------------------------------
function saveKundliInputToStorage() {
  const name = document.getElementById("kName")?.value || "";
  const gender = document.getElementById("kGender")?.value || "Male";
  const dob = document.getElementById("kDob")?.value || "";
  const tob = document.getElementById("kTob")?.value || "";
  const city = document.getElementById("kCity")?.value || "";

  localStorage.setItem("divya_kundli_input", JSON.stringify({ name, gender, dob, tob, city }));
}

function loadKundliInputFromStorage() {
  try {
    const raw = localStorage.getItem("divya_kundli_input");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.name && document.getElementById("kName")) document.getElementById("kName").value = data.name;
    if (data.gender && document.getElementById("kGender")) document.getElementById("kGender").value = data.gender;
    if (data.dob && document.getElementById("kDob")) document.getElementById("kDob").value = data.dob;
    if (data.tob && document.getElementById("kTob")) document.getElementById("kTob").value = data.tob;
    if (data.city && document.getElementById("kCity")) document.getElementById("kCity").value = data.city;
  } catch (e) {
    console.warn("Could not load saved kundli input:", e);
  }
}

function saveMilanInputToStorage() {
  const gName = document.getElementById("mGroomName")?.value || "";
  const gRashi = document.getElementById("mGroomRashi")?.value || "0";
  const gNak = document.getElementById("mGroomNak")?.value || "0";
  const gManglik = document.getElementById("mGroomManglik")?.checked || false;

  const bName = document.getElementById("mBrideName")?.value || "";
  const bRashi = document.getElementById("mBrideRashi")?.value || "4";
  const bNak = document.getElementById("mBrideNak")?.value || "9";
  const bManglik = document.getElementById("mBrideManglik")?.checked || false;

  localStorage.setItem("divya_milan_input", JSON.stringify({
    gName, gRashi, gNak, gManglik, bName, bRashi, bNak, bManglik
  }));
}

function loadMilanInputFromStorage() {
  try {
    const raw = localStorage.getItem("divya_milan_input");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.gName && document.getElementById("mGroomName")) document.getElementById("mGroomName").value = data.gName;
    if (data.gRashi !== undefined && document.getElementById("mGroomRashi")) document.getElementById("mGroomRashi").value = data.gRashi;
    if (data.gNak !== undefined && document.getElementById("mGroomNak")) document.getElementById("mGroomNak").value = data.gNak;
    if (data.gManglik !== undefined && document.getElementById("mGroomManglik")) document.getElementById("mGroomManglik").checked = data.gManglik;

    if (data.bName && document.getElementById("mBrideName")) document.getElementById("mBrideName").value = data.bName;
    if (data.bRashi !== undefined && document.getElementById("mBrideRashi")) document.getElementById("mBrideRashi").value = data.bRashi;
    if (data.bNak !== undefined && document.getElementById("mBrideNak")) document.getElementById("mBrideNak").value = data.bNak;
    if (data.bManglik !== undefined && document.getElementById("mBrideManglik")) document.getElementById("mBrideManglik").checked = data.bManglik;
  } catch (e) {
    console.warn("Could not load saved milan input:", e);
  }
}

function saveNumerologyInputToStorage() {
  const name = document.getElementById("numName")?.value || "";
  const dob = document.getElementById("numDob")?.value || "";
  localStorage.setItem("divya_numerology_input", JSON.stringify({ name, dob }));
}

function loadNumerologyInputFromStorage() {
  try {
    const raw = localStorage.getItem("divya_numerology_input");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.name && document.getElementById("numName")) document.getElementById("numName").value = data.name;
    if (data.dob && document.getElementById("numDob")) document.getElementById("numDob").value = data.dob;
  } catch (e) {
    console.warn("Could not load saved numerology input:", e);
  }
}

function savePanchangPrefToStorage() {
  const date = document.getElementById("panchangDatePicker")?.value || "";
  const city = document.getElementById("panchangCitySelect")?.value || "";
  localStorage.setItem("divya_panchang_pref", JSON.stringify({ date, city }));
}

function loadPanchangPrefFromStorage() {
  try {
    const raw = localStorage.getItem("divya_panchang_pref");
    if (!raw) {
      const todayStr = new Date().toISOString().split("T")[0];
      if (document.getElementById("panchangDatePicker")) {
        document.getElementById("panchangDatePicker").value = todayStr;
      }
      return;
    }
    const data = JSON.parse(raw);
    if (data.date && document.getElementById("panchangDatePicker")) document.getElementById("panchangDatePicker").value = data.date;
    if (data.city && document.getElementById("panchangCitySelect")) document.getElementById("panchangCitySelect").value = data.city;
  } catch (e) {
    console.warn("Could not load saved panchang pref:", e);
  }
}

function saveMalaStateToStorage(mantraId, count, rounds) {
  localStorage.setItem("divya_mala_state", JSON.stringify({ mantraId, count, rounds }));
}

function loadMalaStateFromStorage() {
  try {
    const raw = localStorage.getItem("divya_mala_state");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// KUNDLI ENGINE & LIGHT MODE VISUALIZER
// -------------------------------------------------------------
let currentKundliData = null;
let currentChartType = "D1";

function fillSampleKundli() {
  if (document.getElementById("kName")) document.getElementById("kName").value = "Prajwal Sharma";
  if (document.getElementById("kGender")) document.getElementById("kGender").value = "Male";
  if (document.getElementById("kDob")) document.getElementById("kDob").value = "1998-07-21";
  if (document.getElementById("kTob")) document.getElementById("kTob").value = "10:30";
  if (document.getElementById("kCity")) document.getElementById("kCity").value = "28.6139,77.2090,New Delhi";
  saveKundliInputToStorage();
  generateKundli();
}

function generateKundli(isInitial = false) {
  // Gatekeeper: Interactive generation requires Google Login
  if (!isInitial && typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => generateKundli())) {
    return;
  }

  const name = document.getElementById("kName")?.value || "Prajwal Sharma";
  const gender = document.getElementById("kGender")?.value || "Male";
  const dob = document.getElementById("kDob")?.value || "1998-07-21";
  const tob = document.getElementById("kTob")?.value || "10:30";
  const cityRaw = document.getElementById("kCity")?.value || "28.6139,77.2090,New Delhi";
  const [lat, lon, cityName] = cityRaw.split(",");

  saveKundliInputToStorage();

  const kData = AstroEngine.calculateKundli(name, dob, tob, parseFloat(lat), parseFloat(lon), cityName);
  currentKundliData = kData;
  localStorage.setItem("divya_last_kundli", JSON.stringify(kData));

  // Sync with AI Astrologer RAG Memory with full factual truth
  if (typeof AiAstrologerEngine !== "undefined") {
    AiAstrologerEngine.saveUserMemory({
      name: name,
      gender: gender,
      dob: dob,
      tob: tob,
      city: cityName,
      lagna: `${kData.lagna.rashi} (${kData.lagna.rashiEn})`,
      moonSign: `${kData.moonSign} (${kData.moonSignEn})`,
      nakshatra: `${kData.nakshatra} (चरण ${kData.pada})`,
      currentDasha: kData.dashaTimeline.find(d => d.isCurrent)?.lord ? `${kData.dashaTimeline.find(d => d.isCurrent).lord} महादशा` : "बुध (Mercury) महादशा",
      manglikStatus: kData.doshas.manglik.status ? `मांगलिक (${kData.doshas.manglik.severity})` : "अमांगलिक (Non-Manglik)",
      sadeSati: kData.doshas.sadeSati.status ? `साढ़े साती सक्रिय (${kData.doshas.sadeSati.phase})` : "साढ़े साती मुक्त",
      kaalSarp: kData.doshas.kaalSarp.status ? `कालसर्प दोष (${kData.doshas.kaalSarp.type})` : "कालसर्प दोष मुक्त"
    });
  }

  renderKundliResult(kData);
}

function switchKundliChart(type) {
  if (!currentKundliData) return;
  currentChartType = type;
  const isNav = type === "D9";
  const svgWrapper = document.getElementById("kundliSvgWrapper");
  const d1Btn = document.getElementById("chartD1Btn");
  const d9Btn = document.getElementById("chartD9Btn");
  const chartTitle = document.getElementById("chartActiveTitle");

  if (svgWrapper) {
    svgWrapper.innerHTML = AstroEngine.renderNorthIndianChartSVG(currentKundliData, isNav);
  }
  if (chartTitle) {
    chartTitle.textContent = isNav ? "नवमांश कुंडली (D9 Navamsha Chart)" : "लग्न कुंडली (D1 Lagna Chart)";
  }
  if (d1Btn && d9Btn) {
    if (isNav) {
      d9Btn.className = "px-3 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-xs transition-all";
      d1Btn.className = "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
    } else {
      d1Btn.className = "px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-xs transition-all";
      d9Btn.className = "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
    }
  }
}

function renderKundliResult(data) {
  const container = document.getElementById("kundliResult");
  if (!container) return;

  const svgChart = AstroEngine.renderNorthIndianChartSVG(data, currentChartType === "D9");
  const moonPlanet = data.planets.find(p => p.id === "Chandra");
  const sunPlanet = data.planets.find(p => p.id === "Surya");
  const currentDasha = data.dashaTimeline.find(d => d.isCurrent) || data.dashaTimeline[0];

  // Lucky recommendations mapping based on Lagna
  const lagnaLordGems = {
    "Mesh": { gem: "मूंगा (Red Coral)", rudraksha: "3 मुखी रुद्राक्ष", color: "लाल व केसरिया", metal: "तांबा", day: "मंगलवार", number: "9", deity: "श्री हनुमान जी" },
    "Vrishabh": { gem: "हीरा या ओपल (Diamond/Opal)", rudraksha: "6 मुखी रुद्राक्ष", color: "सफेद व क्रीम", metal: "चांदी", day: "शुक्रवार", number: "6", deity: "माँ महालक्ष्मी" },
    "Mithun": { gem: "पन्ना (Emerald)", rudraksha: "4 मुखी रुद्राक्ष", color: "हरा", metal: "कांसा", day: "बुधवार", number: "5", deity: "श्री गणेश जी" },
    "Kark": { gem: "मोती (Pearl)", rudraksha: "2 मुखी रुद्राक्ष", color: "दूधिया सफेद व चांदी", metal: "चांदी", day: "सोमवार", number: "2", deity: "भगवान शिव" },
    "Simha": { gem: "माणिक्य (Ruby)", rudraksha: "1 मुखी या 12 मुखी", color: "सुनहरा व नारंगी", metal: "स्वर्ण / तांबा", day: "रविवार", number: "1", deity: "भगवान सूर्य नारायण" },
    "Kanya": { gem: "पन्ना (Emerald)", rudraksha: "4 मुखी रुद्राक्ष", color: "तोतिया हरा", metal: "कांसा", day: "बुधवार", number: "5", deity: "श्री गणेश जी" },
    "Tula": { gem: "हीरा या ओपल (Diamond/Opal)", rudraksha: "6 मुखी रुद्राक्ष", color: "गुलाबी व सफेद", metal: "चांदी / प्लेटिनम", day: "शुक्रवार", number: "6", deity: "माँ महालक्ष्मी" },
    "Vrishchik": { gem: "मूंगा (Red Coral)", rudraksha: "3 मुखी रुद्राक्ष", color: "गहरा लाल व पीला", metal: "तांबा", day: "मंगलवार", number: "9", deity: "श्री कार्तिकेय / हनुमान जी" },
    "Dhanu": { gem: "पुखराज (Yellow Sapphire)", rudraksha: "5 मुखी रुद्राक्ष", color: "पीला व सुनहरा", metal: "स्वर्ण / पीतल", day: "गुरुवार", number: "3", deity: "भगवान विष्णु" },
    "Makar": { gem: "नीलम (Blue Sapphire) या जामुनिया", rudraksha: "7 मुखी या 14 मुखी", color: "नीला व आसमानी", metal: "लोहा / अष्टधातु", day: "शनिवार", number: "8", deity: "शनि देव व हनुमान जी" },
    "Kumbh": { gem: "नीलम या कटैला", rudraksha: "7 मुखी रुद्राक्ष", color: "आसमानी व नीला", metal: "अष्टधातु", day: "शनिवार", number: "8", deity: "भगवान शिव" },
    "Meen": { gem: "पुखराज (Yellow Sapphire)", rudraksha: "5 मुखी रुद्राक्ष", color: "हल्दी पीला", metal: "स्वर्ण", day: "गुरुवार", number: "3", deity: "भगवान विष्णु" }
  };
  const lucky = lagnaLordGems[data.lagna.rashi] || lagnaLordGems["Mesh"];

  container.innerHTML = `
    <!-- Kundli Overview Bar (Light Mode Luxury) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
      <div class="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
        <p class="text-[10px] text-slate-500 uppercase font-semibold">लग्न (Ascendant)</p>
        <p class="text-sm font-bold text-amber-800">${data.lagna.rashi} (${data.lagna.rashiSymbol})</p>
        <p class="text-[10px] text-slate-500">${data.lagna.nakshatra} (प ${data.lagna.pada})</p>
      </div>
      <div class="bg-blue-50/50 p-3 rounded-xl border border-blue-200/60">
        <p class="text-[10px] text-slate-500 uppercase font-semibold">चंद्र राशि (Moon Sign)</p>
        <p class="text-sm font-bold text-blue-700">${data.moonSign} (${moonPlanet ? moonPlanet.rashiSymbol : ''})</p>
        <p class="text-[10px] text-slate-500">${data.nakshatra} (चरण ${data.pada})</p>
      </div>
      <div class="bg-purple-50/50 p-3 rounded-xl border border-purple-200/60">
        <p class="text-[10px] text-slate-500 uppercase font-semibold">सूर्य राशि (Sun Sign)</p>
        <p class="text-sm font-bold text-purple-700">${sunPlanet ? sunPlanet.rashi : 'सिंह'} (${sunPlanet ? sunPlanet.rashiSymbol : '♌'})</p>
        <p class="text-[10px] text-slate-500">${sunPlanet ? sunPlanet.rashiDegreeStr : ''}</p>
      </div>
      <div class="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
        <p class="text-[10px] text-slate-500 uppercase font-semibold">लाहिड़ी अयनांश (Lahiri)</p>
        <p class="text-sm font-bold text-emerald-700">${data.ayanamshaStr}</p>
        <p class="text-[10px] text-emerald-600 font-semibold">चित्रा पक्ष वैदिक गणना</p>
      </div>
    </div>

    <!-- Chart Visualizer and Planetary Table -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      <!-- Chart Column -->
      <div class="bg-white p-5 rounded-3xl border border-amber-300 text-center space-y-4 shadow-sm">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center space-x-1.5">
            <i data-lucide="compass" class="w-4 h-4 text-amber-600"></i>
            <h4 id="chartActiveTitle" class="text-sm font-bold text-amber-900">
              ${currentChartType === 'D9' ? 'नवमांश कुंडली (D9 Navamsha Chart)' : 'लग्न कुंडली (D1 Lagna Chart)'}
            </h4>
          </div>
          <!-- Chart Switcher Tabs -->
          <div class="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button id="chartD1Btn" onclick="switchKundliChart('D1')" 
              class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentChartType === 'D1' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:text-black'}">
              लग्न (D1)
            </button>
            <button id="chartD9Btn" onclick="switchKundliChart('D9')" 
              class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentChartType === 'D9' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-700 hover:text-black'}">
              नवमांश (D9)
            </button>
          </div>
        </div>

        <div id="kundliSvgWrapper" class="w-full max-w-md mx-auto aspect-square flex items-center justify-center bg-amber-50/30 rounded-2xl p-2 border border-amber-100">
          ${svgChart}
        </div>
        <p class="text-[11px] text-slate-500 italic">भावों (1-12) के फल व अर्थ जानने हेतु नीचे दिए गए भाव बटन पर टैप करें।</p>
        
        <!-- House Quick Buttons -->
        <div class="flex flex-wrap justify-center gap-1.5 pt-2">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => `
            <button onclick="openHouseDrawer(${h})" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-800 text-[10px] font-bold border border-slate-200 transition-all shadow-xs">
              भाव ${h}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Planetary Positions Table -->
      <div class="space-y-4">
        <h4 class="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
          <i data-lucide="layers" class="w-4 h-4 text-purple-600"></i>
          <span>ग्रह स्थिति एवं नक्षत्र (Planetary Longitudes)</span>
        </h4>
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">ग्रह</th>
                <th class="p-2.5">राशि</th>
                <th class="p-2.5">अंश</th>
                <th class="p-2.5">भाव</th>
                <th class="p-2.5">नक्षत्र (पाद)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800">
              ${data.planets.map(p => `
                <tr class="hover:bg-amber-50/50 transition-colors">
                  <td class="p-2.5 font-bold flex items-center space-x-1.5">
                    <span>${p.symbol}</span>
                    <span>${p.hindi}</span>
                    ${p.isRetrograde ? '<span class="text-[9px] text-rose-600 font-bold ml-1">(व)</span>' : ''}
                  </td>
                  <td class="p-2.5 font-semibold text-amber-800">${p.rashi}</td>
                  <td class="p-2.5 text-slate-600 font-mono">${p.rashiDegreeStr}</td>
                  <td class="p-2.5 font-bold text-blue-700">भाव ${p.house}</td>
                  <td class="p-2.5 text-purple-700">${p.nakshatra} (प ${p.pada})</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Vimshottari Mahadasha Timeline -->
    <div class="bg-white p-5 rounded-3xl border border-purple-200 space-y-4 shadow-sm">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-purple-900 flex items-center space-x-1.5">
          <i data-lucide="clock" class="w-4 h-4 text-purple-600"></i>
          <span>विंशोत्तरी महादशा चक्र (120 वर्ष क्रम)</span>
        </h4>
        <span class="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full">
          सक्रिय: ${currentDasha.lord} महादशा (${currentDasha.startYear} - ${currentDasha.endYear})
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        ${data.dashaTimeline.map(d => `
          <div class="p-2.5 rounded-2xl text-center border transition-all ${
            d.isCurrent 
              ? 'bg-gradient-to-b from-purple-50 to-amber-50 border-purple-500 shadow-md ring-2 ring-purple-400/40' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }">
            <p class="text-xs font-bold ${d.isCurrent ? 'text-purple-900 font-black' : 'text-slate-800'}">${d.lord}</p>
            <p class="text-[10px] text-slate-500 font-mono mt-0.5">${d.startYear} - ${d.endYear}</p>
            <span class="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
              d.isCurrent ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
            }">
              ${d.isCurrent ? 'वर्तमान (Active)' : `${d.years} वर्ष`}
            </span>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 3 Major Vedic Doshas Analysis -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <!-- Manglik Dosha -->
      <div class="bg-white p-4.5 rounded-3xl border ${data.doshas.manglik.status ? 'border-rose-300' : 'border-emerald-300'} space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900 flex items-center space-x-1">
            <i data-lucide="flame" class="w-3.5 h-3.5 text-rose-500"></i>
            <span>मांगलिक दोष (Mangal Dosh)</span>
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            data.doshas.manglik.status ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }">
            ${data.doshas.manglik.status ? `मांगलिक (${data.doshas.manglik.severity})` : 'अमांगलिक (दोष मुक्त)'}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${data.doshas.manglik.desc}</p>
      </div>

      <!-- Shani Sade Sati -->
      <div class="bg-white p-4.5 rounded-3xl border ${data.doshas.sadeSati.status ? 'border-amber-300' : 'border-emerald-300'} space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900 flex items-center space-x-1">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>शनि साढ़े साती (Sade Sati)</span>
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            data.doshas.sadeSati.status ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }">
            ${data.doshas.sadeSati.status ? `सक्रिय (${data.doshas.sadeSati.phase})` : 'साढ़े साती मुक्त'}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${data.doshas.sadeSati.desc}</p>
      </div>

      <!-- Kaal Sarp Dosha -->
      <div class="bg-white p-4.5 rounded-3xl border ${data.doshas.kaalSarp.status ? 'border-purple-300' : 'border-emerald-300'} space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-900 flex items-center space-x-1">
            <i data-lucide="disc" class="w-3.5 h-3.5 text-purple-600"></i>
            <span>कालसर्प योग (Kaal Sarp)</span>
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            data.doshas.kaalSarp.status ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
          }">
            ${data.doshas.kaalSarp.status ? `सक्रिय (${data.doshas.kaalSarp.type})` : 'दोष मुक्त'}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${data.doshas.kaalSarp.desc}</p>
      </div>

    </div>

    <!-- Favorable Recommendations & Vedic Remedies -->
    <div class="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 rounded-3xl p-5 space-y-4 shadow-sm">
      <h4 class="text-sm font-bold text-amber-900 flex items-center space-x-1.5">
        <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
        <span>शुभ कारक एवं वैदिक अनुकूलता (Auspicious Elements & Remedies)</span>
      </h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">भाग्य रत्न (Gemstone)</p>
          <p class="font-bold text-amber-800 mt-0.5">${lucky.gem}</p>
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">शुभ रुद्राक्ष</p>
          <p class="font-bold text-amber-800 mt-0.5">${lucky.rudraksha}</p>
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">शुभ रंग (Color)</p>
          <p class="font-bold text-slate-800 mt-0.5">${lucky.color}</p>
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">शुभ धातु (Metal)</p>
          <p class="font-bold text-slate-800 mt-0.5">${lucky.metal}</p>
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">शुभ वार व अंक</p>
          <p class="font-bold text-slate-800 mt-0.5">${lucky.day} • अंक ${lucky.number}</p>
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p class="text-[10px] text-slate-500">इष्ट देव (Deity)</p>
          <p class="font-bold text-amber-800 mt-0.5">${lucky.deity}</p>
        </div>
      </div>
    </div>
  `;

  safeLucide();
}

function openHouseDrawer(houseNum) {
  const info = BHAVA_DETAILS[houseNum] || { name: `भाव ${houseNum}`, desc: "वैदिक कुंडली का महत्वपूर्ण भाव।" };
  document.getElementById("houseDrawerTitle").textContent = info.name;
  document.getElementById("houseDrawerBody").textContent = info.desc;
  document.getElementById("houseDrawerModal").classList.remove("hidden");
}

function closeHouseDrawer() {
  document.getElementById("houseDrawerModal").classList.add("hidden");
}

// -------------------------------------------------------------
// SETTINGS & GEMINI API KEY MODAL
// -------------------------------------------------------------
function openSettingsModal() {
  const currentKey = AiAstrologerEngine.getApiKey();
  const input = document.getElementById("customApiKeyInput");
  if (input) input.value = currentKey;
  document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}

function saveApiKeySettings() {
  const input = document.getElementById("customApiKeyInput");
  const key = input ? input.value.trim() : "";
  AiAstrologerEngine.saveApiKey(key);
  alert("✨ AI इंजन सेटिंग्स सफलतापूर्वक सहेज ली गई हैं!\nजेमिनी मॉडल रोटेशन एक्टिवेट हो चुका है।");
  closeSettingsModal();
}

// -------------------------------------------------------------
// 36 GUN MILAN ENGINE & LIGHT MODE VISUALIZER
// -------------------------------------------------------------
function populateMilanDropdowns() {
  const gRashiSel = document.getElementById("mGroomRashi");
  const bRashiSel = document.getElementById("mBrideRashi");
  const gNakSel = document.getElementById("mGroomNak");
  const bNakSel = document.getElementById("mBrideNak");

  if (!gRashiSel || !bRashiSel || !gNakSel || !bNakSel) return;

  const rashiOptions = AstroEngine.RASHIS.map((r, i) => `<option value="${i}">${r.name} (${r.en})</option>`).join("");
  const nakOptions = AstroEngine.NAKSHATRAS.map((n, i) => `<option value="${i}">${n.name}</option>`).join("");

  gRashiSel.innerHTML = rashiOptions;
  bRashiSel.innerHTML = rashiOptions;
  gNakSel.innerHTML = nakOptions;
  bNakSel.innerHTML = nakOptions;

  gRashiSel.value = "0";
  gNakSel.value = "0";
  bRashiSel.value = "4";
  bNakSel.value = "9";
}

function calculateGunMilan(isInitial = false) {
  // Gatekeeper: Interactive calculation requires Google Login
  if (!isInitial && typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => calculateGunMilan())) {
    return;
  }

  const gName = document.getElementById("mGroomName")?.value || "वर (Groom)";
  const bName = document.getElementById("mBrideName")?.value || "वधू (Bride)";

  const gRashi = parseInt(document.getElementById("mGroomRashi")?.value || "0");
  const bRashi = parseInt(document.getElementById("mBrideRashi")?.value || "4");
  const gNak = parseInt(document.getElementById("mGroomNak")?.value || "0");
  const bNak = parseInt(document.getElementById("mBrideNak")?.value || "9");

  const gManglik = document.getElementById("mGroomManglik")?.checked || false;
  const bManglik = document.getElementById("mBrideManglik")?.checked || false;

  saveMilanInputToStorage();

  const matchData = KundliMilan.calculateMatch(
    { name: gName, moonSignIndex: gRashi, nakshatraIndex: gNak, isManglik: gManglik },
    { name: bName, moonSignIndex: bRashi, nakshatraIndex: bNak, isManglik: bManglik }
  );

  localStorage.setItem("divya_last_milan", JSON.stringify(matchData));
  renderMilanResult(matchData);
}

function renderMilanResult(match) {
  const container = document.getElementById("milanResult");
  if (!container) return;

  const kootSignificances = {
    "Varna": "आध्यात्मिक व कार्य स्वभाव सामंजस्य (Spiritual Ego)",
    "Vashya": "पारस्परिक आकर्षण एवं अधिकार (Mutual Attraction)",
    "Tara": "भाग्य, स्वास्थ्य एवं दीर्घायु अनुकूलता (Destiny & Health)",
    "Yoni": "जैविक एवं वैवाहिक सामंजस्य (Biological Affinity)",
    "Graha Maitri": "मानसिक व मनोवैज्ञानिक मित्रता (Psychological Harmony)",
    "Gana": "स्वभाव एवं जीवनशैली का मिलान (Temperament)",
    "Bhakoot": "वंश वृद्धि एवं पारिवारिक समृद्धि (Family & Wealth)",
    "Nadi": "आनुवंशिक स्वास्थ्य व संतान योग (Genetic Energy)"
  };

  container.innerHTML = `
    <!-- Total Score Summary Card -->
    <div class="bg-white p-6 sm:p-7 rounded-3xl border border-rose-300 text-center space-y-4 shadow-sm">
      <span class="text-xs uppercase tracking-widest text-rose-700 font-extrabold px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 inline-block">
        अष्टकूट मिलान परिणाम (Ashtakoot Match Result)
      </span>
      <div class="text-5xl sm:text-6xl font-black text-slate-900 font-mystic">
        <span class="text-amber-600">${match.totalScore}</span>
        <span class="text-slate-400 text-3xl">/ 36</span>
      </div>
      <p class="text-xl font-black ${match.verdictClass}">${match.verdict} (${match.percentage}%)</p>
      <p class="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">${match.recommendation}</p>

      <!-- Manglik Status Bar -->
      <div class="mt-4 inline-flex items-center space-x-2 text-xs bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
        <span class="text-slate-600 font-semibold">मांगलिक विश्लेषण: </span>
        <span class="text-amber-800 font-bold">${match.manglikMatch}</span>
      </div>
    </div>

    <!-- 8 Kootas Detailed Table -->
    <div class="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-sm overflow-hidden">
      <h4 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
        <i data-lucide="table" class="w-4 h-4 text-rose-500"></i>
        <span>अष्टकूट 8 गुणों का संपूर्ण विवरण (Detailed Ashtakoot Breakdown)</span>
      </h4>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th class="p-3">कूट (Koota)</th>
              <th class="p-3">वर (Groom)</th>
              <th class="p-3">वधू (Bride)</th>
              <th class="p-3">प्राप्तांक</th>
              <th class="p-3">अधिकतम</th>
              <th class="p-3">वैदिक फल व सामंजस्य</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
            ${match.koots.map(k => `
              <tr class="hover:bg-rose-50/30 transition-colors">
                <td class="p-3 font-bold text-slate-900">
                  <span>${k.name}</span>
                  <p class="text-[10px] text-slate-400 font-normal">${kootSignificances[k.name] || ''}</p>
                </td>
                <td class="p-3 font-semibold text-blue-700">${k.groom || '-'}</td>
                <td class="p-3 font-semibold text-rose-700">${k.bride || '-'}</td>
                <td class="p-3 font-black text-sm ${k.score === k.max ? 'text-emerald-600' : k.score > 0 ? 'text-amber-600' : 'text-rose-600'}">
                  ${k.score}
                </td>
                <td class="p-3 text-slate-500 font-bold">${k.max}</td>
                <td class="p-3 text-slate-600 text-xs">${k.desc}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  safeLucide();
}

// -------------------------------------------------------------
// PANCHANG ENGINE (LIGHT MODE)
// -------------------------------------------------------------
function onPanchangDateChange() {
  savePanchangPrefToStorage();
  renderPanchang();
}

function onPanchangCityChange() {
  savePanchangPrefToStorage();
  renderPanchang();
}

function renderPanchang() {
  const container = document.getElementById("panchangContainer");
  if (!container) return;

  const datePicker = document.getElementById("panchangDatePicker");
  const citySelect = document.getElementById("panchangCitySelect");

  let targetDate = new Date();
  if (datePicker && datePicker.value) {
    const parts = datePicker.value.split("-");
    if (parts.length === 3) {
      targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    }
  } else if (datePicker) {
    datePicker.value = new Date().toISOString().split("T")[0];
  }

  const cityName = (citySelect && citySelect.value) ? citySelect.value : "New Delhi";
  const panchang = PanchangEngine.calculatePanchang(targetDate);

  container.innerHTML = `
    <!-- Top Date & Location Banner -->
    <div class="bg-white rounded-3xl p-6 text-center space-y-3 border border-amber-300 shadow-sm">
      <div class="inline-block px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-800 text-xs font-bold">
        📍 स्थान: ${cityName} (भारतीय मानक समय IST)
      </div>
      <h3 class="text-2xl font-black font-mystic gold-gradient-text">${panchang.dateFormatted}</h3>
      <p class="text-xs text-slate-600 font-semibold">${panchang.weekday} (वार स्वामी: <span class="text-amber-800 font-bold">${panchang.weekdayLord}</span>)</p>

      <!-- 5 Pillars Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-left">
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <p class="text-[10px] text-slate-500 uppercase font-semibold">तिथि (Tithi)</p>
          <p class="text-xs font-bold text-amber-800 mt-1">${panchang.tithi}</p>
          <div class="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-amber-500 h-full" style="width: ${panchang.tithiProgress}%;"></div>
          </div>
        </div>

        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <p class="text-[10px] text-slate-500 uppercase font-semibold">नक्षत्र (Nakshatra)</p>
          <p class="text-xs font-bold text-purple-700 mt-1">${panchang.nakshatra}</p>
          <p class="text-[10px] text-slate-500 mt-1">स्वामी: ${panchang.nakshatraLord} • देव: ${panchang.nakshatraDeity}</p>
        </div>

        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <p class="text-[10px] text-slate-500 uppercase font-semibold">योग (Yoga)</p>
          <p class="text-xs font-bold text-emerald-700 mt-1">${panchang.yoga}</p>
          <p class="text-[10px] text-slate-500 mt-1">करण: ${panchang.karana}</p>
        </div>

        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <p class="text-[10px] text-slate-500 uppercase font-semibold">सूर्य व चंद्र राशि</p>
          <p class="text-xs font-bold text-blue-700 mt-1">चंद्र: ${panchang.rashiMoon}</p>
          <p class="text-[10px] text-amber-700 font-semibold mt-1">सूर्य: ${panchang.rashiSun}</p>
        </div>
      </div>
    </div>

    <!-- Auspicious & Inauspicious Muhurats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- Auspicious Timings -->
      <div class="bg-white rounded-3xl p-5 border border-emerald-200 space-y-3 shadow-sm">
        <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
          <span>शुभ मुहूर्त (Auspicious Timings)</span>
        </h4>
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span class="font-bold text-emerald-900">अभिजीत मुहूर्त</span>
            <span class="font-bold text-emerald-800 font-mono">${panchang.abhijitMuhurat}</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span class="font-bold text-emerald-900">अमृत काल</span>
            <span class="font-bold text-emerald-800 font-mono">${panchang.amritKaal}</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span class="font-medium text-slate-700">सूर्योदय एवं सूर्यास्त</span>
            <span class="font-bold text-amber-700 font-mono">🌅 ${panchang.sunrise} • 🌇 ${panchang.sunset}</span>
          </div>
        </div>
      </div>

      <!-- Inauspicious Timings -->
      <div class="bg-white rounded-3xl p-5 border border-rose-200 space-y-3 shadow-sm">
        <h4 class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
          <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i>
          <span>अशुभ काल (Inauspicious Windows - वर्ज्य)</span>
        </h4>
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <div>
              <span class="font-bold text-rose-900">राहु काल</span>
              <p class="text-[10px] text-rose-600">शुभ कार्य वर्जित</p>
            </div>
            <span class="font-bold text-rose-800 font-mono">${panchang.rahuKaal}</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <div>
              <span class="font-bold text-rose-900">यमगण्ड</span>
              <p class="text-[10px] text-rose-600">हानिकारक काल</p>
            </div>
            <span class="font-bold text-rose-800 font-mono">${panchang.yamaghanda}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Choghadiya Table -->
    <div class="bg-white rounded-3xl border border-amber-200 p-5 space-y-3 shadow-sm">
      <h4 class="text-sm font-bold text-amber-900 flex items-center space-x-2">
        <i data-lucide="clock" class="w-4 h-4 text-amber-600"></i>
        <span>आज का दिन का चौघड़िया (Day Choghadiya Muhurat)</span>
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        ${panchang.shubhChoghadiya.map(c => `
          <div class="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900">${c.name} (${c.type})</span>
              <span class="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">शुभ</span>
            </div>
            <p class="text-xs font-mono font-bold text-slate-800">${c.time}</p>
            <p class="text-[10px] text-slate-500">${c.desc}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  safeLucide();
}

// -------------------------------------------------------------
// 3D TAROT ORACLE
// -------------------------------------------------------------
function drawTarotSpread(isInitial = false) {
  // Gatekeeper: Drawing new spread requires Google Login
  if (!isInitial && typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => drawTarotSpread())) {
    return;
  }

  const container = document.getElementById("tarotCardsContainer");
  if (!container) return;

  const cards = TarotEngine.drawCards(3);
  const titles = ["1. भूतकाल (Past Influence)", "2. वर्तमान (Present Energy)", "3. भविष्य (Future Outcome)"];

  container.innerHTML = cards.map((card, idx) => `
    <div class="space-y-3">
      <span class="text-xs font-bold text-indigo-900">${titles[idx]}</span>
      <div class="relative w-full aspect-[2/3] max-w-[260px] mx-auto perspective-1000 cursor-pointer" onclick="flipTarotCard(this)">
        <div class="tarot-card-inner w-full h-full relative rounded-3xl shadow-xl transition-transform duration-700">
          <div class="card-face absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-600 to-indigo-900 border-2 border-amber-300 p-4 flex flex-col items-center justify-between text-white">
            <div class="text-[10px] uppercase tracking-widest text-amber-200 font-bold">दिव्य टैरो</div>
            <div class="text-4xl">🔮</div>
            <p class="text-[11px] text-amber-100">टैप कर कार्ड खोलें</p>
          </div>
          <div class="card-face card-back absolute inset-0 rounded-3xl bg-white border-2 border-amber-400 p-4 flex flex-col justify-between shadow-md text-left">
            <div>
              <span class="text-[10px] uppercase tracking-widest text-amber-700 font-bold">${card.arcana || 'Major'} Arcana</span>
              <h4 class="text-sm font-bold text-slate-900 mt-1">${card.name}</h4>
              <p class="text-[10px] font-semibold ${!card.isReversed ? 'text-emerald-600' : 'text-rose-600'}">
                ${!card.isReversed ? 'सीधा (Upright)' : 'उल्टा (Reversed)'}
              </p>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed my-2">${card.meaning || card.upright}</p>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>तत्व: ${card.element}</span>
              <span class="font-bold text-amber-800">कीवर्ड: ${Array.isArray(card.keywords) ? card.keywords.slice(0, 2).join(", ") : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function flipTarotCard(el) {
  const inner = el.querySelector(".tarot-card-inner");
  if (inner) {
    inner.classList.toggle("flipped");
    JaapAudio.playBeadClick();
  }
}

// -------------------------------------------------------------
// NUMEROLOGY CALCULATOR
// -------------------------------------------------------------
function calculateNumerologyUI(isInitial = false) {
  // Gatekeeper: Interactive calculation requires Google Login
  if (!isInitial && typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => calculateNumerologyUI())) {
    return;
  }

  const name = document.getElementById("numName")?.value || "Prajwal";
  const dob = document.getElementById("numDob")?.value || "1998-07-21";
  const container = document.getElementById("numerologyResult");
  if (!container) return;

  saveNumerologyInputToStorage();

  const data = NumerologyEngine.calculate(name, dob);
  localStorage.setItem("divya_last_numerology", JSON.stringify(data));

  // Personal Year Number for current calendar year (2026)
  const parts = dob.split('-');
  const bDay = parseInt(parts[2]) || 21;
  const bMonth = parseInt(parts[1]) || 7;
  const currentYear = new Date().getFullYear();
  let pySum = 0;
  for (let ch of `${bDay}${bMonth}${currentYear}`) {
    if (!isNaN(parseInt(ch))) pySum += parseInt(ch);
  }
  while (pySum > 9) {
    pySum = pySum.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
  }

  container.innerHTML = `
    <!-- Top 3 Numbers Hero Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      <div class="bg-white p-5 rounded-3xl border border-amber-300 text-center space-y-2 shadow-sm">
        <span class="text-[10px] uppercase text-amber-700 font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 inline-block">
          मूलांक (Birth / Root Number)
        </span>
        <div class="text-5xl font-black text-amber-600 font-mystic">${data.mulank.number}</div>
        <p class="text-xs font-bold text-slate-900">${data.mulank.name}</p>
        <p class="text-[11px] text-slate-500">स्वामी ग्रह: <b>${data.mulank.planet}</b> • तत्व: ${data.mulank.element}</p>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-purple-300 text-center space-y-2 shadow-sm">
        <span class="text-[10px] uppercase text-purple-700 font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 inline-block">
          भाग्यांक (Destiny / Life Path)
        </span>
        <div class="text-5xl font-black text-purple-600 font-mystic">${data.bhagyank.number}</div>
        <p class="text-xs font-bold text-slate-900">${data.bhagyank.name}</p>
        <p class="text-[11px] text-slate-500">स्वामी ग्रह: <b>${data.bhagyank.planet}</b> • तत्व: ${data.bhagyank.element}</p>
      </div>

      <div class="bg-white p-5 rounded-3xl border border-cyan-300 text-center space-y-2 shadow-sm">
        <span class="text-[10px] uppercase text-cyan-700 font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 inline-block">
          नामांक (Name Vibration - Chaldean)
        </span>
        <div class="text-5xl font-black text-cyan-600 font-mystic">${data.namank.number}</div>
        <p class="text-xs font-bold text-slate-900">${data.namank.name}</p>
        <p class="text-[11px] text-slate-500">स्वामी ग्रह: <b>${data.namank.planet}</b></p>
      </div>

    </div>

    <!-- Core Characteristics & Sacred Mantra -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-3xl p-5 border border-slate-200 space-y-2 shadow-sm">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
          <i data-lucide="zap" class="w-4 h-4 text-amber-500"></i>
          <span>व्यक्तित्व के मुख्य गुण (Core Strengths)</span>
        </h4>
        <p class="text-xs text-slate-700 leading-relaxed">${data.mulank.traits}</p>
        <div class="pt-2 border-t border-slate-100">
          <p class="text-[11px] text-rose-700"><b>सावधानी:</b> ${data.mulank.weakness}</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-200 space-y-2 shadow-sm">
        <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
          <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
          <span>सिद्ध बीज मंत्र (Daily Planetary Mantra)</span>
        </h4>
        <p class="text-sm font-bold text-amber-900 font-sanskrit">ॐ ${data.mulank.mantra || 'सूर्याय नमः'}</p>
        <p class="text-[11px] text-slate-600">प्रतिदिन प्रातः इस मंत्र का 11 बार जप करने से मूलांक ${data.mulank.number} की ऊर्जा जागृत होती है।</p>
      </div>
    </div>

    <!-- Favorable Alignments & Compatibility Matrix -->
    <div class="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
      <h4 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
        <i data-lucide="target" class="w-4 h-4 text-emerald-600"></i>
        <span>अंक ज्योतिष अनुकूलता व शुभ कारक (Auspicious Grid)</span>
      </h4>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <p class="text-[10px] text-slate-500">शुभ वार (Lucky Days)</p>
          <p class="font-bold text-slate-800 mt-1">${data.mulank.luckyDays}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <p class="text-[10px] text-slate-500">शुभ तिथियां (Lucky Dates)</p>
          <p class="font-bold text-slate-800 mt-1">${data.mulank.luckyDates}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <p class="text-[10px] text-slate-500">शुभ रंग (Colors)</p>
          <p class="font-bold text-slate-800 mt-1">${Array.isArray(data.mulank.luckyColors) ? data.mulank.luckyColors.join(", ") : data.mulank.luckyColors}</p>
        </div>
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <p class="text-[10px] text-slate-500">शुभ रत्न (Gemstone)</p>
          <p class="font-bold text-amber-800 mt-1">${data.mulank.gemstone}</p>
        </div>
      </div>

      <!-- Compatibility -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        <div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
          <span class="text-[10px] font-extrabold text-emerald-800 uppercase">सर्वोत्तम मित्र अंक (Friendly)</span>
          <p class="text-sm font-black text-emerald-700 mt-1 font-mono">${(data.mulank.friendlyNumbers || []).join(", ")}</p>
          <p class="text-[10px] text-slate-500 mt-1">विवाह एवं व्यापार हेतु श्रेष्ठ</p>
        </div>

        <div class="bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
          <span class="text-[10px] font-extrabold text-rose-800 uppercase">शत्रु / वर्ज्य अंक (Avoid)</span>
          <p class="text-sm font-black text-rose-700 mt-1 font-mono">${(data.mulank.unfriendlyNumbers || []).join(", ") || 'कोई नहीं'}</p>
          <p class="text-[10px] text-slate-500 mt-1">इन अंकों से सतर्क रहें</p>
        </div>

        <div class="bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
          <span class="text-[10px] font-extrabold text-amber-800 uppercase">2026 व्यक्तिगत वर्ष (Personal Year)</span>
          <p class="text-sm font-black text-amber-800 mt-1 font-mono">वर्ष अंक ${pySum}</p>
          <p class="text-[10px] text-slate-500 mt-1">नये संकल्प एवं आर्थिक प्रगति का वर्ष</p>
        </div>
      </div>
    </div>
  `;

  safeLucide();
}

// -------------------------------------------------------------
// 108 JAAP MALA
// -------------------------------------------------------------
var beadCount = 0;
var malaRounds = 0;

function updateMantraDisplay() {
  const select = document.getElementById("malaMantraSelect");
  const activeText = document.getElementById("activeMantraText");
  const map = {
    om_namah_shivaya: "ॐ नमः शिवाय",
    gayatri: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    mahamrityunjaya: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
    ganesh: "ॐ गं गणपतये नमः"
  };
  if (activeText && select) {
    activeText.textContent = map[select.value] || "ॐ नमः शिवाय";
  }
  saveMalaStateToStorage(select ? select.value : "om_namah_shivaya", beadCount, malaRounds);
}

function incrementBead() {
  // Gatekeeper: Mala chanting requires Google Login
  if (typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => incrementBead())) {
    return;
  }

  beadCount++;
  JaapAudio.playBeadClick();

  if (beadCount >= 108) {
    beadCount = 0;
    malaRounds++;
    JaapAudio.playSingingBowlBell();
    const roundsEl = document.getElementById("malaRounds");
    if (roundsEl) roundsEl.textContent = malaRounds;
    if (typeof FirebaseAuthEngine !== "undefined" && FirebaseAuthEngine.showToast) {
      FirebaseAuthEngine.showToast("🎉 108 मनकों की 1 पूर्ण माला संपन्न हुई! ॐ शांति!");
    } else {
      alert("🎉 108 मनकों की 1 पूर्ण माला संपन्न हुई! ॐ शांति!");
    }
  }

  const beadCountEl = document.getElementById("beadCount");
  if (beadCountEl) beadCountEl.textContent = beadCount;

  const circle = document.getElementById("malaProgressCircle");
  if (circle) {
    const circumference = 2 * Math.PI * 108;
    circle.style.strokeDashoffset = circumference - (beadCount / 108) * circumference;
  }

  const select = document.getElementById("malaMantraSelect");
  saveMalaStateToStorage(select ? select.value : "om_namah_shivaya", beadCount, malaRounds);
}

function resetMala() {
  beadCount = 0;
  malaRounds = 0;
  const beadCountEl = document.getElementById("beadCount");
  if (beadCountEl) beadCountEl.textContent = 0;
  const roundsEl = document.getElementById("malaRounds");
  if (roundsEl) roundsEl.textContent = 0;
  const circle = document.getElementById("malaProgressCircle");
  if (circle) circle.style.strokeDashoffset = 678;

  const select = document.getElementById("malaMantraSelect");
  saveMalaStateToStorage(select ? select.value : "om_namah_shivaya", 0, 0);
}

// -------------------------------------------------------------
// DAILY HOROSCOPE
// -------------------------------------------------------------
function renderRashiGrid() {
  const grid = document.getElementById("rashiGrid");
  if (!grid) return;

  grid.innerHTML = HOROSCOPE_DATA.map((item, idx) => {
    const isActive = idx === activeRashiIndex;
    return `
      <button onclick="selectRashi(${idx})" 
        class="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
          isActive 
            ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-105" 
            : "bg-white hover:bg-amber-50/60 border-slate-200 text-slate-800"
        }">
        <span class="text-2xl">${item.symbol}</span>
        <span class="text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}">${item.rashi}</span>
        <span class="text-[10px] ${isActive ? 'text-amber-100' : 'text-slate-500'}">${item.en}</span>
      </button>
    `;
  }).join("");
}

function selectRashi(idx) {
  activeRashiIndex = idx;
  renderRashiGrid();
  renderRashiDetail(idx);
}

function renderRashiDetail(idx) {
  const container = document.getElementById("rashiDetailCard");
  const r = HOROSCOPE_DATA[idx];
  if (!container || !r) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
      <div class="flex items-center space-x-3">
        <span class="text-4xl">${r.symbol}</span>
        <div>
          <h3 class="text-xl font-bold text-slate-900">${r.rashi} राशि (${r.en})</h3>
          <p class="text-xs text-slate-500">${r.dates} • ${r.element} तत्व</p>
        </div>
      </div>
      <span class="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">${r.energy}% सकारात्मक ऊर्जा</span>
    </div>
    <p class="text-xs md:text-sm text-slate-700 leading-relaxed">${r.overview}</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><span class="text-slate-500">शुभ अंक</span><p class="text-amber-800 font-bold mt-1">${r.luckyNumber}</p></div>
      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><span class="text-slate-500">शुभ रंग</span><p class="text-slate-800 font-bold mt-1">${r.luckyColor}</p></div>
      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><span class="text-slate-500">शुभ समय</span><p class="text-slate-800 font-bold mt-1">${r.luckyTime}</p></div>
      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><span class="text-slate-500">मंत्र</span><p class="text-purple-700 font-bold mt-1 font-sanskrit truncate">${r.mantra}</p></div>
    </div>
  `;
}

// -------------------------------------------------------------
// GEMSTONES GRID
// -------------------------------------------------------------
function renderGemstonesGrid() {
  const grid = document.getElementById("gemstonesGrid");
  if (!grid) return;

  grid.innerHTML = GEMSTONES.map(g => `
    <div class="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-400 space-y-2 shadow-sm transition-all flex flex-col justify-between">
      <div class="space-y-2">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style="background-color: ${g.color}22;">💎</div>
        <h4 class="text-sm font-bold text-slate-900">${g.name}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">${g.benefit}</p>
        <p class="text-[11px] text-amber-800 font-medium pt-1">राशि: ${g.rashi} • धातु: ${g.metal}</p>
      </div>
      <button onclick="orderRemedy('${g.name}')" class="w-full mt-3 py-2 px-3 bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-300 font-bold text-xs rounded-xl transition-all shadow-2xs active:scale-95">
        अभिमंत्रित कराएं (Order)
      </button>
    </div>
  `).join("");
}

function orderRemedy(name) {
  if (typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => orderRemedy(name))) {
    return;
  }
  if (typeof FirebaseAuthEngine !== "undefined" && FirebaseAuthEngine.showToast) {
    FirebaseAuthEngine.showToast(`✨ ${name} हेतु परामर्श व अभिमंत्रित ऑर्डर स्वीकार कर लिया गया है!`);
  } else {
    alert(`✨ ${name} हेतु परामर्श व अभिमंत्रित ऑर्डर स्वीकार कर लिया गया है!`);
  }
}

// -------------------------------------------------------------
// LIVE STREAMING SIMULATION (ASTROTALK SIGNATURE)
// -------------------------------------------------------------
function startLiveStreamingSimulation() {
  const container = document.getElementById("liveCommentsStream");
  if (!container) return;

  let index = 0;
  setInterval(() => {
    const c = SAMPLE_LIVE_COMMENTS[index % SAMPLE_LIVE_COMMENTS.length];
    index++;

    const div = document.createElement("div");
    div.className = "comment-item flex items-center space-x-1.5 text-[11px] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 text-slate-800 max-w-fit shadow-xs";
    div.innerHTML = `
      <span class="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">${c.badge}</span>
      <span class="font-bold text-slate-900">${c.user}:</span>
      <span class="text-slate-700">${c.text}</span>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    while (container.children.length > 5) {
      container.removeChild(container.firstChild);
    }

    const viewerEl = document.getElementById("liveViewerCount");
    if (viewerEl) {
      const v = 1420 + Math.floor(Math.random() * 40);
      viewerEl.textContent = v.toLocaleString();
    }
  }, 2400);
}

function sendLiveGift(emoji, giftName, cost) {
  if (!ConsultationEngine.deductWallet(cost)) {
    alert("पर्याप्त वॉलेट बैलेंस नहीं है! कृपया वॉलेट रिचार्ज करें।");
    openWalletModal();
    return;
  }

  document.getElementById("walletHeaderAmount").textContent = `₹ ${ConsultationEngine.getWalletBalance()}`;

  const container = document.getElementById("floatingGiftsContainer");
  if (container) {
    const el = document.createElement("div");
    el.className = "floating-gift-anim absolute bottom-0 right-4 text-3xl select-none";
    el.textContent = emoji;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  const stream = document.getElementById("liveCommentsStream");
  if (stream) {
    const div = document.createElement("div");
    div.className = "comment-item flex items-center space-x-1.5 text-[11px] bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300 text-amber-900 font-bold max-w-fit shadow-sm";
    div.innerHTML = `<span>🎁 आपने ${giftName} ${emoji} अर्पित किया!</span>`;
    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;
  }

  JaapAudio.playBeadClick();
}

function joinLiveQueue() {
  alert("🎉 आप लाइव प्रश्न कतार (Queue) में जुड़ चुके हैं!\nक्रमांक: 3\nआचार्य जी अगले 2 मिनट में आपसे सीधे मुखातिब होंगे।");
}

// -------------------------------------------------------------
// STORIES MODAL ENGINE
// -------------------------------------------------------------
const STORIES_CONTENT = {
  live: { icon: "🔱", title: "लाइव महाआरती व दर्शन", heading: "काशी विश्वनाथ मंदिर लाइव दर्शन", body: "आज विशेष एकादशी के पावन अवसर पर द्वादश ज्योतिर्लिंग के दर्शन करें और महादेव का मंगलकारी आशीर्वाद प्राप्त करें। ॐ नमः शिवाय!" },
  rahu: { icon: "⏳", title: "राहुकाल विशेष सूचना", heading: "आज का राहुकाल समय", body: "राहुकाल के दौरान कोई भी नवीन व्यापार, गृह प्रवेश अथवा विवाह वार्ता आरंभ करने से बचें। हनुमान चालीसा का पाठ करें।" },
  marriage: { icon: "💍", title: "विवाह योग 2026", heading: "शुभ विवाह मुहूर्त व नक्षत्र", body: "गुरु के वृषभ राशि से मिथुन राशि में प्रवेश के साथ विवाह के अत्यंत श्रेष्ठ योग निर्मित हो रहे हैं। मांगलिक दोष शांति के उपाय अवश्य करें।" }
};

function openStoryModal(type) {
  const data = STORIES_CONTENT[type] || STORIES_CONTENT.live;
  document.getElementById("storyIcon").textContent = data.icon;
  document.getElementById("storyTitle").textContent = data.title;
  document.getElementById("storyHeading").textContent = data.heading;
  document.getElementById("storyBody").textContent = data.body;
  document.getElementById("storyViewerModal").classList.remove("hidden");
}

function closeStoryModal() {
  document.getElementById("storyViewerModal").classList.add("hidden");
}

// -------------------------------------------------------------
// AUDIO OM DRONE & WALLET
// -------------------------------------------------------------
function toggleDrone() {
  const isPlaying = JaapAudio.getIsDronePlaying();
  JaapAudio.toggleOmDrone(!isPlaying);
  const btn = document.getElementById("omDroneBtn");
  if (btn) {
    btn.classList.toggle("bg-purple-600", !isPlaying);
    btn.classList.toggle("text-white", !isPlaying);
  }
}

function openWalletModal() {
  if (typeof FirebaseAuthEngine !== "undefined" && !FirebaseAuthEngine.requireAuth(() => openWalletModal())) {
    return;
  }
  document.getElementById("modalWalletBalance").textContent = ConsultationEngine.getWalletBalance();
  document.getElementById("walletModal").classList.remove("hidden");
}

function closeWalletModal() {
  document.getElementById("walletModal").classList.add("hidden");
}

function addBalance(amount) {
  const newBal = ConsultationEngine.addWalletBalance(amount);
  document.getElementById("walletHeaderAmount").textContent = `₹ ${newBal}`;
  document.getElementById("modalWalletBalance").textContent = newBal;
  alert(`₹ ${amount} वॉलेट में सफलतापूर्वक जोड़ दिए गए हैं!`);
  closeWalletModal();
}

function openDoshaModal() {
  switchTab("kundli");
}

function openTransitRadarModal() {
  const modal = document.getElementById("transitRadarModal");
  if (modal) modal.classList.remove("hidden");
}

function closeTransitRadarModal() {
  const modal = document.getElementById("transitRadarModal");
  if (modal) modal.classList.add("hidden");
}

// -------------------------------------------------------------
// APP INITIALIZATION (SAFE EXECUTION WRAPPER)
// -------------------------------------------------------------
function safeRun(fn, name) {
  try {
    fn();
  } catch (err) {
    console.error(`Error during initialization of ${name}:`, err);
  }
}

function initApp() {
  // 0. Initialize Firebase Google Auth Engine & Header UI
  if (typeof FirebaseAuthEngine !== "undefined") {
    safeRun(FirebaseAuthEngine.init, "FirebaseAuthEngine.init");
  }

  // 1. Load Stored Inputs from LocalStorage (Persistent Forms)
  safeRun(loadKundliInputFromStorage, "loadKundliInputFromStorage");
  safeRun(loadMilanInputFromStorage, "loadMilanInputFromStorage");
  safeRun(loadNumerologyInputFromStorage, "loadNumerologyInputFromStorage");
  safeRun(loadPanchangPrefFromStorage, "loadPanchangPrefFromStorage");

  // Restore saved Mala bead count & rounds from LocalStorage
  const savedMala = loadMalaStateFromStorage();
  if (savedMala) {
    beadCount = savedMala.count || 0;
    malaRounds = savedMala.rounds || 0;
    const bCountEl = document.getElementById("beadCount");
    const mRoundsEl = document.getElementById("malaRounds");
    if (bCountEl) bCountEl.textContent = beadCount;
    if (mRoundsEl) mRoundsEl.textContent = malaRounds;
    if (savedMala.mantraId && document.getElementById("malaMantraSelect")) {
      document.getElementById("malaMantraSelect").value = savedMala.mantraId;
      updateMantraDisplay();
    }
    const circle = document.getElementById("malaProgressCircle");
    if (circle) {
      const circumference = 2 * Math.PI * 108;
      circle.style.strokeDashoffset = circumference - (beadCount / 108) * circumference;
    }
  }

  // 2. Astrologers rendered FIRST so user immediately sees 48 modern consultants!
  safeRun(renderAstrologersDirectories, "renderAstrologersDirectories");

  // 3. Daily Horoscope
  safeRun(renderRashiGrid, "renderRashiGrid");
  safeRun(() => renderRashiDetail(activeRashiIndex), "renderRashiDetail");

  // 4. Panchang & Choghadiya
  safeRun(renderPanchang, "renderPanchang");

  // 5. 36 Gun Milan (Initial Non-blocking Render)
  safeRun(populateMilanDropdowns, "populateMilanDropdowns");
  safeRun(() => calculateGunMilan(true), "calculateGunMilan(true)");

  // 6. 3D Tarot (Initial Non-blocking Spread)
  safeRun(() => drawTarotSpread(true), "drawTarotSpread(true)");

  // 7. Numerology (Initial Non-blocking Calculation)
  safeRun(() => calculateNumerologyUI(true), "calculateNumerologyUI(true)");

  // 8. Gemstones Grid
  safeRun(renderGemstonesGrid, "renderGemstonesGrid");

  // 9. Default Kundli (Initial Non-blocking Render)
  safeRun(() => generateKundli(true), "generateKundli(true)");

  // 10. Live streaming simulation
  safeRun(startLiveStreamingSimulation, "startLiveStreamingSimulation");

  // 11. Lucide Icons
  safeLucide();
}

// Reliable DOM Initialization (Handles already-loaded readyStates)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
