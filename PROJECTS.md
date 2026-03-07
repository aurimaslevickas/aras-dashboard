# PROJECTS.md — Aurimo projektų kontekstas

Atnaujinta: 2026-03-07

---

## 1. gyvenimoklubas.lt — Publisher platforma

**Statusas:** Stabdyta. Galimas atnaujinimas nauju modeliu.

**Esmė:** Aurimas kaip publisheris dirbo su lektoriais — sukūrė funnelį, valdė reklamą, prisiėmė visą riziką, bet gavo mažą pelno dalį.

**Buvusi problema:** 50/50 pelno pasidalinimas, bet Aurimas investuoja pinigus + prisiima riziką + samdo reklamos žmogų + padengia visus įrankius. Faktiškai — lektorius gavo daugiau.

**Techninis srautas:** registracija → WebinarJam (automatizuotas webinaras su "live" komentarais) → pardavimo puslapis → ActiveCampaign email sequence

**Turimas privalumas:** ~60K pirkėjų duomenų bazė ActiveCampaign — gali siųsti naujiems projektams.

**Naujas modelis (svarstomas):**
- 30% nuo pelno ARBA
- 50/50 bet lektorius pats investuoja į įrankius ir reklamą

**Riba:** Aurimas nenori būti agentūra (t.y. negali būti lengvai atleistas).

---

## 2. sveikamityba.lt — Sveikata / PDF produktai

**Statusas:** Aktyvus

**Pagrindinis produktas:** Cholesterolio PDF knyga (Dr. Tomo Želvio)
- https://sveikamityba.lt/cholesterolis-knyga
- Upsell €12 → visas rinkinys: https://sveikamityba.lt/cholesterolis
- Visas rinkinys sukurtas su AI

**Kiti PDF:** egzistuoja, bet naudojami tik kaip upsell — ne stand-alone projektai.

---

## 3. Menopauzės subscription (planuojamas)

**Statusas:** Planas / idėja

**Modelis:** Prenumerata, pasikartojančios pajamos (MRR)
**Įkvėpimas:** Cholesterolio PDF modelio sėkmė
**Pastaba:** Strategiškai vertingas modelis — pasikartojančios pajamos.

---

## 4. visitvilnius.lt — Vilniaus turizmo portalas

**Statusas:** Prototipas, dar neveikia oficialiai

**Prototipas:** https://visitvilnius-lt-tour-8tw0.bolt.host/
- Atrodo: "Your journey starts here — Vilnius" hero su "Plan a Trip" CTA
- Navigacija: See / Events / Eat / Bars / Stay / Shop / Plan a Trip
- Anglų kalba, turistams skirta

**Tikslai (du scenarijai):**
1. Parduoti investuotojams už ~100K
2. Surinkti pirmus mokančius subscription → pritraukti finansavimą

**Investuotojų scenarijus:**
- Atgauti 50K mainais už savo indėlį ir darbą metams
- 50K → investicijos
- 50K → žmonės (pardavėjas, turinio pildytojas, reklama)

---

## 5. Asmeninis prekinis ženklas — aurimaslevickas.lt

**Statusas:** Egzistuoja, bet nedirbama sistemingai

**Pozicionavimas:**
> Skaitmeninių produktų architektas 🏗️
> Padedu sukurti online produktus
> Kursai • seminarai • knygos
> 20.000+ mokymų | 2 knygų autorius

**Kanalai:** TikTok, FB, Instagram, Threads, LinkedIn — visi yra, bet neisnaudojami

**Tikslinė veikla:** padėti ekspertams (kursai, mokymai, produktai)
- Nežinoma kainodaros strategija (nori aukštos kainos)
- Nežinoma formato (individual, mastermind, grupinis coaching)
- Nėra komunikacijos plano

---

## 6. aitendencijos.lt — Pavyzdinis kursų projektas (draugo, ne Aurimo)

**Svarbu:** Šis projektas yra ETALONO pavyzdys, kurį Aurimas nori atkurti sau.

**Platforma (matyta):
- Prisijungimo puslapis → dashboard su moduliais ir pamokomis
- Kairė šoninė juosta: moduliai su pamokų skaičiumi ir progresu
- Viršuje: "Dabar: [pamokos pavadinimas]" + progresas X/X (%)
- Video: Vimeo embedded
- Funkcijos: pamokos pažymėjimas kaip atlikta, sertifikatas, pastabos prie kiekvienos pamokos
- 6 moduliai, 53 pamokos (skaitmeninio produkto kūrimas, projektas, puslapis, email, reklama, subscription)

**Stilius dabar:** Tamsus, minimalus (sidebar + video + content)
**Aurimas nori:** Mindvalley.com stilius — ryškesnis, premium, aukštesnės kokybės vizualas

---

## Techniniai įrankiai ir išlaidos

| Įrankis | Kaina/mėn | Paskirtis | Prioritetas keisti |
|---|---|---|---|
| ActiveCampaign | ~€600 | Email sąrašai (~60K), automatizacijos | 🔴 AUKŠTAS |
| Clickfunnels | ? | Pardavimo puslapiai, funneliai | 🔴 AUKŠTAS |
| WebinarJam | ? | Automatizuoti webinarai | 🟡 Vidutinis |

**Tikslas:** Sumažinti iki ~€100-150/mėn

---

## Strateginiai prioritetai ir poreikiai

### A. Kaštų mažinimas (skubu)
- **ActiveCampaign €600/mėn** → alternatyvos:
  - Brevo (Sendinblue): nuo €25/mėn, panaši funkcionalumas
  - MailerLite: pigiau, geras automatizacijoms
  - Custom: AWS SES (~$1/10K el. laiškų) + open-source automation (n8n + Listmonk)
  - Sprendimas: reikia įvertinti migravimo kaštus vs taupymą
- **Clickfunnels** → custom HTML/statiniai pardavimo puslapiai (Astro, Next.js arba tiesiog HTML)

### B. Kursų platforma (prioritetinis build)
- Atkurti aitendencijos.lt tipo sistemą, bet Mindvalley stiliumi
- Funkcijos: login, moduliai, progresas, video (Vimeo/YouTube), sertifikatas, pastabos
- Tech: galima sukurti su Next.js + Supabase (auth + DB) + Vimeo embed

### C. Email bazės optimizavimas
- ~60K kontaktų, bet nedirbama, netvaringa
- Segmentavimas → aktyvūs vs neaktyvūs
- Reactivation kampanija → naujų produktų siūlymas (menopauzė, kt.)

### D. Socialinių tinklų automatizacija (asmeninis prekinis ženklas)
- Tikslas: 3x per dieną minimum (FB, Instagram, LinkedIn, TikTok)
- Sistema: AI agentai → generuoja idėjas → Aurimas patvirtina → generuoja tekstus + vizualus (Nano Banana) → postuoja pagal schedule
- ManyChat integracija: konvertuoti sekėjus į lead magnets

### E. visitvilnius.lt komercializavimas
- Du keliai: investuotojai ARBA subscription traction
- Reikia: pitch deck investuotojams, subscription modelio koncepcija

### F. Dashboard + agentų sistema
- Aurimas nori: centrinis dashboard visiems projektams + užduotims
- Agentų sistema: pigesniais modeliais (GPT-4o mini, Gemini) atlieka research, kuria turinį, postuoja
- Aras (aš) = "protas" per kurį bendrauja su agentais

---

## Pastaba dėl saugumo

Prisijungimo duomenys prie aitendencijos.lt buvo pateikti pokalbyje — jie NĖRA saugomi šiame faile. Jei reikia, Aurimas turi pasikeisti slaptažodį arba sukurti atskirą prieigą.
