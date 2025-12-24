<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Starlink Heart - AI EdTech Homework Helper

Aplikácia, ktorá pomáha deťom s domácimi úlohami pomocou umelej inteligencie (Gemini AI).

## Ako spustiť aplikáciu lokálne

1. **Inštalácia závislostí:**
   ```bash
   npm install
   ```
   *Poznámka: Ak narazíte na problémy s verziou `google-genai`, spustite `npm install` znova, konflikt sme vyriešili.*

2. **Spustenie aplikácie:**
   ```bash
   npm run dev
   ```
   Aplikácia pobeží na `http://localhost:5173`.

## Funkcie

### 🏠 Lokálna Databáza (Zero Config)
Aplikácia je nakonfigurovaná na **lokálny režim**.
- Všetky správy a obrázky sa ukladajú **iba vo vašom prehliadači** (LocalStorage & IndexedDB).
- Nie je potrebné nastavovať Firebase ani cloudové služby.
- Dáta ostanú zachované aj po obnovení stránky.

### 🔑 Vlastný API Kľúč
Aplikácia má prednastavený demo kľúč. Pre produkčné použitie alebo ak narazíte na limity:
1. Kliknite na **ozubené koliesko** (Nastavenia) v aplikácii.
2. Zadajte svoj **Gemini API Key** do poľa "Vlastný API Kľúč".
3. Kliknite "Uložiť". Aplikácia bude odteraz používať váš kľúč.

### 🧠 Režimy
- **Hravý Starlink:** Zábavný sprievodca pre bežné otázky.
- **Teacher Clone:** Špeciálny režim pre vysvetľovanie učiva (Hejného metóda, Montessori).
- **Rodičovský prekladač:** Preloží školské zadanie do "reči dospelých" a poradí rodičom, ako pomôcť.
