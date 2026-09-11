# 🗺️ Fixsy Engineering Roadmap (2026 - 2027)

This roadmap outlines the planned technical milestones, architecture evolution, and feature releases for the **Fixsy** On-Demand Home Services & Technician Marketplace platform.

---

## 🎯 Phase 1: Core Foundation & Modernization (Completed ✅)
- [x] **Vite 7 Migration:** Sub-50ms HMR and optimized production chunk splitting.
- [x] **TypeScript 5 Strict Typing:** End-to-end type safety across API services and UI state.
- [x] **Triple-Role Isolated Ecosystem:** Independent workflows for Clients, Technicians, and Admins.
- [x] **Multimodal AI Handyman:** Real-time fault diagnosis in authentic Egyptian colloquial dialect using Google Gemini & Groq Llama-3.
- [x] **Open-Meteo Weather Geolocation:** Proactive maintenance advisories based on local GPS meteorological data.
- [x] **PWA Offline Support:** Installable web application with Workbox service worker asset caching.
- [x] **Vercel Cloud Deployment:** Pre-configured SPA rewrites and edge caching via `vercel.json`.

---

## 🚀 Phase 2: Real-Time Communication & Live Dispatch (Q4 2026 - In Progress 🔄)
- [ ] **Real-Time GPS Tracking:** Live Leaflet marker movement displaying technician en route to the client's residence.
- [ ] **Socket / Firebase Push Channel:** Sub-second instant notifications for job requests and bids.
- [ ] **In-App Encrypted Audio/Voice Notes:** Voice messaging between client and technician directly within `ChatWindow.tsx`.
- [ ] **Smart Auto-Assignment Engine:** Geofenced dispatch algorithm allocating emergency jobs to the closest available technician within a 5km radius.

---

## 💳 Phase 3: Regional Payment Gateways & Escrow (Q1 2027 📅)
- [ ] **MENA Payment Gateways:** Direct integration with Paymob, Fawry, and Vodafone Cash alongside Stripe and PayPal.
- [ ] **Escrow Protection:** Client funds held securely in escrow until maintenance job completion is verified via OTP code.
- [ ] **Automated Technician Payouts:** Weekly automated bank and mobile wallet payouts for verified technicians.
- [ ] **Multi-Currency Engine:** Automatic currency conversion across EGP, SAR, AED, and USD.

---

## 🤖 Phase 4: Advanced AI & Smart Home IoT (Q2 2027 📅)
- [ ] **Voice-Activated AI Assistant:** Hands-free conversational diagnosis using Web Speech API.
- [ ] **Predictive Maintenance Alerts:** Sensor and historical data analysis predicting HVAC filter replacements and plumbing checks.
- [ ] **Technician Verification AI:** Automated national ID and trade license OCR verification.

---

*Contributions, architectural feedback, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.*
