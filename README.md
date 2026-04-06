# 🗺️ MoneyMap - Financial Intelligence & Tracking

A professional-grade MERN stack financial management application with real-time budget tracking, advanced visual analytics, and bank-grade security features.

![MoneyMap Logo](./frontend/src/assets/moneymap_logo.png)

## 🚀 Key Features

*   **📊 Dynamic Dashboard**: Real-time visualization of Income vs. Expense ratios and automated financial insights.
*   **💳 Smart Budgeting**: Set category-specific limits (Weekly/Monthly/Yearly) with live progress tracking and over-budget alerts.
*   **🎯 Savings Goals**: Interactive goal tracking to visualize your financial future.
*   **📂 Multi-format Export**: Export your financial data to Excel (.xlsx) and CSV for external accounting.
*   **🛡️ Security First**:
    *   JWT-based Authentication.
    *   Custom rate-limiting middleware (to protect against brute-force).
    *   Input validation and error handling for all API endpoints.
*   **📱 Fully Responsive**: Premium mobile-first design with animated navigation and glassmorphic UI.

## 🛠️ Tech Stack

*   **Frontend**: React (Context API), Tailwind CSS, Recharts, Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Testing**: Jest, Supertest.

## ⚙️ Getting Started

### Prerequisites
*   Node.js v16+
*   MongoDB installed locally or a MongoDB Atlas URI.

### Installation

1. Clone the repository
2. Install dependencies for both folders:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET_KEY=your_secure_secret
   ```

4. Run the Application:
   ```bash
   # In backend/
   npm run dev
   
   # In frontend/
   npm run dev
   ```

## 🧪 Testing

Run automated backend API tests:
```bash
cd backend
npm test
```

---

## 📈 Future Roadmap
- [ ] Email notifications for budget limits.
- [ ] Multi-currency support.
- [ ] Bank API integration (Plaid/Salt Edge).

---

*Contact: your.email@example.com*
