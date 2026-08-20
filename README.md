# Nimbli

Nimbli is een gamified revalidatieplatform voor kinderen van 6 tot 12 jaar. Kinderen voeren thuis oefeningen uit met posefeedback, terwijl hun kinesist en ouder de planning en voortgang kunnen opvolgen.

## Live demo

https://nimbli-five.vercel.app/

## Lokaal starten

Vereisten: Node.js 20 of nieuwer en toegang tot het bijbehorende Supabase-project.

```powershell
cd nimbli
Copy-Item .env.example .env.local
npm install
npm run dev
```

Vul in `.env.local` de publieke projectgegevens in:

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=jouw-publishable-key
```

Open vervolgens `http://localhost:5173`. Wachtwoorden worden uitsluitend door Supabase Auth verwerkt en staan niet in publieke databasetabellen.

## Supabase opnieuw opbouwen

Gebruik hiervoor een leeg Supabase-project en voer deze bestanden in volgorde uit via de SQL Editor:

1. `nimbli/supabase/migrations/001_initial_schema.sql`
2. `nimbli/supabase/migrations/002_storage_policies.sql`

Stel daarna bij **Authentication > URL Configuration** de Site URL in op `http://localhost:5173` en voeg `http://localhost:5173/**` als Redirect URL toe. Schakel Email Authentication in en stel een minimale wachtwoordlengte van acht tekens in.

Commit nooit `.env.local`, databasewachtwoorden of een Supabase secret/service-role key.

## Belangrijkste functionaliteiten

- Beveiligde login en registratie met Supabase Auth
- Kinesist-, ouder- en kinderportaal
- Patiënten- en oefeningenbeheer
- Oefenplanning en activatiecodes
- Video-instructies en MediaPipe-posefeedback
- Sessieresultaten, voortgang, XP en dagmissies

## Technologieën

- React en Vite
- Supabase
- MediaPipe Pose Landmarker
- Vercel

## Auteur

Arnout Versé

Bachelorproef Digital Experience Design

Thomas More Hogeschool
