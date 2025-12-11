# Nalin-POS-FE

Frontend (React) for **Nalin POS System** — designed to work with the Spring Boot backend and Electron desktop app.

This project contains the **React UI** for Point of Sale operations like billing, products, orders, customers, and reports. It is built as part of a full POS application and used in the Electron desktop package.

---

## 🚀 Features

- 🟦 Built with **React**  
- 📡 Connects to Spring Boot backend APIs  
- 📱 Modern responsive UI for POS functions  
- 🛠️ Can be used in development or bundled into Electron

---

## 🛠️ Setup & Run

### 1. Install dependencies

npm install

### 2. Run in development

npm start

This will start the frontend at http://localhost:3000 (React dev server).

### 3. Build for production

npm run build

The optimized build will be generated in the build/ folder, which can be used by the Electron app for packaging.

📦 Integration (Electron + Backend)
Build the React UI with npm run build

The output folder (build/) is used inside the Electron project

Make sure your Spring Boot backend is running before opening the Electron app

Electron will load the built React frontend and connect to backend APIs

📁 Tech Stack
React – UI Framework

JavaScript / JSX – Frontend logic

Axios / Fetch (optional) – API calls to backend

📄 Notes
Configure API base URLs in .env before building (e.g., REACT_APP_API_URL=http://localhost:8080/api)

You can add UI libraries like Bootstrap, Material UI, Tailwind, etc.

Extend components for products, cart, orders, user auth, reports

👨‍💻 Author
Manuth Kausilu
GitHub: https://github.com/manuthkausilu
