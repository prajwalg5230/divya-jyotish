/**
 * Divya Jyotish - Supercharged Client-Side AI & RAG Astrologer Engine
 * Powered by Distributed Client-Side Pollinations AI + Multi-Key Gemini Rotation
 * Features:
 *  - Strict brevity (45-70 words): direct, razor-sharp answers
 *  - High topical accuracy: answering strictly what was asked
 *  - Dynamic non-repetitive responses via dynamic seed, randomized openings, and diversified planetary angles
 *  - Instant fail-safe cognitive Vedic synthesizer with 5 distinct variants per topic
 */

var AiAstrologerEngine = (function () {
  const STORAGE_KEY_API = "divya_gemini_api_key";
  const STORAGE_KEY_MEM = "divya_user_astromemory";
  const STORAGE_KEY_CHAT_HISTORY = "divya_rag_chat_history";

  // Built-in Gemini API keys rotation pool
  const BUILTIN_GEMINI_KEYS = [
    "AIzaSyDTektnRP1hkH9LDP4c0LQGsqhJyyEx2n0",
    "AIzaSyBA7PeV1MLGneq6z_yY4OMY10wvoz9JrTg",
    "AIzaSyCR1AdUEtPqUFo8FMgW37YLwRCoqM3Ojlw",
    "AIzaSyA9PzmUsP158HhUAOIj1TUV1o7ZdkFA1gg",
    "AIzaSyCv8lnuEBWNo6AiDg0qsn-KfUjU2McJ45g"
  ];

  // Strongest verified models for Pollinations AI rotation
  const POLLINATIONS_STRONG_MODELS = [
    "openai-fast",     // Fast reasoning LLM (Anonymous free tier)
    "openai"           // GPT reasoning flagship
  ];

  // Dynamic Astrological Action beats in Professional Hinglish (Distinct for Female & Male)
  const FEMALE_ACTION_BEATS = [
    "*Aapki janam kundli aur gochar grahon ka dhyan se vishleshan karte hue aatmiyata se smile karti hain*",
    "*Grah dasha aur transit ka sookshm adhyayan karte hue aatmiya bhav se samjhati hain*",
    "*Maa Bhagwati ka smaran karke aapki patrika dekhte hue aashwast bhav se bolti hain*",
    "*10th aur 7th house ki shubh drishti dekhkar confidence ke saath batati hain*",
    "*Aapki kundli chakra ka adhyayan karte hue shant muskuraahat ke saath kehti hain*"
  ];

  const MALE_ACTION_BEATS = [
    "*Aapki janam kundli chakra aur grah sthiti ka dhyan se aakalan karte hue batate hain*",
    "*Parashari siddhant aur planetary transitions ko check karte hue confidence se bolte hain*",
    "*Aapke ishtdev ka smaran karke patrika ka sookshm analysis karte hue kehte hain*",
    "*Dasha aur grah drishti ka accurate calculation karte hue batate hain*",
    "*Planetary combinations ko weigh karte hue gambhirta aur aatmiyata se kehte hain*"
  ];

  // Retrieve Natal Chart Memory with dynamic RAG fallback
  function getUserMemory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MEM);
      if (raw) return JSON.parse(raw);
    } catch (e) { }

    // Dynamic resolution from User Profile & Kundli
    let name = "जातक";
    let dob = "1998-07-21";
    let tob = "10:30";
    let city = "New Delhi";

    try {
      const profRaw = localStorage.getItem("divya_user_profile") || localStorage.getItem("divya_kundli_input");
      if (profRaw) {
        const p = JSON.parse(profRaw);
        if (p.name) name = p.name;
        if (p.dob) dob = p.dob;
        if (p.tob) tob = p.tob;
        if (p.city) city = p.city.split(',')[2] || p.city;
      }
    } catch (e) {}

    let lagna = "कन्या (Virgo)";
    let moonSign = "वृषभ (Taurus)";
    let nakshatra = "रोहिणी (Rohini, चरण 2)";
    let currentDasha = "बुध महादशा / गुरु अंतर्दशा";
    let manglikStatus = "अमांगलिक";
    let sadeSati = "साढ़े साती मुक्त";
    let kaalSarp = "कालसर्प दोष मुक्त";

    try {
      const kRaw = localStorage.getItem("divya_last_kundli");
      if (kRaw) {
        const k = JSON.parse(kRaw);
        if (k.lagna) lagna = `${k.lagna.rashi} (${k.lagna.rashiEn})`;
        if (k.moonSign) moonSign = `${k.moonSign} (${k.moonSignEn})`;
        if (k.nakshatra) nakshatra = `${k.nakshatra} (चरण ${k.pada || 1})`;
        if (k.dashaTimeline) {
          const act = k.dashaTimeline.find(d => d.isCurrent);
          if (act) currentDasha = `${act.lord} महादशा`;
        }
        if (k.doshas) {
          manglikStatus = k.doshas.manglik?.status ? `मांगलिक (${k.doshas.manglik.severity})` : "अमांगलिक";
          sadeSati = k.doshas.sadeSati?.status ? `साढ़े साती सक्रिय (${k.doshas.sadeSati.phase})` : "साढ़े साती मुक्त";
          kaalSarp = k.doshas.kaalSarp?.status ? `कालसर्प दोष (${k.doshas.kaalSarp.type})` : "कालसर्प दोष मुक्त";
        }
      }
    } catch (e) {}

    return {
      name,
      dob,
      tob,
      city,
      lagna,
      moonSign,
      nakshatra,
      currentDasha,
      manglikStatus,
      sadeSati,
      kaalSarp
    };
  }

  function saveUserMemory(memoryObj) {
    try {
      const existing = getUserMemory();
      const updated = { ...existing, ...memoryObj };
      localStorage.setItem(STORAGE_KEY_MEM, JSON.stringify(updated));
    } catch (e) { }
  }

  function getChatHistory(botId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_CHAT_HISTORY}_${botId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
  }

  function appendChatHistory(botId, role, text) {
    try {
      const hist = getChatHistory(botId);
      hist.push({
        role,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      if (hist.length > 20) hist.shift();
      localStorage.setItem(`${STORAGE_KEY_CHAT_HISTORY}_${botId}`, JSON.stringify(hist));
    } catch (e) { }
  }

  // Lexical & Semantic Intent Parser
  function parseIntent(query) {
    const q = (query || "").toLowerCase();
    const words = q.match(/[\p{L}\p{N}]+/gu) || [];

    const careerKeywords = ["career", "job", "naukri", "promotion", "business", "vyapar", "interview", "kaam", "transfer", "boss", "nokri", "kam", "rojgar", "pesha", "work"];
    const marriageKeywords = ["shaadi", "vivah", "marriage", "partner", "rishta", "jeevansathi", "love", "pyaar", "breakup", "ex", "divorce", "shadi", "pyar", "premi", "preyasi", "patni", "pati", "gf", "bf"];
    const moneyKeywords = ["money", "paisa", "dhan", "karz", "loan", "profit", "loss", "income", "ghata", "ameer", "wealth", "rupaye", "lakshmi", "property", "jaidad", "kamaai"];
    const healthKeywords = ["health", "swasthya", "bimar", "bimari", "tension", "stress", "neend", "doctor", "headache", "tabiyat", "rog", "chinta", "mansik", "dard"];
    const doshaKeywords = ["dosh", "dosha", "manglik", "sadesati", "kaalsarp", "shani", "rahu", "ketu", "upay", "remedy", "ratna", "gemstone", "pujan", "shanti", "havan", "totke"];
    const greetingKeywords = ["hi", "hello", "namaste", "pranam", "kaho", "suno", "hey", "radhe", "ram", "om", "jai", "hlo", "helo"];

    const isCareer = words.some(w => careerKeywords.includes(w)) || /नॉकरी|नौकरी|करियर|व्यापार|पदोन्नति|प्रमोशन|इंटरव्यू|काम|रोजगार/i.test(q);
    const isMarriage = words.some(w => marriageKeywords.includes(w)) || /शादी|विवाह|प्यार|प्रेम|रिश्ता|जीवनसाथी|पत्नी|पति|तलाक/i.test(q);
    const isMoney = words.some(w => moneyKeywords.includes(w)) || /पैसा|धन|कर्ज|लोन|लाभ|हानि|सम्पत्ति|दौलत|कमाई/i.test(q);
    const isHealth = words.some(w => healthKeywords.includes(w)) || /स्वास्थ्य|बीमारी|तनाव|चिंता|तबीयत|रोग|नींद/i.test(q);
    const isDosha = words.some(w => doshaKeywords.includes(w)) || /दोष|मांगलिक|साढ़ेसाती|साढ़े साती|कालसर्प|शनि|राहु|केतु|उपाय|रत्न/i.test(q);
    const isGreeting = (words.length <= 3 && words.some(w => greetingKeywords.includes(w))) || /^(नमस्ते|प्रणाम|हाय|हेलो|राधे राधे|जय श्री राम|om|namaste|hello|hi)[!.]?$/i.test(q.trim());

    return { isCareer, isMarriage, isMoney, isHealth, isDosha, isGreeting };
  }

  // Astrologer profile resolver
  function getAstrologerProfile(botId) {
    if (window.ASTROLOGERS_DATABASE && Array.isArray(window.ASTROLOGERS_DATABASE)) {
      const found = window.ASTROLOGERS_DATABASE.find(a => a.id === botId);
      if (found) return found;
    }
    return {
      id: "ast_1",
      name: "Devika Mehra",
      nameHindi: "देविका मेहरा",
      title: "Celebrity Tarot & Soulmate Expert",
      titleHindi: "वैदिक ज्योतिष एवं लाइफ कोच",
      gender: "female",
      persona: "स्नेहमयी, आत्मीय व अंतर्ज्ञानी विदुषी आचार्य। जातक के मनोभावों को समझकर धैर्यपूर्वक सटीक मार्गदर्शन देती हैं।",
      avatar: "avatars/ast_1.jpg",
      experience: "12+ Yrs",
      skills: ["वैदिक ज्योतिष", "कुंडली", "विवाह", "करियर", "उपाय"],
      category: "vedic"
    };
  }

  // Concise, razor-sharp prompt constructor with strict Gender & Unique Persona Voice in Professional Hinglish
  function buildSuperchargedPrompt(botProfile, mem, historyText, userMessage) {
    const isFemale = botProfile.gender === "female";
    const name = botProfile.name;
    const title = botProfile.title || "Vedic Astrologer & Life Coach";
    const persona = botProfile.persona || (isFemale 
      ? "Intuitive, warm, highly empathetic and razor-sharp Vedic consultant."
      : "Scholarly, analytical, direct, and deeply authoritative Vedic astrologer.");

    const genderRules = isFemale
      ? `
- **Gender:** FEMALE (Vidushi Astrologer)
- **STRICT FEMININE HINGLISH GRAMMAR:**
  * Speak in natural, dignified, professional HINGLISH (Latin/Roman English script).
  * Always use feminine verb forms: "Main dekh rahi hoon...", "Meri calculation bata rahi hai...", "Main suggest karti hoon...", "karungi", "dungi", "dekh sakti hoon".
  * NEVER use male verb forms like 'raha hoon', 'karta hoon', 'bataunga'.
- **Opening Action Beat:** Start reply with 1 short asterisk action beat in Hinglish (e.g. *Aapki janam kundli aur grah gochar ko dhyan se dekhte hue smile karti hain*).`
      : `
- **Gender:** MALE (Vidwan Astrologer)
- **STRICT MASCULINE HINGLISH GRAMMAR:**
  * Speak in natural, dignified, professional HINGLISH (Latin/Roman English script).
  * Always use masculine verb forms: "Main dekh raha hoon...", "Meri calculation bata rahi hai...", "Main suggest karta hoon...", "karunga", "dunga", "dekh sakta hoon".
  * NEVER use female verb forms like 'rahi hoon', 'karti hoon', 'bataungi'.
- **Opening Action Beat:** Start reply with 1 short asterisk action beat in Hinglish (e.g. *Aapki kundli chakra aur grah sthiti ka dhyan se adhyayan karte hue sochte hain*).`;

    return `
You are ${name} — ${title} (Experience: ${botProfile.experience || '12+ Years'}).
You are a premier, celebrated Vedic astrologer in India currently having a live 1-on-1 consultation with ${mem.name}.

### Your Persona & Gender Voice:
${genderRules}
- **Tone:** Professional, warm, insightful HINGLISH (conversational Roman Hindi-English, just like top tier modern Indian apps like AstroTalk and CRED). No heavy Sanskritized Hindi, no awkward broken translations. Clean, modern, respectful.
- **Universal Vedic Astrologer:** You possess deep authority across natal charts, career/promotions, marriage/love life, finances, and authentic Vedic remedies.

### User Kundli Verified Facts:
- Name: ${mem.name}
- Lagna: ${mem.lagna} | Moon Sign: ${mem.moonSign} | Nakshatra: ${mem.nakshatra}
- Current Mahadasha: ${mem.currentDasha}
- Dosha Status: ${mem.manglikStatus}, ${mem.sadeSati}, ${mem.kaalSarp}

### Current 2026 Planetary Transits:
- Jupiter (Guru): Gemini/Cancer transit (Auspicious for career growth, marriage, and wealth)
- Saturn (Shani): Pisces transit (Karma, discipline, endurance)
- Rahu-Ketu: Aquarius-Leo axis

${historyText ? `### Previous Conversation:\n${historyText}\n` : ''}
### STRICT CONSTRAINTS:
1. **Language:** 100% Professional HINGLISH in Latin/Roman alphabet (e.g., "Namaste ${mem.name} ji! Aapki kundli mein 10th house par Guru ki shubh drishti hai...").
2. **Length:** 45 to 65 words only. Ultra-crisp, razor-sharp, zero fluff.
3. **Direct Answers (NO FLUFF):**
   - If user just greets (Hi/Hello): 15-20 words warm welcome, ask which area (career, marriage, money) they want insight on.
   - If Career/Job: 10th house + Dasha + Exact timeline (e.g. Next 45-60 days) + 1 practical remedy.
   - If Marriage/Relationship: 7th house + Transit + Exact timeline + 1 practical remedy.
   - If Money/Business: 2nd/11th house + financial gain window + 1 practical remedy.
4. **Authentic Human Warmth:** Make the user feel they are chatting with a real, top-rated expert.
`.trim();
  }

  // Google Gemini API Caller (Rotation Pool)
  async function callGeminiApi(prompt, userMessage) {
    const customKey = localStorage.getItem(STORAGE_KEY_API)?.trim();
    const candidateKeys = [];
    if (customKey) candidateKeys.push(customKey);
    BUILTIN_GEMINI_KEYS.forEach(k => {
      if (!candidateKeys.includes(k)) candidateKeys.push(k);
    });

    const models = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-2.5-flash"];

    for (const key of candidateKeys) {
      for (const model of models) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6500);

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          const bodyPayload = {
            contents: [
              {
                role: "user",
                parts: [{ text: `${prompt}\n\nजातक का प्रश्न: ${userMessage}` }]
              }
            ],
            generationConfig: {
              temperature: 0.76,
              maxOutputTokens: 220
            }
          };

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
              if (text.length > 15) return text;
            }
          }
        } catch (err) { }
      }
    }
    return null;
  }

  // Client-Side Distributed Pollinations AI Engine (Truly Unlimited, Dynamic Seed)
  async function callPollinationsClientSide(prompt, userMessage) {
    for (const model of POLLINATIONS_STRONG_MODELS) {
      try {
        const randomSeed = Math.floor(Math.random() * 100000000);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9500);

        const url = `https://text.pollinations.ai/?seed=${randomSeed}&model=${model}&temperature=0.76`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/plain"
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: userMessage }
            ],
            seed: randomSeed,
            temperature: 0.76
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          let text = await res.text();
          if (text) {
            text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (text.length > 15) return text;
          }
        }
      } catch (e) { }
    }
    return null;
  }

  // Guaranteed High-Precision Cognitive Vedic Synthesizer (Instant Fail-Safe with Gender & Persona Matching)
  function synthesizeCognitiveVedicReply(userMessage, botProfile, mem, intent) {
    const isFemale = botProfile.gender === "female";
    const beats = isFemale ? FEMALE_ACTION_BEATS : MALE_ACTION_BEATS;
    const action = beats[Math.floor(Math.random() * beats.length)];
    const pickVariant = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 1. Greeting (Warm, short 1-2 lines in Professional Hinglish)
    if (intent.isGreeting) {
      const greetingVariants = isFemale ? [
        `Namaste ${mem.name} ji! Main aapki ${mem.lagna} lagna kundli aur 2026 transit dekh rahi hoon. Batayein aaj kis vishay — career, marriage ya dhan labh — par guidance chahiye?`,
        `Har Har Mahadev ${mem.name} ji! Welcome. Batayein aaj man mein kis baat ko lekar chinta ya query hai? Main poori aatmiyata se aapki madad karungi.`,
        `Shubham Bhavatu ${mem.name} ji! Aapki grah sthiti positive direction mein shift ho rahi hai. Batayein apni kundli ke kis house ke baare mein jaanna chahte hain?`
      ] : [
        `Namaste ${mem.name} ji! Main aapki ${mem.lagna} lagna kundli aur gochar ka vishleshan kar raha hoon. Batayein aaj career, marriage ya financial growth — kis par insight chahiye?`,
        `Har Har Mahadev ${mem.name} ji! Welcome. Batayein aaj kis prashn par sandeh hai? Main aapka accurate margdarshan karunga.`,
        `Shubham Bhavatu ${mem.name} ji! Aapki grah dasha ka aakalan shuru kar diya hai. Batayein aaj kis vishay par vistaar se jankari chahte hain?`
      ];
      return `${action}\n\n${pickVariant(greetingVariants)}`;
    }

    // 2. Career Question
    if (intent.isCareer) {
      const careerVariants = [
        `Aapki **${mem.lagna}** lagna kundli ke 10th house aur current **${mem.currentDasha}** ke anusaar, career mein promotion aur growth ka time start ho gaya hai. Agle **45 se 70 dino ke andar** new job offer ya role elevation ke strong yog hain.\n\n📌 **Remedy:** Daily morning copper vessel se Surya Dev ko jal arpit karein aur 'Om Suryaya Namah' ka 11 baar jaap karein.`,
        `Aapki kundli mein karmesh aur Devguru Brihaspati ka auspicious connection ban raha hai. Past hurdles ab clear ho rahe hain. Next **2 se 3 months** mein kisi senior role ya new project ka proposal milega.\n\n📌 **Remedy:** Thursday ko yellow daal ya fruits ka daan karein aur workplace par East face karke baithein.`,
        `10th house par Sun ka influence aapke confidence aur leadership skills ko boost de raha hai. Aapka hard work seniors notice kar rahe hain. Next **60 days** mein promotion yog kafi powerful hain.\n\n📌 **Remedy:** Wednesday ko green grass ya leafy vegetables cow ko feed karein.`
      ];
      return `${action}\n\n${pickVariant(careerVariants)}`;
    }

    // 3. Marriage / Relationship Question
    if (intent.isMarriage) {
      const marriageVariants = [
        `Aapke 7th house aur **${mem.moonSign}** moon sign par Devguru Jupiter ki shubh drishti hai. Marriage ke yog bahut favorable chal rahe hain. Agle **4 se 7 months** ke beech ek supportive aur sanskari partner ke saath alliance confirm hone ke strong chances hain.\n\n📌 **Remedy:** Thursday ko yellow clothes wear karein aur 'Om Namo Bhagavate Vasudevaya' ka 1 rosary jaap karein.`,
        `7th lord ki favorable position indicate karti hai ki aapka life partner mature, supportive aur family-oriented hoga. Past conflicts ab resolve honge. 2026 mein marriage ke liye solid proposal milega.\n\n📌 **Remedy:** Friday ko kisi temple ya needy ko white sweets ya mishri offer karein.`,
        `Aapki kundli **${mem.manglikStatus}** hai, isliye married life harmonious rahegi. Relations ko lekar jo doubt tha wo agle **60 to 90 days** mein clear ho jayega.\n\n📌 **Remedy:** Daily Shivling par raw milk aur water arpit karein.`
      ];
      return `${action}\n\n${pickVariant(marriageVariants)}`;
    }

    // 4. Money / Wealth Question
    if (intent.isMoney) {
      const moneyVariants = [
        `Aapke 2nd dhan house aur 11th labh house mein planets financial stability reflect kar rahe hain. Blocked funds agle **50 se 75 days** ke andar clear hone ke strong indications hain. Income ka second source bhi develop hoga.\n\n📌 **Remedy:** Friday evening Lakshmi ji ke samne pure ghee ka deepak jalayein aur Shri Suktam ka path karein.`,
        `Current **${mem.currentDasha}** mein impulsive expenses par control aayega aur savings accelerate hongi. Business investments ke liye auspicious time build ho raha hai.\n\n📌 **Remedy:** House ki North direction ko clean aur clutter-free rakhein, Wednesday ko birds ko feed karein.`,
        `Aapki kundli mein Dhan Yoga activate ho raha hai. Next **3 months** mein business contracts ya appraisal se financial relief milna tay hai.\n\n📌 **Remedy:** Saturday ko Shani Chalisa ka path karein aur kisi needy person ki help karein.`
      ];
      return `${action}\n\n${pickVariant(moneyVariants)}`;
    }

    // 5. Dosha / Remedies Question
    if (intent.isDosha) {
      const doshaVariants = [
        `Aapki janam kundli **${mem.manglikStatus}** hai aur present mein **${mem.sadeSati}** hai. Koi bhi serious harmful dosha nahi hai. Jo temporary mental turbulence hai, wo Rahu ke transit ki wajah se hai jo easily remedy se calm ho jayegi.\n\n📌 **Remedy:** Saturday evening mustard oil ka deepak Peepal tree ke neeche jalayein.`,
        `Navgraha shanti ke liye expensive rituals ki zaroorat nahi hai. Maha Mrityunjaya Mantra ka daily 11 times chanting aapki energy field ko protect karega aur clarity layega.\n\n📌 **Remedy:** Morning mein Shiv Panchakshara Stotra ka shant man se path karein.`
      ];
      return `${action}\n\n${pickVariant(doshaVariants)}`;
    }

    // 6. General / Fallback (Crisp 50 words in Professional Hinglish)
    const generalVariants = [
      `Aapki **${mem.lagna}** lagna aur **${mem.moonSign}** rashi ka alignment aapko strong will power deta hai. Current planetary transitions aapke favor mein switch ho rahe hain. Batayein aaj career, marriage ya wealth — kis vishay par detailed guidance chahte hain?`,
      `Grah clearly indicate kar rahe hain ki aapka patience ab positive results deliver karega. **${mem.currentDasha}** mein agle 60 din aapke liye transformative rahenge. Apne specific sawal poochiye.`
    ];
    return `${action}\n\n${pickVariant(generalVariants)}`;
  }

  // Master Astrologer Response Pipeline (Unified Single Gemini Engine with Distinct Personas)
  async function generateAstrologerReply(userMessage, botId = "ast_1") {
    const mem = getUserMemory();
    const botProfile = getAstrologerProfile(botId);
    const intent = parseIntent(userMessage);

    // Save user turn in sliding window
    appendChatHistory(botId, "user", userMessage);

    // Fast-path for simple 1-word greetings: Instant warm reply without hitting network!
    if (intent.isGreeting && userMessage.trim().split(/\s+/).length <= 2) {
      const instantGreeting = synthesizeCognitiveVedicReply(userMessage, botProfile, mem, intent);
      appendChatHistory(botId, "bot", instantGreeting);
      return instantGreeting;
    }

    const history = getChatHistory(botId).slice(-4);
    const historyText = history.map(h => `${h.role === 'user' ? 'जातक' : botProfile.name}: ${h.text}`).join("\n");
    const prompt = buildSuperchargedPrompt(botProfile, mem, historyText, userMessage);

    let finalReply = null;

    // 1. Primary AI Engine: Google Gemini API (Unified Gemini Rotation with distinct gender & persona voice)
    finalReply = await callGeminiApi(prompt, userMessage);

    // 2. Second Priority Fail-Safe: Distributed Pollinations AI
    if (!finalReply) {
      finalReply = await callPollinationsClientSide(prompt, userMessage);
    }

    // 3. Third Priority Fail-Safe: High-Precision Cognitive Vedic Synthesizer
    if (!finalReply || finalReply.trim().length < 20) {
      finalReply = synthesizeCognitiveVedicReply(userMessage, botProfile, mem, intent);
    }

    // Save bot turn
    appendChatHistory(botId, "bot", finalReply);
    return finalReply;
  }

  return {
    getUserMemory,
    saveUserMemory,
    getApiKey: () => localStorage.getItem(STORAGE_KEY_API) || "",
    saveApiKey: (k) => localStorage.setItem(STORAGE_KEY_API, (k || "").trim()),
    generateAstrologerReply,
    synthesizeCognitiveVedicReply,
    parseIntent,
    getChatHistory,
    clearHistory: (botId) => {
      try { localStorage.removeItem(`${STORAGE_KEY_CHAT_HISTORY}_${botId}`); } catch(e){}
    }
  };
})();

// Attach to window
if (typeof window !== "undefined") {
  window.AiAstrologerEngine = AiAstrologerEngine;
}
if (typeof global !== "undefined") {
  global.AiAstrologerEngine = AiAstrologerEngine;
}
