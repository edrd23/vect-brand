# Checklist test locale — VECT Sito Web

Esegui con `npx serve VECT-Sito-Web` o aprendo `index.html` via server locale (non `file://` per Turnstile).

## Navigazione
- [ ] Link menu: Servizi, Spectera, Radar, Chi siamo, FAQ, Contatti
- [ ] Footer: stessi anchor + Privacy
- [ ] Mobile: hamburger chiude al tap link

## Spectera
- [ ] Immagine hero visibile
- [ ] Thumbnail cambiano immagine principale
- [ ] Testo IT/EN ok

## Form
- [ ] Submit disabilitato senza privacy + Turnstile
- [ ] Invio ok con entrambi
- [ ] Dopo reset: submit di nuovo disabilitato

## Cookie
- [ ] Banner: Solo necessari / Accetta statistiche
- [ ] Preferenze cookie nel footer riapre banner

## Documenti (dopo deploy)
- [ ] `/documenti/VECT_WhitePaper.html` → 200
- [ ] `/documenti/VECT_CRM_Contatti_Strategici.html` → 404

## SEO
- [ ] `sitemap.xml` valido (4 URL)
- [ ] Condivisione social: solo `og:image` (no video 404)
