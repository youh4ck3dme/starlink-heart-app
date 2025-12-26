import { GoogleGenAI, Type } from "@google/genai";

export type Skill = 'math' | 'reading' | 'science' | 'language';

export interface StudentProfile {
  id: string;
  age: number;
  weakSkills: Skill[];
}

export interface Challenge {
  id: string;
  title: string; // Krátky text úlohy pre dieťa
  skill: Skill;
  xpReward: number; // násobí sa gamification multiplikátorom
  rarity: 'common' | 'rare' | 'epic';
}

const getApiKey = () => {
    return localStorage.getItem('custom_api_key') || process.env.API_KEY;
};

// Záložný zoznam pre prípad výpadku, aby appka nikdy neostala prázdna
const FALLBACK_CHALLENGES: Challenge[] = [
    { id: 'fb-1', title: 'Vypočítaj 5 príkladov (do 100)', skill: 'math', xpReward: 10, rarity: 'common' }, // Was 50
    { id: 'fb-2', title: 'Prečítaj 2 strany z knihy', skill: 'reading', xpReward: 15, rarity: 'common' }, // Was 60
    { id: 'fb-3', title: 'Nájdi 3 predmety, ktoré plávajú na vode', skill: 'science', xpReward: 30, rarity: 'rare' } // Was 100
];

export async function generateDailyChallenges(profile: StudentProfile): Promise<Challenge[]> {
  try {
      const apiKey = getApiKey();
      if (!apiKey) {
          console.warn("Generating challenges: No API Key, using fallback.");
          return FALLBACK_CHALLENGES;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
      Si Starry, gamifikačný inžinier pre vzdelávaciu aplikáciu Starlink Heart.
      Tvojou úlohou je vygenerovať 3 denné misie pre žiaka (vek cca ${profile.age || 9} rokov).
      
      PROFIL ŽIAKA (Slabé stránky): ${profile.weakSkills.join(', ') || 'Žiadne špecifické (daj mix)'}.
      
      Pravidlá pre misie:
      1. Musia byť konkrétne a splniteľné doma do 10 minút.
      2. Jedna misia musí byť "Epická" (zábavný experiment alebo kreatívna úloha).
      3. Jazyk: Hravá slovenčina, tykanie.
      4. XP Odmena: Udržuj nízke hodnoty! (Bežná = 10xp, Zriedkavá = 25xp, Epická = 50xp MAX).
      5. Vráť presný JSON.
      `;

      const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Znenie úlohy, napr. 'Spočítaj všetky okná v byte'." },
                skill: { type: Type.STRING, enum: ['math', 'reading', 'science', 'language'] },
                xpReward: { type: Type.NUMBER },
                rarity: { type: Type.STRING, enum: ['common', 'rare', 'epic'] }
            },
            required: ['title', 'skill', 'xpReward', 'rarity']
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Vygeneruj 3 nové denné misie.",
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
      });

      const text = response.text || "[]";
      const generatedChallenges = JSON.parse(text) as Omit<Challenge, 'id'>[];

      return generatedChallenges.map((ch, i) => ({
          ...ch,
          id: `daily-${Date.now()}-${i}`,
          // Safety defaults if AI hallucinates types
          skill: (['math', 'reading', 'science', 'language'].includes(ch.skill) ? ch.skill : 'math') as Skill,
          rarity: (['common', 'rare', 'epic'].includes(ch.rarity) ? ch.rarity : 'common') as any
      }));

  } catch (error) {
      console.error("AI Challenge Generation failed:", error);
      return FALLBACK_CHALLENGES;
  }
}
