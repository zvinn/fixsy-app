# 🛠️ Fixsy | Smart Home Maintenance & Technician Marketplace

<div align="center">

**Next-Gen On-Demand Home Services Platform Powered by AI Diagnosis & Real-Time Geolocation**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![GSAP](https://img.shields.io/badge/GSAP_Animations-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/)

</div>

---

## 📖 Overview

**Fixsy** is an intelligent, full-featured web application designed to modernize the home services industry in Egypt and the MENA region. It connects homeowners directly with vetted local technicians (plumbers, electricians, carpenters, HVAC specialists, etc.) while leveraging AI to diagnose maintenance problems before booking.

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
- **Client Portal:** Book on-demand or scheduled maintenance, track order progress, apply referral coupon codes, and rate technicians.
- **Technician Portal:** Real-time incoming job alerts, earnings tracking, and daily activity streaks.
- **Admin Control Center:** Live analytics powered by **Recharts**, user management, transaction auditing, and emergency alert broadcasting.

### 💡 5. Community Hub & Daily Tips
- Database of 25+ verified home maintenance lifehacks.
- Smart anti-repetition randomization algorithm using localStorage caching to ensure users receive fresh tips daily.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, React-Leaflet, Leaflet, GSAP, Recharts, Lucide Icons, Canvas Confetti |
| **Backend & Cloud** | Firebase Firestore, Firebase Authentication, Cloud Storage, Hosting |
| **AI / Machine Learning** | Google Generative AI (Gemini 1.5/2.0), Groq LLM API |
| **Weather Engine** | Open-Meteo Geolocation Weather API |
| **Styling** | Vanilla Modern CSS, Glassmorphism, CSS Variables |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   `ash
   git clone https://github.com/zvinn/fixsy-app.git
   cd fixsy-app
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Start the development server:
   `ash
   npm start
   `
   The app will open automatically at [http://localhost:3000](http://localhost:3000).

---

## 👨‍💻 Author

**Mohamed Saad (zvinn)**  
Full Stack & Frontend Engineer  
GitHub: [@zvinn](https://github.com/zvinn)  
Email: [mhamed.saad.ibrahim@gmail.com](mailto:mhamed.saad.ibrahim@gmail.com)