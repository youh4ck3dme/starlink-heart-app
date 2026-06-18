// Dynamic import used inside functions to reduce initial bundle size
import { Heart } from "../types";
import { checkInputSafety, getSafetyBlockMessage } from "./safetyFilter";
import { PROF_STARLINK_SYSTEM_PROMPT, TEACHER_CLONE_SYSTEM_PROMPT } from "../config/prompts";

type AIProvider = 'gemini' | 'mistral';

const getConfiguredKeys = () => {
    const geminiKey =
        localStorage.getItem('custom_api_key') ||
        import.meta.env.VITE_GEMINI_API_KEY ||
        process.env.API_KEY ||
        '';
    const mistralKey =
        localStorage.getItem('custom_mistral_api_key') ||
        import.meta.env.VITE_MISTRAL_API_KEY ||
        process.env.MISTRAL_API_KEY ||
        '';
    return { geminiKey, mistralKey };
};

const getAiProvider = (): { provider: AIProvider; apiKey: string } => {
    const { geminiKey, mistralKey } = getConfiguredKeys();
    if (geminiKey) return { provider: 'gemini', apiKey: geminiKey };
    if (mistralKey) return { provider: 'mistral', apiKey: mistralKey };
    throw new Error('Chýba API kľúč: pridajte Gemini alebo Mistral kľúč v nastaveniach.');
};

const normalizeAssistantText = (content: unknown): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((part) => (typeof part === 'string' ? part : (part as any)?.text || ''))
            .filter(Boolean)
            .join('\n');
    }
    return '';
};

const extractJsonCandidate = (text: string): string => {
    const fenced = text.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();
    return text.trim();
};

const parseJsonSafely = <T>(text: string, fallback: T): T => {
    const candidate = extractJsonCandidate(text);
    try {
        return JSON.parse(candidate) as T;
    } catch {
        return fallback;
    }
};

