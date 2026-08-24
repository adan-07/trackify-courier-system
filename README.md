# 📦 Trackify - Real-Time Courier Tracking & Management System

A modern, serverless web application designed to streamline parcel dispatching, real-time logistics tracking, and status administration without server overhead.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-brightgreen?style=for-the-badge&logo=netlify)](https://trackify-courier.netlify.app/)

---

## 🔗 Live Demo
Access the live application here:  
👉 **[trackify-courier.netlify.app](https://trackify-courier.netlify.app/)**

---

## 📌 Project Overview
Traditional logistics systems often rely on phone updates or manual calls, leading to delays and communication bottlenecks. Trackify addresses this by providing an instant, browser-based tracking portal where senders can register parcels, administrators can update status milestones live, and customers can track shipments in real time via dynamic WebSocket syncing.

---

## 🔥 Key Features

### 🌟 Standard Core Features
- **Sender Module (`send.html`):** Register parcels with sender/receiver details, parcel weight, and service type with auto-generated 8-character tracking IDs.
- **Customer Live Tracking (`index.html`):** Step-by-step visual status milestone timeline (Booked → Picked Up → In Transit → Out for Delivery → Delivered).
- **Admin Management Portal (`admin.html`):** Real-time dashboard to view all parcels, search/filter by status, and update milestone statuses in one click without page refreshes.
- **Firebase Real-Time Sync:** Instant UI updates across customer and admin views via Firestore listeners.

### 🚀 Bonus & Enhanced Features (Added Value)
- **Dynamic QR Code Generation:** Automatically generates a scannable QR code upon registration for fast parcel identification and sharing.
- **One-Click WhatsApp Sharing:** Instantly share parcel registration details and tracking updates with receivers via WhatsApp.
- **Smart Parcel Assistant (AI Chatbot):** Integrated floating AI chat assistant allowing users to query their parcel status directly through natural conversation.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (Responsive UI), Modern JavaScript (ES6+)
- **Backend & Realtime Database:** Cloud Firestore (Firebase NoSQL)
- **Deployment:** Netlify
- **Libraries/Tools:** QR Code API, WhatsApp API Integration, Webcomponents / Floating Chat Interface

---

## 🗂️ Directory Blueprint

```text
courier-tracking-system/
├── css/
│   └── style.css          # Styling for dark dashboard, tracking timeline, forms & chat UI
├── js/
│   ├── firebase-config.js # Firebase initialization & configuration
│   ├── app.js             # Customer tracking lookup, QR code, WhatsApp & Chatbot logic
│   └── admin.js           # Admin portal stream & one-click status updates
├── index.html             # Customer tracking page & Parcel Assistant
├── send.html              # Parcel registration, QR display & WhatsApp share
└── admin.html             # Real-time administrator management dashboard
