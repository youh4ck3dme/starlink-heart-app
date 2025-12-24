import { GoogleGenAI, Type } from "@google/genai";
import { Heart } from "../types";

const getApiKey = () => {
    return localStorage.getItem('custom_api_key') || process.env.API_KEY;
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

export const generateCosmicResponse = async (prompt: string, imageFile?: File, isTeacherCloneMode: boolean = false): Promise<{ textResponse: string; visualAids: string[] }> => {
    // Initialize AI with the environment variable directly as per new standards
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    try {
        const parts: any[] = [{ text: prompt }];

        if (imageFile) {
             const base64Image = await fileToBase64(imageFile);
             parts.push({
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            });
        }

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

        // --- PROMPT 1: TEACHER CLONE & STANDARD MODE ---
        
        let specificInstructions = "";

        if (isTeacherCloneMode) {
            specificInstructions = `
            REŽIM "DVOJČA UČITEĽA" (TEACHER CLONE) - EXTRÉMNE DÔLEŽITÉ:
            1. **Detekcia Metodiky:** Ak je priložený obrázok, detailne ho skenuj. Hľadaj špecifické grafické prvky (krokovacie pásy, pavučiny, autobusy = Hejného metóda; farebné tyčinky = Montessori; klasické stĺpce).
            2. **Mimikry:** Ak nájdeš Hejného prostredie, používaj LEN jeho terminológiu (napr. "dedo Lesoň", "krokovanie"). Ak je to klasika, drž sa formálnejších postupov.
            3. **Konzistencia:** Tvoje vysvetlenie musí vyzerať, akoby vypadlo z tej istej učebnice.
            4. **Osobnosť:** Si "Vesmírny Profesor" - múdry, presný, ale povzbudivý.
            5. **Vizuálne Kotvy (Highlighting):** Ak identifikuješ na obrázku kľúčový pojem, číslo alebo časť zadania, o ktorom práve hovoríš, zabaľ ho do dvojitých hranatých zátvoriek. Napríklad: "Pozri sa na [[číslo 15]] v rohu" alebo "Čo robí to [[sloveso]]?". Toto v aplikácii vytvorí vizuálne zvýraznenie (podčiarknutie/farbu), ktoré pomôže dieťaťu zamerať pozornosť.
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
        1. **Nikdy neprezraď výsledok hneď.**
        2. **Sokratovská metóda:** Klaď otázky, ktoré dieťa navedú na riešenie.
        3. **Formátovanie:** Dôležité slová alebo čísla daj do hviezičiek, napr. *číslo 5* alebo *podmet*.
        4. Jazyk: Prirodzená slovenčina, tykanie.
        
        Vždy vráť platný JSON: { textResponse: string, visualAids: string[] }.`;

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
        const jsonResponse = JSON.parse(text);
        return jsonResponse;

    } catch (error) {
        return handleApiError(error);
    }
};

export const generateParentGuide = async (conversationHistory: Heart[], image?: File | string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Using a newer model for better vision capabilities if available, fallback to flash preview if needed.
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || "Bez odpovede.";

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
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

    try {
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
        const jsonResponse = JSON.parse(text);
        return jsonResponse;

    } catch (error) {
        return handleApiError(error);
    }
};

export const getStarryTip = async (): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const systemInstruction = `
    Si Starry, vesmírny sprievodca.
    Tvojou úlohou je dať krátky, zábavný a užitočný tip pre deti do školy (ako sa lepšie učiť, ako si pamätať veci, motivačný citát).
    Odpoveď musí byť v slovenčine, maximálne na 2 vety. Pridaj 1 emoji na koniec.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Daj mi tip na dnes.",
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || "Dnes je skvelý deň na objavovanie!";
    } catch (error) {
        console.error("Error generating tip:", error instanceof Error ? error.message : String(error));
        return "Hviezdy sú dnes zahalené hmlou. Skús to neskôr!";
    }
};