const generateMistralText = async (
    apiKey: string,
    systemInstruction: string,
    userPrompt: string
): Promise<string> => {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'mistral-small-latest',
            temperature: 0.2,
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt },
            ],
        }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Mistral API error (${response.status}): ${details}`);
    }

    const data = await response.json();
    return normalizeAssistantText(data?.choices?.[0]?.message?.content);
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const processImageInput = async (image?: File | string): Promise<{ mimeType: string, data: string } | null> => {
    if (!image) return null;

    if (image instanceof File) {
        const base64 = await fileToBase64(image);
        return { mimeType: image.type, data: base64 };
    }

    if (typeof image === 'string' && image.startsWith('data:')) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            return { mimeType: matches[1], data: matches[2] };
        }
    }
    
    return null;
};

const handleApiError = (error: unknown) => {
    // Prevent circular JSON error by logging only the string representation or message
    console.error("Error generating response from Gemini:", error instanceof Error ? error.message : String(error));
    
    let errorMessage = "Vyskytla sa neznáma chyba pri spájaní s vesmírom. Skúste to prosím znova.";
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes("resource exhausted") || lowerCaseMessage.includes("429")) {
            errorMessage = "🚀 Starry je dočasne preťažený (prekročená kvóta). Skúste to prosím o chvíľu znova.";
        } else {
             errorMessage = `Vyskytla sa chyba pri spájaní s vesmírom: ${error.message}`;
        }
    }
    return { textResponse: errorMessage, visualAids: ['🛰️', '💥'] };
};

export const generateCosmicResponse = async (prompt: string, conversationHistory: Heart[], imageFile?: File, isTeacherCloneMode: boolean = false): Promise<{ textResponse: string; visualAids: string[] }> => {
    // --- Safety Filter: Check input before processing ---
    const safetyCheck = checkInputSafety(prompt);
    if (safetyCheck.blocked) {
        return { 
            textResponse: getSafetyBlockMessage(safetyCheck.reason || 'unknown'), 
            visualAids: ['🛡️', '💙'] 
        };
    }
    // Use filtered prompt (PII removed if detected)
    const safePrompt = safetyCheck.filtered;

    try {
        const { provider, apiKey } = getAiProvider();
        const historyContext = conversationHistory.slice(-5).map(h => 
            h.aiResponse ? `AI (Kouč): ${h.aiResponse.textResponse}` : `Dieťa: ${h.message}`
        ).join('\n');

        const fullPrompt = historyContext ? `História konverzácie:\n${historyContext}\n\nAktuálna otázka: ${safePrompt}` : safePrompt;

        const parts: any[] = [{ text: fullPrompt }];

        if (imageFile) {
             const base64Image = await fileToBase64(imageFile);
             parts.push({
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            });
        }

        // --- PROMPT 1: TEACHER CLONE & STANDARD MODE ---
        
        let specificInstructions = "";

        if (isTeacherCloneMode) {
            specificInstructions = `
            REŽIM: "Učivo-Guard + Kouč (SR 1.–3.)"
            Si AI učiteľ pre deti 8+ na Slovensku. 
            
            KROK 1: Najprv zisti (ak to ešte nevieš z histórie):
            (1) ročník (1.–3.)
            (2) predmet (SJL/MAT/Prvouka/Prírodoveda/Vlastiveda/AJ/INF)
            (3) čo je cieľ úlohy.
            
            KROK 2: Učivo-Guard
            - Over, že riešenie ostáva v rámci učiva daného ročníka (ak je mimo, jemne to zjednoduš na najbližšie učivo).
            
            KROK 3: Interakcia
            - Vysvetľuj v krátkych krokoch, vždy polož 1 kontrolnú otázku (dieťa musí odpovedať).
            - Neprezrádzaj celý výsledok hneď: najprv navádzaj, potom až na konci ukáž “správne riešenie + prečo”.
            
            KROK 4: Finále (až keď je úloha vyriešená)
            - Daj mini-kvíz (3 otázky).
            - Zhrň “čo si zapamätať” v 3 bodoch.
            
            Štýl: povzbudzujúci, hravý, bez hanby a bez strašenia.
            Bezpečnosť: nežiadaj osobné údaje, adresu, fotky, telefón.
            `;
        } else {
            specificInstructions = `
            REŽIM "HRAVÝ STARLINK" (Štandard):
            1. Ignoruj školskú formalitu, zameraj sa na pochopenie cez hru.
            2. Používaj analógie: Matematika je ako kódovanie hier, Gramatika je ako skladanie LEGO blokov.
            3. Osobnosť: Energický robotí kamarát.
            `;
        }

        const systemInstruction = `Si Starry (verzia 2030), najlepší AI sprievodca pre deti (6-11 rokov).
        
        ${specificInstructions}

        VŠEOBECNÉ PRAVIDLÁ:
        1. **Formátovanie:** Dôležité slová alebo čísla daj do hviezičiek.
        2. Jazyk: Prirodzená slovenčina, tykanie.
        
        Vždy vráť platný JSON: { textResponse: string, visualAids: string[] }.`;

        if (provider === 'gemini') {
            const { GoogleGenAI, Type } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    textResponse: {
                        type: Type.STRING,
                        description: "Edukačná, hravá odpoveď."
                    },
                    visualAids: {
                        type: Type.ARRAY,
                        description: "Pole maximálne 3 relevantných emoji.",
                        items: {
                            type: Type.STRING,
                            description: "Jeden emoji znak."
                        }
                    }
                },
                required: ['textResponse', 'visualAids']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts },
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });
            
            const text = response.text || "{}";
            return JSON.parse(text);
        }

        const mistralPrompt = `${fullPrompt}\n\n${
            imageFile ? 'Poznámka: dieťa priložilo aj obrázok úlohy.' : ''
        }\n\nVráť LEN platný JSON objekt: {"textResponse":"...","visualAids":["..."]}`;
        const mistralText = await generateMistralText(apiKey, systemInstruction, mistralPrompt);
        const parsed = parseJsonSafely<{ textResponse?: string; visualAids?: string[] }>(mistralText, {});

        return {
            textResponse: parsed.textResponse || "Skús mi prosím napísať otázku ešte raz trochu inak 😊",
            visualAids: Array.isArray(parsed.visualAids) ? parsed.visualAids.slice(0, 3) : ['✨'],
        };

    } catch (error) {
        return handleApiError(error);
    }
};

export const generateParentGuide = async (conversationHistory: Heart[], image?: File | string): Promise<string> => {
    const lastInteraction = conversationHistory.slice(-2); 
    const formattedContext = lastInteraction.map(h => 
        h.aiResponse ? `AI: ${h.aiResponse.textResponse}` : `Dieťa: ${h.message}`
    ).join('\n');

    const systemInstruction = `
    Si "Rodičovský Prekladač 2.0" (Mega Parent Translator).
    Tvojou úlohou je analyzovať zadanie (text a hlavne OBRÁZOK, ak je priložený) a vytvoriť super-pomôcku pre rodiča.

    **ÚLOHA:**
    1. **Identifikácia Metódy:** Pozri sa na obrázok. Je to Hejného metóda (krokovanie, autobus, pavučiny)? Je to klasika? Je to Montessori?
    2. **Analýza Problému:** Čo presne má dieťa urobiť? Kde sa pravdepodobne zasekne?

    **VÝSTUP (Markdown):**

    ### 🏫 Čo to vlastne je?
    (Vysvetli koncept jednou vetou ako dospelý dospelému. Napr.: "Je to rovnica o dvoch neznámych, len sú namiesto X a Y použité zvieratká.")

    ### 💣 Kde je pasca?
    (Na čo si dať pozor. Napr.: "Deti často zabudnú pripočítať tú jednotku pri prechode cez desiatku.")

    ### 🛠️ Ako pomôcť (Návod pre rodiča)
    (Konkrétna veta/otázka, ktorú má rodič povedať. Žiadne "vysvetli mu". Ale: "Povedz mu: 'Skús si to nakresliť ako vláčik.'")

    ### 👶 Vysvetlenie pre dieťa (Bonus)
    (Jednoduchá analógia alebo vizuálny tip, ktorý môže rodič priamo prečítať dieťaťu. Napr.: "Predstav si, že to mínus je hladný krokodíl, ktorý zjedol 5 jabĺk.")
    `;

    try {
        const { provider, apiKey } = getAiProvider();
        const parts: any[] = [{ text: `Analyzuj túto interakciu a priložený vizuál (ak je). Vygeneruj report.\n\nKontext:\n${formattedContext}` }];

        const imageData = await processImageInput(image);
        if (imageData) {
            parts.push({
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.data
                }
            });
        }

        if (provider === 'gemini') {
            const { GoogleGenAI } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { parts },
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            return response.text || "Bez odpovede.";
        }

        const imageHint = image ? '\nDieťa poslalo aj obrázok úlohy.' : '';
        const mistralResponse = await generateMistralText(
            apiKey,
            systemInstruction,
            `Analyzuj interakciu a vráť odpoveď v Markdowne pre rodiča.\n\nKontext:\n${formattedContext}${imageHint}`
        );
        return mistralResponse || "Bez odpovede.";

    } catch (error) {
        console.error("Error generating parent guide:", error instanceof Error ? error.message : String(error));
        // Fallback to flash-preview if exp model fails or doesn't exist in the SDK definition yet
        if (String(error).includes("404") || String(error).includes("not found")) {
             return "Model error. Retrying with standard model...";
        }
        return "Nepodarilo sa vygenerovať radu pre rodiča. Skúste to neskôr.";
    }
};

export const generateCosmicHint = async (conversationHistory: Heart[]): Promise<{ textResponse: string; visualAids: string[] }> => {
    const formattedHistory = conversationHistory.map(heart => {
        if (heart.aiResponse?.textResponse) {
            return `Starry: ${heart.aiResponse.textResponse}`;
        } else if (heart.message) {
            return `Dieťa: ${heart.message}`;
        } else if (heart.imageURL) {
            return `Dieťa: [Poslalo obrázok úlohy]`;
        }
        return '';
    }).filter(Boolean).join('\n');

    const prompt = `Dieťa sa zaseklo a potrebuje "nakopnúť". Analyzuj doterajšiu konverzáciu a poskytni silnejšiu nápovedu (Sokratovskú otázku, ktorá ho posunie, ale neprezradí riešenie).`;

    const systemInstruction = `Si Starry, trpezlivý sprievodca.
    Vidíš históriu chatu. Dieťa si vyžiadalo NÁPOVEDU.
    1. Zisti, v čom je problém.
    2. Daj návodnú otázku alebo analógiu.
    3. NEPREZRÁDZAJ výsledok.
    Vráť JSON: { textResponse: string, visualAids: string[] }.`;

    try {
        const { provider, apiKey } = getAiProvider();
        if (provider === 'gemini') {
            const { GoogleGenAI, Type } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    textResponse: {
                        type: Type.STRING,
                        description: "Nápoveda pre dieťa."
                    },
                    visualAids: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['textResponse', 'visualAids']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `História chatu:\n${formattedHistory}\n\nPožiadavka: ${prompt}`,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                }
            });
            
            const text = response.text || "{}";
            return JSON.parse(text);
        }

        const mistralText = await generateMistralText(
            apiKey,
            systemInstruction,
            `História chatu:\n${formattedHistory}\n\nPožiadavka: ${prompt}\n\nVráť LEN JSON: {"textResponse":"...","visualAids":["..."]}`
        );
        const parsed = parseJsonSafely<{ textResponse?: string; visualAids?: string[] }>(mistralText, {});
        return {
            textResponse: parsed.textResponse || "Skúsme to po krokoch. Čo je prvá vec, ktorú už vieš? 🙂",
            visualAids: Array.isArray(parsed.visualAids) ? parsed.visualAids.slice(0, 3) : ['💡'],
        };

    } catch (error) {
        return handleApiError(error);
    }
};

export const getStarryTip = async (): Promise<string> => {
    const systemInstruction = `
    Si Starry, vesmírny sprievodca.
    Tvojou úlohou je dať krátky, zábavný a užitočný tip pre deti do školy (ako sa lepšie učiť, ako si pamätať veci, motivačný citát).
    Odpoveď musí byť v slovenčine, maximálne na 2 vety. Pridaj 1 emoji na koniec.
    `;

    try {
        const { provider, apiKey } = getAiProvider();
        if (provider === 'gemini') {
            const { GoogleGenAI } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Daj mi tip na dnes.",
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            return response.text || "Dnes je skvelý deň na objavovanie!";
        }

        const mistralText = await generateMistralText(apiKey, systemInstruction, "Daj mi tip na dnes.");
        return mistralText || "Dnes je skvelý deň na objavovanie!";
    } catch (error) {
        console.error("Error generating tip:", error instanceof Error ? error.message : String(error));
        return "Hviezdy sú dnes zahalené hmlou. Skús to neskôr!";
    }
};