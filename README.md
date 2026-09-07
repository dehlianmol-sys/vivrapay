# HK Wallet

ACT AS A SENIOR EXPERT FULL-STACK DEVELOPER. 



PROJECT GOAL: 

This project contains the HK Wallet application.



PHASE 1: EXTRACTION & UI PRESERVATION (STRICT RULE)

1. Use the existing HK Wallet codebase.

2. Use this extracted code purely as the ABSOLUTE REFERENCE for the Frontend (UI/UX, Tailwind styling, Component structure, Routing). 

3. DO NOT change the design, colors, or layout. Keep the exact same UI. Your job is to wire up the backend logic cleanly, not to redesign the app.



PHASE 2: NEW DATABASE & BACKEND SETUP

We are using a brand new Supabase project. 

1. Ignore any old connection errors. Set up a clean `supabase.ts` client.

2. STOP and ask me for my NEW `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before you proceed, so we don't get the "White Screen of Death" caused by missing env variables.

3. Write a complete SQL Schema for my new database (including Users, Transactions, and an `app_settings` table) and provide it to me so I can run it in my new Supabase dashboard.



PHASE 3: INTEGRATE THESE TWO SPECIFIC FEATURES

While wiring up the clean logic, ensure these two features are implemented correctly:

- TASK 1 (Dynamic Rewards): Admin Panel must have inputs for "Newbie Required Order Amount" and "Newbie Reward Amount" connected to the `app_settings` table. The User UI (Reward/Mine/Register pages) must fetch and display these dynamic values instead of hardcoded numbers.

- TASK 2 (Masked Referral Link): The Team page displays and copies the configured HK Wallet referral link.



PHASE 4: EXECUTION

Do not hallucinate. Tell me when extraction is done, give me the SQL code to run in my new Supabase project, and ask me for my new API keys to connect the app securely.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8673223-07be-4de8-9d1d-496ff04e4af2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
