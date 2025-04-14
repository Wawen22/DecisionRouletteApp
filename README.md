# 🌹 Decision Roulette Potenziata

**Una app social e colorata per decidere insieme!**
Ruote della fortuna personalizzate, amici, penitenze, bonus, animazioni fighe — tutto in un'app mobile

---

## 🚀 Features
- Login/Registrazione
- Ruote personalizzate condivisibili
- Spin animato e sonoro
- Votazioni, suggerimenti e penitenze/bonus
- Cronologia spin
- Notifiche in-app (via supabase + push support)
- UI moderna e reattiva (dark/light mode)

---

## 📋 Roadmap / Task List

```md
# ✅ Task List

## 🔧 Backend (Supabase)
- [x] Setup progetto in eu-central-1
- [x] Tabelle e RLS
- [ ] Implementazione trigger email su inviti amici
- [ ] Notifiche push (Firebase + Supabase Edge)

## 💻 Frontend
- [x] Setup base progetto
- [x] Login/Signup (con recupero password)
- [x] Home + Lista ruote
- [x] Crea ruota
- [x] Spin animato
- [ ] Gestione amici
- [x] Gestione gruppi (base)
- [x] Cronologia
- [x] Penitenze/Bonus
- [x] Dark/Light mode

## 🎨 UI/UX
- [ ] Design moderno (Figma)
- [ ] Icone lucide/phosphor
- [ ] Animazioni reanimated
- [ ] Particelle spin
```

## 🧠 Introduzione e Concept

**Decision Roulette Potenziata** è un'app che trasforma l'indecisione in un gioco di gruppo. Gli utenti creano "ruote della fortuna" personalizzabili su qualsiasi tema. Le ruote possono essere condivise e modificate in gruppo, includendo funzionalità come votazioni, penitenze, bonus, e cronologia degli spin. È un'app **social, divertente e coinvolgente**.

## 🚀 Core Functionality

### 👤 Gestione Utenti
- Autenticazione: Email/Password, Google, Apple Sign-In.
- Profilo Utente: Username, Avatar, Lista Amici, Ruote Create.

### 🌠 Gestione Ruote
- Creazione: Ruota personale o condivisa con gruppo.
- Attributi: Titolo, opzioni di testo (e opzionalmente con colore).
- Modifica & Eliminazione: Opzioni editabili e ruote eliminabili.
- Visualizzazione: Proprie ruote e ruote condivise.

### 🌀 Spin della Ruota
- Animazione fluida con easing e suoni opzionali.
- Risultato visualizzato con animazioni di enfasi.

### 🩆️ Funzionalità Social
- Sistema Amici: Aggiunta/gestione tramite username o codice.
- Gruppi: Creazione e gestione gruppi amici.
- Collaborazione: Aggiunta/votazione opzioni, suggerimenti.
- Penitenze/Bonus: Opzioni speciali con effetti visivi distintivi.
- Condivisione Risultati: Share con screenshot o testo.

### 🕘 Cronologia
- Salvataggio ultimi risultati per ogni ruota (personale e condivisa).

## 🎨 UI/UX Design
- Stile visivo: Moderno, giocoso e colorato.
- Dark/Light mode.
- Animazioni: Spin fluido, effetti particellari, transizioni cool.

## 🧱️ Architettura Tecnica
- Frontend: React con React Router v7
- Backend: Supabase (Auth, Realtime DB, Storage, Policies)

---

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.
