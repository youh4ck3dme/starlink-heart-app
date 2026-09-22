🏆 Galaktický Rebríček Hviezdnych Žiakov (Top Kids Leaderboard)
📌 Cieľ:
Vytvoriť motivačný, bezpečný a férový rebríček, ktorý vizuálne oslavuje deti, ktoré sa najviac snažia – nielen podľa XP, ale aj podľa zodpovednosti, výdrže a školských výsledkov.
🎖️ Rebríčkové Kritériá
Kritérium	Váha	Zdroj
✅ Denné misie splnené	35 %	missions.completedToday
📚 Výkon v AI výzvach	25 %	aiRewardEngine.successRate
🏫 Školský pokrok (známky)	25 %	schoolDashboard.gradeTrend
🔁 Streak & aktivita	15 %	useStreak() + login tracking
Poznámka: Pre férovosť nezávisí výlučne od XP – aj „tichý hrdina“ bez badgeov môže byť top 💪
🌟 UI Funkcie
Galaktické trofeje – každé dieťa má 3D „hviezdnu plaketu“ s menom a avatarom
Pozícia v triede / škole / galaktickom svete
Tabs: Trieda | Škola | Celosvetovo
Strážca reaguje na výsledky!
Ak je dieťa v TOP 3 → Starry mu zatlieska alebo Robo povie: „Skláňam sa, generále!“
🔐 Ochrana súkromia (GDPR-K ready)
Rebríček zobrazuje iba kreslenú prezývku a avatar, nie reálne meno.
V škole sa zobrazuje len pre učiteľov a spolužiakov.
Opt-in/opt-out systém pre rodičov cez Parent Dashboard.
🔥 Level Up Bonusy (Top 10 Detí)
🎁 Extra XP každý týždeň
🎖️ Špeciálny „Star Student“ badge (Epic)
🎨 Možnosť navrhnúť si vlastnú planetku do mapy!
📜 Diplom v PDF: „Hrdina galaxie XY“ (download s podpisom maskota 😄)
🛠️ Architektúra & Backend návrh
Endpoint: GET /leaderboard/school/:schoolId
Security: Validácia tokenu + role (učiteľ/rodič/žiak)
Backend agenty: calculateScore(), updateRanks(), schoolSnapshot()
Frekvencia: Live update každý deň o polnoci
🧑‍🏫 Bonus pre školy
Admin panel: učitelia vidia štatistiky triedy
Rodič report: “Vaše dieťa je #3 v škole – pokračujte v dobrej práci!”
Motivačné správy: generované AI maskotom každému hráčovi