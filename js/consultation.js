/**
 * Divya Jyotish - Live Astrologer Consultation & AI Guru Engine
 * Manages: Astrologers directory, live interactive chat simulator,
 * incoming/outgoing audio call screen simulator, wallet credits, and AI Guru responses.
 */

const ConsultationEngine = (function () {
  const ASTROLOGERS = (typeof window !== "undefined" && window.ASTROLOGERS_DATABASE) 
    ? window.ASTROLOGERS_DATABASE 
    : [
    {
      id: "ast_1",
      name: "Devika Mehra",
      nameHindi: "देविका मेहरा",
      title: "Celebrity Tarot & Soulmate Expert",
      avatar: "avatars/ast_1.jpg",
      skills: ["Tarot", "Soulmates", "Love"],
      languages: ["English", "Hindi"],
      experience: "12+ Yrs",
      rating: 4.98,
      orders: "54,200+",
      ratePerMin: 25,
      isOnline: true,
      bio: "Deep intuitive guidance on relationship crossroads, soulmate timing, and emotional healing."
    },
    {
      id: "ast_2",
      name: "Aarav Sharma",
      nameHindi: "आरव शर्मा",
      title: "Vedic & Life Transformation Coach",
      avatar: "avatars/ast_2.jpg",
      skills: ["Vedic", "Career Growth", "Life Path"],
      languages: ["English", "Hindi"],
      experience: "15+ Yrs",
      rating: 4.97,
      orders: "68,400+",
      ratePerMin: 30,
      isOnline: true,
      bio: "Bridging ancient Vedic wisdom with modern career strategies and psychological alignment."
    },
    {
      id: "ast_3",
      name: "Rohan Malhotra",
      nameHindi: "रोहन मल्होत्रा",
      title: "Financial & Wealth Strategist",
      avatar: "avatars/ast_3.jpg",
      skills: ["Career", "Wealth Cycle", "Investments"],
      languages: ["English", "Hindi", "Punjabi"],
      experience: "14+ Yrs",
      rating: 4.96,
      orders: "42,900+",
      ratePerMin: 28,
      isOnline: true,
      bio: "Specialist in career shifts, salary growth timeframes, and wealth investments."
    },
    {
      id: "ast_4",
      name: "Ananya Verma",
      nameHindi: "अनन्या वर्मा",
      title: "Love & Relationship Counselor",
      avatar: "avatars/ast_4.jpg",
      skills: ["Love", "Marriage", "Compatibility"],
      languages: ["English", "Hindi"],
      experience: "11+ Yrs",
      rating: 4.98,
      orders: "49,100+",
      ratePerMin: 22,
      isOnline: true,
      bio: "Helping couples navigate misunderstandings, family approval, and marriage readiness."
    }
  ];

  let walletBalance = 150; // Starting bonus for new users
  let activeAstrologer = ASTROLOGERS[0];
  let callTimerInterval = null;
  let callSeconds = 0;

  // AI Astrologer Knowledge Base & Dynamic Dialogue Engine
  const ASTRO_RESPONSES = {
    career: [
      "Aapki kundli me 10th House (Karma Bhava) par Guru (Jupiter) ki shubh drishti ban rahi he. Agle 3 se 6 mahine me padonnati (promotion) aur naye business opportunities ke prabal yog hain. Roz subah Surya Deva ko taambe ke lote se arghya dekar 'Om Suryaya Namaha' ka jaap karein.",
      "Karma sthan me Shani Dev ki upsthiti aapko shuruat me kathin parishram karwati he, lekin yah safalta sthir aur lambi deti he. Chhoti-moti rukawat se ghabrayen nahi, Budhaditya yog ke prabhav se aane wala quarter aapke liye turning point rahega."
    ],
    marriage: [
      "7th house (Saptam Bhava) aur Shukra (Venus) ki dasha check karne par lagta he ki aapka jeevansathi shant, sanskari aur samajik pratishtha wala hoga. Manglik prabhav samanya he aur koi bada dosha nahi he. Guruwar ko peele vastra dharan karein aur Vishnu Sahasranama sunein.",
      "Kundli me vivah ke yog aane wale 8 se 14 mahine ke beech sabse anukool hain. Jeevansathi se mulaqaat kisi family function, yatra ya professional setting ke zariye hone ke sanket hain."
    ],
    money: [
      "Dhan sthan (2nd house) aur Labha sthan (11th house) dono majboot sthiti me hain. Halaanki kharche thode aniyantrit ho sakte hain. Shukrawar ke din Lakshmi Ji ko kheer ka bhog lagayein aur Shukra Beej Mantra ka 11 baar smaran karein, dhan ka aavagaman tezi se badhega.",
      "Aapke liye multi-income sources ke dwar khul rahe hain. Digital, tech ya creative kshetra me lagaya gaya dhan dugna laabh dega. Udhaar dene se bachein."
    ],
    health: [
      "Lagna Lord aur Chandra balwaan hain, isliye badi samasya nahi he. Kintu stress aur anidra (lack of sleep) par dhyan dena zaroori he. Roz subah 10 minute Omkar ka dhyan karein aur taambe ke bartan ka jal piyein.",
      "Pranayama aur Shiv Aradhana aapki sharirik urja ko 100% recharge kar degi. Rahu ka prabhav kam karne ke liye pakshiyo ko daana daalein."
    ],
    gemstone: [
      "Aapki Lagna aur Rashi ke anusaar, Pukhraj (Yellow Sapphire) ya Panna (Emerald) dharan karna aapke bhagya aur buddhi ko tezi se unlock karega. Kisi bhi ratna ko dharan karne se pehle use Ganga jal aur kachhe doodh se shuddh avashya karein.",
      "Aapke liye 5 Mukhi ya 7 Mukhi Rudraksha dharan karna sarvottam he. Yah sharirik arogya ke sath-sath mansik shanti pradan karta he."
    ],
    default: [
      "Jai Shri Ram! Aapka prashna mahatvapurna he. Aapki dasha chakra aur gochar planets ka adhyayan karne par pata chalta he ki vartaman samay dhyan aur dhairya ka he. Naye faisle lene se pehle bado ka aashirwad lein aur Mahamrityunjaya Mantra ka jaap karein.",
      "Pranam! Aapki kundli me Navagraha anukool sthiti me aane shuru ho gaye hain. Niyamit roop se Gayatri Mantra ka 108 baar smaran karein, saare rukavat swatah door ho jayenge."
    ]
  };

  function getAstroReply(userText) {
    const text = userText.toLowerCase();
    let category = "default";
    if (text.includes("career") || text.includes("naukri") || text.includes("job") || text.includes("promotion") || text.includes("business") || text.includes("paisa") || text.includes("income")) {
      category = (text.includes("paisa") || text.includes("income") || text.includes("money") || text.includes("dhan")) ? "money" : "career";
    } else if (text.includes("shaadi") || text.includes("vivah") || text.includes("marriage") || text.includes("love") || text.includes("partner") || text.includes("pyaar")) {
      category = "marriage";
    } else if (text.includes("health") || text.includes("swasthya") || text.includes("bimaari") || text.includes("tension") || text.includes("stress")) {
      category = "health";
    } else if (text.includes("gemstone") || text.includes("ratna") || text.includes("stone") || text.includes("rudraksha") || text.includes("upay")) {
      category = "gemstone";
    }

    const options = ASTRO_RESPONSES[category] || ASTRO_RESPONSES.default;
    return options[Math.floor(Math.random() * options.length)];
  }

  function addWalletBalance(amount) {
    walletBalance += amount;
    return walletBalance;
  }

  function deductWallet(amount) {
    if (walletBalance >= amount) {
      walletBalance -= amount;
      return true;
    }
    return false;
  }

  function getWalletBalance() {
    return walletBalance;
  }

  return {
    ASTROLOGERS,
    getAstroReply,
    addWalletBalance,
    deductWallet,
    getWalletBalance,
    getActiveAstrologer: () => activeAstrologer,
    setActiveAstrologer: (ast) => { activeAstrologer = ast; }
  };
})();

if (typeof window !== "undefined") {
  window.ConsultationEngine = ConsultationEngine;
}
