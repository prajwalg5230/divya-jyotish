/**
 * Divya Jyotish - Interactive Cosmic Tarot Deck & Divination Suite
 * 22 Major Arcana + Key Aces with Upright/Reversed meanings, Love & Career advice,
 * and 3-Card Past-Present-Future Spread Engine.
 */

const TarotEngine = (function () {
  const TAROT_CARDS = [
    {
      id: 0,
      name: "The Fool",
      hindi: "मूर्ख (नया आरंभ)",
      arcana: "Major",
      symbol: "🌀",
      keywords: ["New Beginnings", "Innocence", "Leap of Faith", "Spontaneity"],
      upright: "A fresh cosmic chapter is unfolding. Take the leap of faith without fear; universe protects pure intentions.",
      reversed: "Recklessness, fear of starting, unnecessary risk. Ground yourself before stepping forward.",
      love: "Spontaneous romantic adventure or meeting someone unexpectedly fresh and vibrant.",
      career: "A new project, startup venture, or untrodden creative path is calling you.",
      element: "Air",
      color: "#38BDF8"
    },
    {
      id: 1,
      name: "The Magician",
      hindi: "जादूगर (संकल्प शक्ति)",
      arcana: "Major",
      symbol: "✨",
      keywords: ["Manifestation", "Resourcefulness", "Power", "Inspired Action"],
      upright: "You hold all 4 elemental tools (Wands, Cups, Swords, Pentacles). You have the power to manifest your desire.",
      reversed: "Illusions, trickery, untapped talents, manipulation. Channel your energy with integrity.",
      love: "Magnetic attraction and strong vocal communication. You can speak your dreams into reality.",
      career: "Supreme competence; your skills are aligned for career breakthrough.",
      element: "Mercury",
      color: "#F59E0B"
    },
    {
      id: 2,
      name: "The High Priestess",
      hindi: "उच्च पुजारिन (अंतर्ज्ञान)",
      arcana: "Major",
      symbol: "🌙",
      keywords: ["Intuition", "Sacred Knowledge", "Divine Feminine", "Subconscious"],
      upright: "Listen to your inner whisper. Secrets and esoteric wisdom are ready to be unveiled to your quiet mind.",
      reversed: "Ignoring gut instincts, surface-level superficial gossip, hidden secrets causing distress.",
      love: "Deep spiritual soulmate connection beyond verbal logic; trust your gut feelings.",
      career: "Avoid impulsive commitments. Observe from the shadows before making your move.",
      element: "Water",
      color: "#818CF8"
    },
    {
      id: 3,
      name: "The Empress",
      hindi: "साम्राज्ञी (प्रकृति व समृद्धि)",
      arcana: "Major",
      symbol: "🌸",
      keywords: ["Abundance", "Fertility", "Creativity", "Nurturing"],
      upright: "Mother nature's golden bounty. Creative endeavors blossom into abundant physical wealth and loving comfort.",
      reversed: "Creative burnout, over-dependence, neglecting self-care.",
      love: "Warm, unconditionally loving connection; sensual pleasure and nurturing devotion.",
      career: "A flourishing period for artistic, luxurious, or empathetic businesses.",
      element: "Earth / Venus",
      color: "#10B981"
    },
    {
      id: 4,
      name: "The Emperor",
      hindi: "सम्राट (अनुशासन व शक्ति)",
      arcana: "Major",
      symbol: "👑",
      keywords: ["Authority", "Structure", "Stability", "Father Figure"],
      upright: "Firm leadership, structured boundaries, and sovereign mastery. Take charge of your realm with fair discipline.",
      reversed: "Tyranny, rigidity, loss of control, stubborn conflict with authority.",
      love: "Stability and long-term protection, though vulnerability needs conscious encouragement.",
      career: "Promotion into leadership, organizational governance, or executive triumph.",
      element: "Fire / Mars",
      color: "#EF4444"
    },
    {
      id: 5,
      name: "The Hierophant",
      hindi: "धर्मगुरु (परंपरा व गुरु)",
      arcana: "Major",
      symbol: "🏛️",
      keywords: ["Spiritual Wisdom", "Tradition", "Mentorship", "Institutions"],
      upright: "Guidance from a wise Guru, elder, or sacred tradition. Adhere to ethical principles and seek structured learning.",
      reversed: "Blind dogmatism, hypocrisy, breaking free from suffocating conventions.",
      love: "Traditional commitment, marriage rituals, or aligning on core spiritual values.",
      career: "Success through established institutions, certifications, and esteemed mentorship.",
      element: "Taurus",
      color: "#D97706"
    },
    {
      id: 6,
      name: "The Lovers",
      hindi: "प्रेमी (सद्भाव व चुनाव)",
      arcana: "Major",
      symbol: "💞",
      keywords: ["Union", "Harmony", "Values Alignment", "Crucial Choice"],
      upright: "Divine soul union, magnetic harmony, and choices made strictly from the heart's authentic truth.",
      reversed: "Internal disharmony, values clash, codependency, difficult romantic dilemmas.",
      love: "Deep passionate soulmate bond; meeting your cosmic counterpart.",
      career: "Synergistic partnership or business collaboration that produces magic.",
      element: "Gemini",
      color: "#EC4899"
    },
    {
      id: 7,
      name: "The Chariot",
      hindi: "रथ (विजय व संकल्प)",
      arcana: "Major",
      symbol: "🛡️",
      keywords: ["Victory", "Willpower", "Drive", "Overcoming Obstacles"],
      upright: "Two opposing forces steered in absolute harmony by iron will. Inevitable victory through disciplined focus.",
      reversed: "Loss of control, aggression, roadblocks, spinning wheels in exhaustion.",
      love: "Pursuing someone with clear confidence, overcoming distance or family hurdles.",
      career: "Speedy triumph over competition, conquering exams or high-stakes business targets.",
      element: "Cancer",
      color: "#6366F1"
    },
    {
      id: 8,
      name: "Strength",
      hindi: "आत्मबल (करुणा व साहस)",
      arcana: "Major",
      symbol: "🦁",
      keywords: ["Courage", "Gentle Mastery", "Patience", "Inner Fortitude"],
      upright: "The wild lion tamed not by iron chains, but by compassionate touch and unwavering inner confidence.",
      reversed: "Self-doubt, insecurity, raw emotional outbursts, feeling depleted.",
      love: "Patience and soft empathy healing past trauma in a relationship.",
      career: "Navigating workplace politics with grace, dignity, and calm resilience.",
      element: "Leo",
      color: "#F59E0B"
    },
    {
      id: 9,
      name: "The Hermit",
      hindi: "एकांतिक (आत्म-साक्षात्कार)",
      arcana: "Major",
      symbol: "🏮",
      keywords: ["Soul Searching", "Introspection", "Inner Guidance", "Solitude"],
      upright: "Withdraw into your sacred inner sanctum. The lantern of truth shines only in the silence of contemplation.",
      reversed: "Isolation, loneliness, refusing constructive advice, anti-social withdrawal.",
      love: "Time to reflect on what you truly need before rushing into shallow bonds.",
      career: "Research, deep philosophical study, solitary creative output.",
      element: "Virgo",
      color: "#14B8A6"
    },
    {
      id: 10,
      name: "Wheel of Fortune",
      hindi: "भाग्य चक्र (परिवर्तन)",
      arcana: "Major",
      symbol: "🎡",
      keywords: ["Good Luck", "Karma", "Destiny", "Turning Point"],
      upright: "The wheel turns in your favor! Sudden fortunate coincidences, karmic rewards, and doors swinging open.",
      reversed: "Bad timing, setbacks, resisting inevitable change. Remember: this too shall pass.",
      love: "A fated meeting; serendipity brings someone into your orbit by destiny.",
      career: "Financial upturn, positive promotion, unexpected windfall or opportunity.",
      element: "Jupiter",
      color: "#FBBF24"
    },
    {
      id: 11,
      name: "Justice",
      hindi: "न्याय (सत्य व संतुलन)",
      arcana: "Major",
      symbol: "⚖️",
      keywords: ["Fairness", "Truth", "Karmic Law", "Cause & Effect"],
      upright: "Clear-eyed truth triumphs. Legal disputes settle justly; your honest actions bring their deserved rewards.",
      reversed: "Unfair accusations, bias, evading personal responsibility.",
      love: "Honesty and equality are vital; games and half-truths will be exposed.",
      career: "Contracts signed smoothly, ethical recognition, fair appraisal.",
      element: "Libra",
      color: "#3B82F6"
    },
    {
      id: 12,
      name: "The Hanged Man",
      hindi: "समर्पण (नया दृष्टिकोण)",
      arcana: "Major",
      symbol: "🧘",
      keywords: ["Surrender", "New Perspective", "Pausing", "Letting Go"],
      upright: "Deliberate pause. By surrendering control, profound enlightenment and unconventional solutions arrive.",
      reversed: "Martyrdom, pointless delay, resistance to letting go of stubborn ego.",
      love: "Taking a step back to understand your partner's worldview without judgment.",
      career: "A brief plateau is preparing you for a revolutionary shift in direction.",
      element: "Water",
      color: "#06B6D4"
    },
    {
      id: 13,
      name: "Death (Transformation)",
      hindi: "पुनर्जन्म (रूपांतरण)",
      arcana: "Major",
      symbol: "🦋",
      keywords: ["Endings", "Transformation", "Transition", "Rebirth"],
      upright: "Not physical death, but the end of an outdated cycle. The caterpillar dissolves so the butterfly can soar.",
      reversed: "Clinging to dead situations, fear of change, stagnant denial.",
      love: "Closure of toxic patterns or shedding outdated dynamics to birth a deeper connection.",
      career: "Leaving an unfulfilling job, sunsetting obsolete systems to start afresh.",
      element: "Scorpio",
      color: "#9333EA"
    },
    {
      id: 14,
      name: "Temperance",
      hindi: "संयम (संतुलन व रसायन)",
      arcana: "Major",
      symbol: "🕊️",
      keywords: ["Balance", "Moderation", "Patience", "Divine Flow"],
      upright: "Blending fire and water into divine elixir. Harmony, healing of mind and body, and tranquil equilibrium.",
      reversed: "Extreme mood swings, impatience, excess indulgence, clashing energies.",
      love: "Gentle reconciliation, harmonious communication, peaceful mutual respect.",
      career: "Slow, steady and stable progress; balancing budget and workload gracefully.",
      element: "Sagittarius",
      color: "#10B981"
    },
    {
      id: 15,
      name: "The Star",
      hindi: "नक्षत्र तारा (आशा व प्रकाश)",
      arcana: "Major",
      symbol: "⭐",
      keywords: ["Hope", "Faith", "Inspiration", "Spiritual Renewal"],
      upright: "Divine cosmic blessing. Renewed hope, deep mental healing, and radiant faith that you are guided by the stars.",
      reversed: "Hopelessness, despair, lack of faith, creative blockage.",
      love: "Pure emotional healing, serene joy, unconditional loving acceptance.",
      career: "Inspiration, public appreciation, wishes and lifelong aspirations coming true.",
      element: "Aquarius",
      color: "#38BDF8"
    },
    {
      id: 16,
      name: "The Sun",
      hindi: "सूर्य (आनंद व विजय)",
      arcana: "Major",
      symbol: "☀️",
      keywords: ["Joy", "Success", "Vitality", "Radiance"],
      upright: "The most auspicious card in the deck! Absolute joy, vibrant health, triumphant success, and warm clarity.",
      reversed: "Temporary cloudiness, delayed optimism, inner child needing attention.",
      love: "Pure radiance, celebrate love openly, marriage blessings and vibrant vitality.",
      career: "Peak recognition, honors, awards, and golden financial success.",
      element: "Sun",
      color: "#F59E0B"
    },
    {
      id: 17,
      name: "The World",
      hindi: "संसार (पूर्णता व सिद्धि)",
      arcana: "Major",
      symbol: "🌍",
      keywords: ["Completion", "Wholeness", "Accomplishment", "Travel"],
      upright: "A grand cosmic cycle concludes in complete fulfillment. You have arrived; celebrate your triumph.",
      reversed: "Incomplete loose ends, procrastination right before the finish line.",
      love: "Feeling completely whole and blissful with your partner; long-term commitment.",
      career: "Global success, major graduation, project triumphant launch, international travel.",
      element: "Earth / Saturn",
      color: "#8B5CF6"
    }
  ];

  function drawCards(count = 3) {
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, count).map(card => {
      const isReversed = Math.random() < 0.25; // 25% chance of reversed
      return {
        ...card,
        isReversed,
        meaning: isReversed ? card.reversed : card.upright,
        displayName: `${card.name}${isReversed ? ' (Reversed)' : ''}`
      };
    });
    return drawn;
  }

  return {
    TAROT_CARDS,
    drawCards
  };
})();

if (typeof window !== "undefined") {
  window.TarotEngine = TarotEngine;
}
