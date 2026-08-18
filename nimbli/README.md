# Nimbli

Nimbli is een gamified revalidatie-app voor kinderen tussen 6 en 12 jaar. De applicatie helpt kinderen om kinesitherapie-oefeningen thuis correct uit te voeren en geeft kinesisten meer inzicht in de voortgang van hun patiënten.

## Live Demo

https://nimbli-five.vercel.app/

## Lokaal starten

Vereisten: Node.js 20 of nieuwer en toegang tot het bijbehorende Supabase-project.

```powershell
cd nimbli
Copy-Item .env.example .env.local
npm install
npm run dev
```

Vul in `.env.local` eerst de publieke projectgegevens in:

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=jouw-publishable-key
```

Open daarna `http://localhost:5173`. Wachtwoorden worden uitsluitend door Supabase Auth verwerkt en staan niet in de publieke databasetabellen.

## Supabase opnieuw opbouwen

De volledige database- en securityconfiguratie staat in `supabase/migrations`:

1. Voer `001_initial_schema.sql` uit in de Supabase SQL Editor.
2. Voer daarna `002_storage_policies.sql` uit.
3. Stel bij Authentication > URL Configuration de Site URL in op `http://localhost:5173` en voeg `http://localhost:5173/**` toe als Redirect URL.
4. Schakel Email Authentication in en gebruik minimaal acht tekens voor wachtwoorden.

Commit nooit `.env.local`, databasewachtwoorden of een Supabase secret/service-role key.

## Functionaliteiten

- Kinesist dashboard
- Patiëntenbeheer
- Oefeningenbibliotheek
- Oefeningen toewijzen aan patiënten
- Kindvriendelijke oefenflow
- Activatiecodes
- Video-instructies
- MediaPipe Pose Detection
- Supabase database-integratie

## Technologieën

- React
- Vite
- Supabase
- MediaPipe Pose Landmarker
- Vercel

## Auteur

Arnout Versé
Bachelorproef Digital Experience Design
Thomas More Hogeschool
