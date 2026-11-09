/**
 * Divya Jyotish - Ashtakoot 36 Gun Milan Engine
 * High-accuracy Vedic Matchmaking with Varna, Vashya, Tara, Yoni,
 * Graha Maitri, Gana, Bhakoot, and Nadi matching + Manglik dosha comparative analysis.
 */

const KundliMilan = (function () {
  // 12 Rashi Moon Lordship and Varna classification
  const RASHI_DATA = [
    { name: "Mesh", lord: "Mars", varna: "Kshatriya", vashya: "Chatushpada" },
    { name: "Vrishabh", lord: "Venus", varna: "Vaishya", vashya: "Chatushpada" },
    { name: "Mithun", lord: "Mercury", varna: "Shudra", vashya: "Manava" },
    { name: "Kark", lord: "Moon", varna: "Brahmin", vashya: "Jalachara" },
    { name: "Simha", lord: "Sun", varna: "Kshatriya", vashya: "Vanachara" },
    { name: "Kanya", lord: "Mercury", varna: "Vaishya", vashya: "Manava" },
    { name: "Tula", lord: "Venus", varna: "Shudra", vashya: "Manava" },
    { name: "Vrishchik", lord: "Mars", varna: "Brahmin", vashya: "Keeta" },
    { name: "Dhanu", lord: "Jupiter", varna: "Kshatriya", vashya: "Chatushpada" },
    { name: "Makar", lord: "Saturn", varna: "Vaishya", vashya: "Jalachara" },
    { name: "Kumbh", lord: "Saturn", varna: "Shudra", vashya: "Manava" },
    { name: "Meen", lord: "Jupiter", varna: "Brahmin", vashya: "Jalachara" }
  ];

  // Planetary Friendship Table for Graha Maitri
  const PLANET_RELATIONS = {
    Sun: { friends: ["Moon", "Mars", "Jupiter"], neutrals: ["Mercury"], enemies: ["Venus", "Saturn"] },
    Moon: { friends: ["Sun", "Mercury"], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"], enemies: [] },
    Mars: { friends: ["Sun", "Moon", "Jupiter"], neutrals: ["Venus", "Saturn"], enemies: ["Mercury"] },
    Mercury: { friends: ["Sun", "Venus"], neutrals: ["Mars", "Jupiter", "Saturn"], enemies: ["Moon"] },
    Jupiter: { friends: ["Sun", "Moon", "Mars"], neutrals: ["Saturn"], enemies: ["Mercury", "Venus"] },
    Venus: { friends: ["Mercury", "Saturn"], neutrals: ["Mars", "Jupiter"], enemies: ["Sun", "Moon"] },
    Saturn: { friends: ["Mercury", "Venus"], neutrals: ["Jupiter"], enemies: ["Sun", "Moon", "Mars"] }
  };

  // Sworn enemy Yoni pairs
  const ENEMY_YONIS = [
    ["Ashwa", "Mahisha"], // Horse vs Buffalo
    ["Gaja", "Simha"],    // Elephant vs Lion
    ["Mesha", "Vanara"],  // Sheep vs Monkey
    ["Sarpa", "Nakula"],  // Snake vs Mongoose
    ["Shwan", "Mriga"],   // Dog vs Deer
    ["Marjara", "Mushaka"], // Cat vs Rat
    ["Gau", "Vyaghra"]    // Cow vs Tiger
  ];

  // 1. Varna Koot (Max 1 pt)
  function calculateVarna(groomRashiIdx, brideRashiIdx) {
    const varnaRank = { "Brahmin": 4, "Kshatriya": 3, "Vaishya": 2, "Shudra": 1 };
    const groomVarna = RASHI_DATA[groomRashiIdx].varna;
    const brideVarna = RASHI_DATA[brideRashiIdx].varna;

    const gScore = varnaRank[groomVarna];
    const bScore = varnaRank[brideVarna];

    const score = (gScore >= bScore) ? 1 : 0;
    return {
      name: "Varna",
      max: 1,
      score: score,
      groom: groomVarna,
      bride: brideVarna,
      desc: score === 1 ? "Harmonious spiritual and intellectual temperament." : "Slight difference in spiritual ego; manageable through mutual respect."
    };
  }

  // 2. Vashya Koot (Max 2 pts)
  function calculateVashya(groomRashiIdx, brideRashiIdx) {
    const gVashya = RASHI_DATA[groomRashiIdx].vashya;
    const bVashya = RASHI_DATA[brideRashiIdx].vashya;

    let score = 0;
    if (gVashya === bVashya) {
      score = 2;
    } else if (
      (gVashya === "Chatushpada" && bVashya === "Manava") ||
      (gVashya === "Manava" && bVashya === "Jalachara") ||
      (gVashya === "Jalachara" && bVashya === "Keeta")
    ) {
      score = 1;
    } else {
      score = 0.5;
    }

    return {
      name: "Vashya",
      max: 2,
      score: score,
      groom: gVashya,
      bride: bVashya,
      desc: score >= 1.5 ? "Mutual attraction and balanced control." : "Moderate dominance dynamics."
    };
  }

  // 3. Tara Koot (Max 3 pts)
  function calculateTara(groomNakIdx, brideNakIdx) {
    const countBtoG = ((groomNakIdx - brideNakIdx + 27) % 27) + 1;
    const remBtoG = countBtoG % 9;

    const countGtoB = ((brideNakIdx - groomNakIdx + 27) % 27) + 1;
    const remGtoB = countGtoB % 9;

    const inauspicious = [3, 5, 7]; // Vipat, Pratyak, Vadha
    const bad1 = inauspicious.includes(remBtoG);
    const bad2 = inauspicious.includes(remGtoB);

    let score = 3;
    if (bad1 && bad2) score = 0;
    else if (bad1 || bad2) score = 1.5;

    return {
      name: "Tara",
      max: 3,
      score: score,
      groomNak: AstroEngine.NAKSHATRAS[groomNakIdx].name,
      brideNak: AstroEngine.NAKSHATRAS[brideNakIdx].name,
      desc: score === 3 ? "Excellent planetary alignment for health, vitality, and longevity." : score === 1.5 ? "Average Tara compatibility; minor health precautions." : "Tara Dosh present; charity and Shiva worship recommended."
    };
  }

  // 4. Yoni Koot (Max 4 pts)
  function calculateYoni(groomNakIdx, brideNakIdx) {
    const gYoni = AstroEngine.NAKSHATRAS[groomNakIdx].yoni;
    const bYoni = AstroEngine.NAKSHATRAS[brideNakIdx].yoni;

    if (gYoni === bYoni) {
      return { name: "Yoni", max: 4, score: 4, groom: gYoni, bride: bYoni, desc: "Identical Yoni species - Highest biological, intimate, and emotional bonding." };
    }

    // Check sworn enemies
    const isEnemy = ENEMY_YONIS.some(pair => (pair[0] === gYoni && pair[1] === bYoni) || (pair[1] === gYoni && pair[0] === bYoni));
    if (isEnemy) {
      return { name: "Yoni", max: 4, score: 0, groom: gYoni, bride: bYoni, desc: "Sworn biological enmity between animal symbols. Requires conscious understanding." };
    }

    return { name: "Yoni", max: 4, score: 2, groom: gYoni, bride: bYoni, desc: "Neutral and compatible physical temperament." };
  }

  // 5. Graha Maitri Koot (Max 5 pts)
  function calculateGrahaMaitri(groomRashiIdx, brideRashiIdx) {
    const gLord = RASHI_DATA[groomRashiIdx].lord;
    const bLord = RASHI_DATA[brideRashiIdx].lord;

    if (gLord === bLord) {
      return { name: "Graha Maitri", max: 5, score: 5, groom: gLord, bride: bLord, desc: "Same planetary ruler - Superior psychological synchronicity and intellectual friendship." };
    }

    const gRel = PLANET_RELATIONS[gLord];
    const bRel = PLANET_RELATIONS[bLord];

    const gConsidersB = gRel.friends.includes(bLord) ? "friend" : gRel.enemies.includes(bLord) ? "enemy" : "neutral";
    const bConsidersG = bRel.friends.includes(gLord) ? "friend" : bRel.enemies.includes(gLord) ? "enemy" : "neutral";

    let score = 3;
    if (gConsidersB === "friend" && bConsidersG === "friend") score = 5;
    else if ((gConsidersB === "friend" && bConsidersG === "neutral") || (bConsidersG === "friend" && gConsidersB === "neutral")) score = 4;
    else if (gConsidersB === "neutral" && bConsidersG === "neutral") score = 3;
    else if ((gConsidersB === "friend" && bConsidersG === "enemy") || (bConsidersG === "friend" && gConsidersB === "enemy")) score = 1;
    else if (gConsidersB === "enemy" && bConsidersG === "enemy") score = 0;

    return {
      name: "Graha Maitri",
      max: 5,
      score: score,
      groom: gLord,
      bride: bLord,
      desc: score >= 4 ? "Great harmony in worldview, shared life philosophy." : score >= 2 ? "Moderate mental tuning; communication will solve differences." : "Opposing mindsets; tolerance and patience needed."
    };
  }

  // 6. Gana Koot (Max 6 pts)
  function calculateGana(groomNakIdx, brideNakIdx) {
    const gGana = AstroEngine.NAKSHATRAS[groomNakIdx].gana;
    const bGana = AstroEngine.NAKSHATRAS[brideNakIdx].gana;

    let score = 0;
    if (gGana === bGana) {
      score = 6;
    } else if ((gGana === "Deva" && bGana === "Manushya") || (gGana === "Manushya" && bGana === "Deva")) {
      score = 5;
    } else if (gGana === "Rakshasa" && bGana === "Deva") {
      score = 1;
    } else if (gGana === "Deva" && bGana === "Rakshasa") {
      score = 0;
    } else {
      score = 0;
    }

    return {
      name: "Gana",
      max: 6,
      score: score,
      groom: gGana,
      bride: bGana,
      desc: score >= 5 ? "Divine and humane harmony; emotional rhythm matches seamlessly." : "Gana conflict (Rakshasa Gana dynamic); requires mutual emotional adaptability."
    };
  }

  // 7. Bhakoot Koot (Max 7 pts)
  function calculateBhakoot(groomRashiIdx, brideRashiIdx) {
    const diff = Math.abs(groomRashiIdx - brideRashiIdx);
    const relDistance = Math.min(diff, 12 - diff);

    // Inauspicious combinations: 2/12 (Dwi-Dwadash), 6/8 (Shadashtak), 9/5 (Nav-Pancham)
    let hasDosha = false;
    let doshaType = "";

    if (diff === 1 || diff === 11) {
      hasDosha = true;
      doshaType = "Dwi-Dwadash (2/12)";
    } else if (diff === 5 || diff === 7) {
      hasDosha = true;
      doshaType = "Shadashtak (6/8)";
    } else if (diff === 4 || diff === 8) {
      // 9/5
      hasDosha = true;
      doshaType = "Nav-Pancham (9/5)";
    }

    // Cancellation: If planetary lords are friends or identical
    const gLord = RASHI_DATA[groomRashiIdx].lord;
    const bLord = RASHI_DATA[brideRashiIdx].lord;
    const isFriends = gLord === bLord || (PLANET_RELATIONS[gLord].friends.includes(bLord) && PLANET_RELATIONS[bLord].friends.includes(gLord));

    let score = hasDosha ? 0 : 7;
    let desc = "Auspicious Bhakoot - Emotional, financial, and family prosperity assured.";

    if (hasDosha) {
      if (isFriends) {
        score = 7;
        desc = `Bhakoot Dosha (${doshaType}) is cancelled because both Rashi lords (${gLord} & ${bLord}) share deep celestial friendship! Full points granted.`;
      } else {
        desc = `Bhakoot Dosha (${doshaType}) present. Can cause occasional financial friction or emotional distance. Remedy: Donate yellow grains and perform Vishnu Sahasranama.`;
      }
    }

    return {
      name: "Bhakoot",
      max: 7,
      score: score,
      desc: desc
    };
  }

  // 8. Nadi Koot (Max 8 pts)
  function calculateNadi(groomNakIdx, brideNakIdx) {
    const gNadi = AstroEngine.NAKSHATRAS[groomNakIdx].nadi;
    const bNadi = AstroEngine.NAKSHATRAS[brideNakIdx].nadi;

    if (gNadi !== bNadi) {
      return {
        name: "Nadi",
        max: 8,
        score: 8,
        groom: gNadi,
        bride: bNadi,
        desc: "Different Nadis (Ayurvedic doshas balanced) - Exceptional genetic, physiological, and progeny blessing."
      };
    }

    // Same Nadi = Nadi Dosha
    return {
      name: "Nadi",
      max: 8,
      score: 0,
      groom: gNadi,
      bride: bNadi,
      desc: `Nadi Dosha detected (${gNadi} Nadi). Vedic shastras advise Maha Mrityunjaya Jaap or Gold/Cow donation remedy for health and progeny protection.`
    };
  }

  // Full 36 Gun Milan Calculation
  function calculateMatch(groomData, brideData) {
    const gRashi = groomData.moonSignIndex;
    const bRashi = brideData.moonSignIndex;
    const gNak = groomData.nakshatraIndex;
    const bNak = brideData.nakshatraIndex;

    const varna = calculateVarna(gRashi, bRashi);
    const vashya = calculateVashya(gRashi, bRashi);
    const tara = calculateTara(gNak, bNak);
    const yoni = calculateYoni(gNak, bNak);
    const maitri = calculateGrahaMaitri(gRashi, bRashi);
    const gana = calculateGana(gNak, bNak);
    const bhakoot = calculateBhakoot(gRashi, bRashi);
    const nadi = calculateNadi(gNak, bNak);

    const totalScore = varna.score + vashya.score + tara.score + yoni.score + maitri.score + gana.score + bhakoot.score + nadi.score;
    const percentage = Math.round((totalScore / 36.0) * 100);

    let verdict = "";
    let verdictClass = "";
    let recommendation = "";

    if (totalScore >= 28) {
      verdict = "Uttam Match (Supreme Auspicious)";
      verdictClass = "text-emerald-400";
      recommendation = "An extraordinary celestial union! Both charts exhibit deep emotional resonance, mutual longevity, prosperity, and spiritual bonding. Marriage is strongly recommended.";
    } else if (totalScore >= 18) {
      verdict = "Madhyam Match (Favorable & Good)";
      verdictClass = "text-amber-400";
      recommendation = "A very good match with sound stability. Minor points of difference can easily be balanced through open communication and mutual understanding.";
    } else {
      verdict = "Ashubh Match (Below Threshold)";
      verdictClass = "text-rose-400";
      recommendation = "The score is below the Vedic threshold of 18 points. It is advised to perform astrological remedies (Upay / Dosh Shanti) and consult a senior astrologer before proceeding.";
    }

    // Manglik Check
    const gManglik = groomData.isManglik;
    const bManglik = brideData.isManglik;
    let manglikMatch = "Both Non-Manglik (Clean)";
    if (gManglik && bManglik) {
      manglikMatch = "Both Manglik - The dosha neutralizes each other seamlessly!";
    } else if (gManglik || bManglik) {
      manglikMatch = `One partner is Manglik (${gManglik ? "Groom" : "Bride"}). Kumbh Vivah or Mars Shanti Puja recommended.`;
    }

    return {
      groom: groomData,
      bride: brideData,
      totalScore,
      percentage,
      verdict,
      verdictClass,
      recommendation,
      manglikMatch,
      koots: [varna, vashya, tara, yoni, maitri, gana, bhakoot, nadi]
    };
  }

  return {
    calculateMatch
  };
})();

if (typeof window !== "undefined") {
  window.KundliMilan = KundliMilan;
}
