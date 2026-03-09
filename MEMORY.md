# MEMORY.md — Ilgalaikė atmintis

## Vartotojas

- Aurimas Levickas, Europe/Vilnius
- Strategas, skaitmeninių produktų kūrėjas
- Kalba: lietuvių (pagrindinė), anglų
- Stilius: greitas, reiklus, orientuotas į rezultatą — be tuščio mandagumo

## Darbo principai

- Viduje veikti drąsiai, išorėje — tik su leidimu
- Rizikingus veiksmus rodyti prieš vykdant
- Atmintį rašyti į failus — ne tikėtis, kad „atsiminsi"

## Projektai

- **gyvenimoklubas.lt** — buvęs publisher modelis su lektoriais, blogas pasidalinimas, stabdyta. Turi ~60K email bazę ActiveCampaign. Galimas atnaujinimas naujomis sąlygomis.
- **sveikamityba.lt** — cholesterolio PDF knyga (Dr. T. Želvys), gerai parduodama, upsell rinkinys
- **Menopauzės subscription** — planuojamas, prenumeratos modelis
- **Techniniai tikslai:** pakeisti ActiveCampaign (€600/mėn) ir Clickfunnels → sumažinti išlaidas iki ~150 EUR/mėn. Sukurti kursų žiūrėjimo sistemą.

Detaliau: PROJECTS.md

## Workspace failai

- SOUL.md — tapatybė ir principai
- AGENTS.md — sesijos seka, rizikos lygiai L0–L3
- USER.md — Aurimo profilis
- APPROVALS.md — kas reikalauja leidimo
- MEMORY_RULES.md — atminties taisyklės
- MEMORY.md — šis failas (ilgalaikė atmintis)
- memory/YYYY-MM-DD.md — kasdieniai įrašai

## 🔴 SVARBU — Browser naudojimas

Prieš prašant Aurimo bet ko naršyklėje — PIRMA bandyti savo `browser` tool (be `profile="chrome"`). Jis visada veikia ir prisijungęs kaip Aurimas. Chrome relay tik kai reikia jo fizinio veiksmo (pvz. kortelės įvedimas). Niekada neprašyti prisegti extension ar eiti į puslapį kol neišbandžiau pats.

## Aurimo žymė: SVARBU

Kai Aurimas rašo **SVARBU** (didžiosiomis) bet kurioje žinutės vietoje:
- Tai taisyklė, kurią privalau įsiminti ir laikytis visada
- Įrašyti į `AGENTS.md` + `MEMORY.md`
- Klaida negali kartotis

## Supabase — Naujas projektas

- Senasis `hoohazaasycjmvngouwv` — Bolt.new paskyra, nėra admin prieigos
- **Naujasis** `rdemxlosfscggwxlkfbk` — Aurimo GitHub paskyra, pilna kontrolė
- URL: `https://rdemxlosfscggwxlkfbk.supabase.co`
- Service role key ir kiti raktai: `.credentials` faile
- 8 tabeles, RLS: public read + service_role write
- 56 listings su aprašymais 6 kalbomis

## Invertino, UAB (Aurimo įmonė)

- Kodas: 305632359, PVM: LT100013444617
- Adresas: Justiniškių g. 146-27, LT-06153 Vilnius
- Tel: +370 600 87878

## visitvilnius.lt SSL

- Let's Encrypt aktyvus (visitvilnius.lt + www.visitvilnius.lt)
- Įjungta per DirectAdmin: pirma `CMD_API_DOMAIN action=modify ssl=ON`, tada UI radio "Let's Encrypt"

## 🔴 SVARBU — Finansinis limitas

Jokių projektinių išlaidų >€5/naktį be Aurimo aiškaus patvirtinimo.
Visada paklausti prieš: deployment, API subscription, serveris, bet kas mokama.
