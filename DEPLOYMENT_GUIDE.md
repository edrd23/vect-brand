# Guida alla Pubblicazione Online (VECT)

Metti online il tuo sito in pochi minuti, gratuitamente e in modo professionale.

## Opzione 1: GitHub Pages (Ideale per hosting statico)

1. **Crea un account su GitHub**: Se non ne hai uno, registrati su [github.com](https://github.com).
2. **Crea un nuovo "Repository"**:
   - Clicca sul tasto **+** in alto a destra e seleziona **New repository**.
   - Dai un nome al progetto (es. `vect-website`).
   - Imposta su **Public**.
3. **Carica i file**:
   - Trascina tutti i file della cartella `vect-brand` nell'interfaccia di caricamento di GitHub.
   - Clicca su **Commit changes**.
4. **Attiva le Pages**:
   - Vai in **Settings** > **Pages**.
   - Sotto "Build and deployment", imposta la sorgente su **Deploy from a branch**.
   - Seleziona il branch `main` e la cartella `/ (root)`, poi clicca su **Save**.
5. **Fatto!**: Dopo un paio di minuti, troverai il link del tuo sito live (es. `https://tuo-nome.github.io/vect-website/`).

---

## Opzione 2: Vercel (Più veloce e moderno)

1. **Vai su Vercel**: Visita [vercel.com](https://vercel.com) e accedi (puoi usare il tuo account GitHub).
2. **Installa la CLI (Opzionale)** o usa l'interfaccia web:
   - Clicca su **Add New** > **Project**.
   - Se hai caricato il sito su GitHub, importalo direttamente cliccando su **Import**.
3. **Configurazione**:
   - Lascia tutto invariato e clicca su **Deploy**.
4. **Fatto!**: Il tuo sito sarà online in pochi secondi con un link professionale (es. `vect-website.vercel.app`).

---

## Consigli Extra
- **Dominio Personalizzato**: Entrambi i servizi permettono di aggiungere un dominio `.com` o `.it` acquistato separatamente (es. su Namecheap o Aruba).
- **HTTPS**: Entrambi includono il certificato SSL (lucchetto verde) gratuitamente.
