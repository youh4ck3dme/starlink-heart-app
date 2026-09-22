import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Heart } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#060819] to-[#0f172a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 backdrop-blur-md bg-[#060819]/80 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Späť"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Zásady ochrany súkromia</h1>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-6 space-y-8">
        
        {/* Last Updated */}
        <p className="text-sm text-white/50">Posledná aktualizácia: 26. decembra 2024</p>

        {/* Intro */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sky-400" />
            <h2 className="text-2xl font-bold">Vaše súkromie je pre nás dôležité</h2>
          </div>
          <p className="text-white/70 leading-relaxed">
            Starlink Heart je vzdelávacia aplikácia určená pre deti. Bezpečnosť a súkromie 
            vašich detí berieme veľmi vážne. Táto stránka vysvetľuje, aké údaje zhromažďujeme, 
            ako ich používame a ako ich chránime.
          </p>
        </section>

        {/* Data Collection */}
        <section className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-semibold">Aké údaje zhromažďujeme</h3>
          </div>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Lokálne uložené dáta:</strong> Nastavenia aplikácie, XP body, úspechy, a história konverzácií sú uložené lokálne na vašom zariadení.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>AI konverzácie:</strong> Správy odoslané do AI asistenta sú spracované službou Google Gemini AI na účely generovania odpovedí.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span><strong>Žiadne osobné údaje:</strong> Nezbierame mená, e-maily ani iné osobné identifikátory bez výslovného súhlasu.</span>
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold">Ako chránime vaše údaje</h3>
          </div>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Všetka komunikácia prebieha cez zabezpečené HTTPS spojenie.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Dáta sú uložené lokálne na vašom zariadení – nemáme prístup k histórii konverzácií.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>AI odpovede sú filtrované pre bezpečný obsah vhodný pre deti.</span>
            </li>
          </ul>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-4 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-sky-400" />
            <h3 className="text-xl font-semibold">Ochrana detí (COPPA)</h3>
          </div>
          <p className="text-white/70 leading-relaxed">
            Starlink Heart je navrhnutý pre deti vo veku 8-9 rokov. Dodržiavame pravidlá 
            COPPA (Children's Online Privacy Protection Act) a GDPR pre ochranu súkromia detí:
          </p>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span>Nezbierame osobné údaje detí bez súhlasu rodiča.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span>Neposkytujeme údaje tretím stranám na marketingové účely.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400">•</span>
              <span>Rodičia môžu kedykoľvek požiadať o vymazanie všetkých údajov.</span>
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Kontakt</h3>
          <p className="text-white/70">
            Ak máte otázky ohľadom ochrany súkromia, kontaktujte nás na:
          </p>
          <a 
            href="mailto:privacy@starlinkheart.com" 
            className="inline-block px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 transition-colors font-medium"
          >
            privacy@starlinkheart.com
          </a>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>© 2024 Starlink Heart. Všetky práva vyhradené.</p>
        </footer>
      </main>
    </div>
  );
}
