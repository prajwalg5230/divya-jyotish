/**
 * Divya Jyotish - Vedic & Chaldean Numerology Engine
 * Calculates: Mulank (Birth Number), Bhagyank (Destiny Number),
 * Namank (Name Vibration), Ruling Planet, Lucky Dates, Colors, and Career.
 */

const NumerologyEngine = (function () {
  // Chaldean Letter Values
  const CHALDEAN_MAP = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  const NUMBER_PROFILES = {
    1: {
      number: 1,
      name: "The Sovereign Leader",
      planet: "Surya (Sun)",
      element: "Fire",
      traits: "Visionary, ambitious, independent, charismatic, pioneering spirit.",
      weakness: "Ego, stubbornness, impatience with slow progress.",
      luckyDays: "Sunday, Monday",
      luckyDates: "1, 10, 19, 28",
      luckyColors: ["Golden Yellow", "Copper Red", "Orange"],
      friendlyNumbers: [1, 2, 3, 5, 9],
      unfriendlyNumbers: [6, 8],
      career: "CEO, Entrepreneur, Government Officer, Politician, Founder, Surgeon.",
      gemstone: "Ruby (Manikya)",
      mantra: "Om Suryaya Namaha"
    },
    2: {
      number: 2,
      name: "The Empathetic Harmonizer",
      planet: "Chandra (Moon)",
      element: "Water",
      traits: "Intuitive, gentle, diplomatic, artistic, emotionally profound.",
      weakness: "Mood swings, over-sensitivity, indecisiveness.",
      luckyDays: "Monday, Friday",
      luckyDates: "2, 11, 20, 29",
      luckyColors: ["Pearl White", "Cream", "Silver", "Sea Green"],
      friendlyNumbers: [1, 2, 3, 5],
      unfriendlyNumbers: [8, 9],
      career: "Counselor, Diplomat, Writer, Psychologist, Artist, Hospitality, Nursing.",
      gemstone: "Pearl (Moti) or Moonstone",
      mantra: "Om Chandraya Namaha"
    },
    3: {
      number: 3,
      name: "The Divine Creator & Guru",
      planet: "Brihaspati (Jupiter)",
      element: "Ether / Fire",
      traits: "Wisdom, optimism, eloquence, expansive mind, spiritual generosity.",
      weakness: "Scattered energy, extravagance, preachiness.",
      luckyDays: "Thursday, Tuesday",
      luckyDates: "3, 12, 21, 30",
      luckyColors: ["Bright Yellow", "Saffron", "Royal Gold"],
      friendlyNumbers: [1, 2, 3, 5, 9],
      unfriendlyNumbers: [6],
      career: "Professor, Legal Advisor, Spiritual Teacher, Author, Finance Consultant.",
      gemstone: "Yellow Sapphire (Pukhraj)",
      mantra: "Om Brihaspataye Namaha"
    },
    4: {
      number: 4,
      name: "The Unconventional Architect",
      planet: "Rahu",
      element: "Air / Earth",
      traits: "Practical, revolutionary, sharp intellect, systematic, builder.",
      weakness: "Skeptical, sudden temper, loneliness or feeling misunderstood.",
      luckyDays: "Saturday, Sunday",
      luckyDates: "4, 13, 22, 31",
      luckyColors: ["Electric Blue", "Grey", "Khaki"],
      friendlyNumbers: [1, 5, 6, 7],
      unfriendlyNumbers: [2, 4, 8, 9],
      career: "Software Architect, Engineer, Data Scientist, Researcher, Aviation.",
      gemstone: "Hessonite Garnet (Gomed)",
      mantra: "Om Rahave Namaha"
    },
    5: {
      number: 5,
      name: "The Magnetic Communicator",
      planet: "Budha (Mercury)",
      element: "Earth / Air",
      traits: "Fast-thinking, versatile, witty, adaptable, commercial brilliance.",
      weakness: "Restlessness, nervousness, boredom with routine.",
      luckyDays: "Wednesday, Friday",
      luckyDates: "5, 14, 23",
      luckyColors: ["Emerald Green", "Mint", "Turquoise"],
      friendlyNumbers: [1, 3, 5, 6],
      unfriendlyNumbers: [2],
      career: "Trading, Marketing, Journalism, Tech Founder, Public Relations, Sales.",
      gemstone: "Emerald (Panna)",
      mantra: "Om Budhaya Namaha"
    },
    6: {
      number: 6,
      name: "The Cosmic Healer & Lover",
      planet: "Shukra (Venus)",
      element: "Water / Earth",
      traits: "Charming, artistic, romantic, luxurious taste, family-oriented.",
      weakness: "Indulgence, aesthetic vanity, over-sacrificing for others.",
      luckyDays: "Friday, Tuesday",
      luckyDates: "6, 15, 24",
      luckyColors: ["Sky Blue", "Pastel Pink", "Silk White"],
      friendlyNumbers: [5, 6, 8, 9],
      unfriendlyNumbers: [1, 3],
      career: "Fashion Designer, Interior Architect, Actor, Luxury Hospitality, Music.",
      gemstone: "Diamond (Heera) or White Zircon",
      mantra: "Om Shukraya Namaha"
    },
    7: {
      number: 7,
      name: "The Mystic Philosopher",
      planet: "Ketu",
      element: "Water / Ether",
      traits: "Esoteric, analytical, philosophical, spiritual seeker, visionary.",
      weakness: "Detached, aloof, over-analytical paralysis.",
      luckyDays: "Monday, Thursday",
      luckyDates: "7, 16, 25",
      luckyColors: ["Light Green", "Smoky Grey", "White"],
      friendlyNumbers: [1, 2, 4, 5],
      unfriendlyNumbers: [9],
      career: "Astrologer, Occult Researcher, Scientist, Philosopher, Deep Coder.",
      gemstone: "Cat's Eye (Lehsuniya)",
      mantra: "Om Ketave Namaha"
    },
    8: {
      number: 8,
      name: "The Karmic Titan",
      planet: "Shani (Saturn)",
      element: "Earth / Air",
      traits: "Disciplined, persevering, empire builder, deeply resilient, just.",
      weakness: "Late bloomer, struggle in youth, heavy responsibility burden.",
      luckyDays: "Saturday",
      luckyDates: "8, 17, 26",
      luckyColors: ["Deep Navy", "Midnight Black", "Steel Grey"],
      friendlyNumbers: [5, 6],
      unfriendlyNumbers: [1, 2, 4, 9],
      career: "Industrialist, Real Estate Mogul, Judge, Mining, Heavy Manufacturing.",
      gemstone: "Blue Sapphire (Neelam) or Amethyst",
      mantra: "Om Sham Shanaishcharaya Namaha"
    },
    9: {
      number: 9,
      name: "The Divine Warrior & Humanitarian",
      planet: "Mangal (Mars)",
      element: "Fire",
      traits: "Fierce courage, energetic, generous, fearless, warrior spirit.",
      weakness: "Aggression, impulsiveness, burning bridges easily.",
      luckyDays: "Tuesday, Sunday",
      luckyDates: "9, 18, 27",
      luckyColors: ["Crimson Red", "Rose Pink", "Scarlet"],
      friendlyNumbers: [1, 2, 3, 5],
      unfriendlyNumbers: [4, 7, 8],
      career: "Armed Forces, Sports Champion, Surgeon, Civil Rights Leader, Firefighter.",
      gemstone: "Red Coral (Moonga)",
      mantra: "Om Mangalaya Namaha"
    }
  };

  function reduceToSingleDigit(n) {
    while (n > 9) {
      let sum = 0;
      const str = n.toString();
      for (let ch of str) {
        sum += parseInt(ch);
      }
      n = sum;
    }
    return n;
  }

  function calculateMulank(day) {
    return reduceToSingleDigit(parseInt(day));
  }

  function calculateBhagyank(day, month, year) {
    const dStr = `${day}${month}${year}`;
    let sum = 0;
    for (let ch of dStr) {
      if (!isNaN(parseInt(ch))) sum += parseInt(ch);
    }
    return reduceToSingleDigit(sum);
  }

  function calculateNamank(fullName) {
    const cleaned = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    let sum = 0;
    for (let ch of cleaned) {
      sum += CHALDEAN_MAP[ch] || 0;
    }
    return reduceToSingleDigit(sum);
  }

  function calculateNumerology(name, birthDateStr) {
    const parts = birthDateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    const mulank = calculateMulank(day);
    const bhagyank = calculateBhagyank(day, month, year);
    const namank = calculateNamank(name);

    return {
      mulank: {
        number: mulank,
        ...NUMBER_PROFILES[mulank]
      },
      bhagyank: {
        number: bhagyank,
        ...NUMBER_PROFILES[bhagyank]
      },
      namank: {
        number: namank,
        ...NUMBER_PROFILES[namank]
      }
    };
  }

  return {
    calculate: calculateNumerology,
    calculateNumerology,
    NUMBER_PROFILES
  };
})();

// Attach to window
if (typeof window !== "undefined") {
  window.NumerologyEngine = NumerologyEngine;
}
