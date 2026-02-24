# TasteRank 🍽️🌍

![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green.svg?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg?logo=tailwind-css)

TasteRank is a collaborative web application that allows you and your friends to record, rate, and rank your travel food experiences together. Built with modern web technologies, it features AI-driven insights, tournaments, and a seamless PWA experience.

## 🚀 Live Demo

Check out the live service (populated with demo data): **[tasterank.vercel.app](https://tasterank.vercel.app)**

## ✨ Features

- **Collaborative Trips**: Create trips and invite friends to share food experiences.
- **Rate & Ranking**: Rate restaurants and view aggregated top spots for your trip.
- **Tournaments**: Pit food spots against each other in bracket-style tournaments to find the ultimate favorite.
- **AI-Powered Insights**: Get AI-generated questions and intelligent rankings using Google Generative AI.
- **Dynamic Cover Images**: Automatically fetch beautiful, relevant trip cover photos via the Unsplash API.
- **Automated Processing**: Scheduled Cron jobs keep tournaments and data fresh behind the scenes.
- **Progressive Web App (PWA)**: Installable on mobile devices for a native-like experience on the go.
- **Dark Mode Support**: Beautifully themed for both light and dark preferences.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19, App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini)
- **Media**: [Unsplash API](https://unsplash.com/developers) (Dynamic imagery)
- **Background Jobs**: [cron-job.org](https://cron-job.org/)
- **PWA**: [Serwist](https://serwist.build/)
- **Forms & Validation**: React Hook Form + Zod
- **Typography**: Plus Jakarta Sans

## 📂 Project Structure

- `src/app/` - Next.js App Router (Public & Protected routes)
- `src/components/` - Reusable UI components (auth, layout, trips, etc.)
- `src/lib/` - Utility functions, Supabase clients, and AI helpers
- `supabase/migrations/` - PostgreSQL schema migrations and RPC functions

## 🚀 Getting Started

### Prerequisites

- Node.js & pnpm (or npm/yarn/bun)
- Supabase project
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tasterank
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Duplicate the `.env.example` file and rename it to `.env.local`, then fill in your API credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   GEMINI_API_KEY=your-gemini-api-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CRON_SECRET=your-cron-secret
   UNSPLASH_ACCESS_KEY=your-unsplash-access-key
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the local result.

## 📄 License

This project is released under the [MIT License](LICENSE).
