# 🛠️ Fixsy | Smart Home Maintenance & Technician Marketplace

<div align="center">

**Next-Gen On-Demand Home Services Platform Powered by AI Diagnosis, Vite, React 18 & Real-Time Geolocation**

[![Vercel Live Demo](https://img.shields.io/badge/Vercel-Live_Demo-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://fixsy-app.vercel.app/)
[![CI](https://github.com/zvinn/fixsy-app/actions/workflows/ci.yml/badge.svg)](https://github.com/zvinn/fixsy-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

</div>

---

## 📖 Overview

**Fixsy** is an intelligent, full-featured web application designed to modernize the home services industry in Egypt and the MENA region. It connects homeowners directly with vetted local technicians (plumbers, electricians, carpenters, HVAC specialists, etc.) while leveraging AI to diagnose maintenance problems before booking.

Upgraded to **Vite 7 + TypeScript 5**, featuring a 1-click **Interactive Demo Mode**, offline PWA support, bidirectional Arabic (RTL) & English, and Glassmorphic modern design.

---

## ✨ Key Features

### 🤖 1. AI Handyman Diagnosis ("الصنايعي البرنس")

- **Multimodal Analysis:** Upload a photo or describe an issue via text or voice.
- **Localized Egyptian Persona:** The AI agent analyzes faults and speaks authentic Egyptian colloquial dialect, breaking down technical issues in a relatable, friendly tone.
- **Fair Price Estimation:** Generates realistic repair cost ranges in EGP based on current market rates.
- **Safety First:** Provides immediate precautions (e.g. cutting the main valve or turning off the circuit breaker) prior to technician arrival.

### ⛅ 2. Live Weather Geolocation Advisories

- Integrated with the **Open-Meteo API** to automatically detect local weather at the user's GPS coordinates.
- Maps WMO weather codes to tailored home maintenance advisories (e.g. cleaning drain pipes before heavy rain or checking AC circuit breakers during heatwaves).

### 📍 3. Interactive Map & Technician Discovery

- Interactive maps powered by **Leaflet & React-Leaflet**.
- Filter technicians by specialty, distance, customer ratings, and pricing.

### 👥 4. Triple-Role Ecosystem

- **Client Portal:** Book on-demand or scheduled maintenance, browse job market, track order progress, apply referral coupon codes, and rate technicians.
- **Technician Portal:** Real-time incoming job alerts, job market quote submission, earnings tracking, and daily activity streaks.
- **Admin Control Center:** Live analytics powered by **Recharts**, user management, transaction auditing, and emergency alert broadcasting.

### 💡 5. Community Hub & Daily Tips

- Database of 25+ verified home maintenance lifehacks.
- Smart anti-repetition randomization algorithm using localStorage caching to ensure users receive fresh tips daily.

---

## 🛠️ Tech Stack

| Domain                    | Technologies                                                        |
| ------------------------- | ------------------------------------------------------------------- |
| **Core & Bundler**        | Vite 7, TypeScript 5, React 18, Framer Motion                       |
| **Maps & Analytics**      | React-Leaflet, Leaflet, Recharts, Canvas Confetti                   |
| **Backend & Cloud**       | Firebase Firestore, Firebase Authentication, Cloud Storage          |
| **AI / Machine Learning** | Google Generative AI (Gemini 1.5/2.0), Groq LLM API                 |
| **Weather Engine**        | Open-Meteo Geolocation Weather API                                  |
| **Styling**               | Vanilla Modern CSS, Glassmorphism, CSS Variables, RTL & LTR Support |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zvinn/fixsy-app.git
cd fixsy-app

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 👨‍💻 Author

**Mohamed Saad (zvinn)**  
Full Stack & Frontend Engineer  
GitHub: [@zvinn](https://github.com/zvinn)  
Email: [mhamed.saad.ibrahim@gmail.com](mailto:mhamed.saad.ibrahim@gmail.com)
