# BudgetAI - Smart Budget Planner & Locker

BudgetAI is a web application designed to help users take control of their personal finances through intelligent budget planning and automated time-locked savings. Instead of just tracking expenses, this app forces financial discipline by physically "locking" allocated funds until user-defined withdrawal dates.

## Key Features

- **AI Budget Optimization**: Submit a rough draft of your monthly income and planned expenses, and the built in AI  will analyze and return a balanced, recommended plan.
- **Time-Locked Vaults**: Users can map specific withdrawal dates to approved budget categories. Funds are "locked" and cannot be withdrawn until the cron job releases them on the scheduled date.
- **Multiple Budget Plans**: Support for running multiple concurrent budget plans with separate lock schedules.
- **Transaction Auditing**: Full ledger tracking deposits, withdrawals, and locked assets.
- **Dashboard Overview**: A central hub showing total allocated, currently locked and available (released) balances.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Groq API
- **Task Scheduling**: `node-cron` for automated midnight fund releases
- **Authentication**: JWT & bcryptjs

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas connection string
- A groq API Key

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nolstan/AI-ASSISTANT-MONTHLY-BUDGET-PLANNER.git
   cd AI-ASSISTANT-MONTHLY-BUDGET-PLANNER
   ```

2. **Install backend dependencies**
   Navigate to the server directory and install packages:
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file inside the `server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/budgetai or your Atlas URI
   JWT_SECRET=your_jwt_secret_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`. The automated cron job for releasing locked funds runs nightly at midnight.

5. **Run the frontend**
   The frontend is purely static HTML/JS/CSS. You can serve it using any local server (e.g., Live Server extension in VS Code, or `python -m http.server`) directly from the `client` folder.
   ```bash
   cd ../client
   # Example using Python:
   python3 -m http.server 3000
   ```
   Navigate to `http://localhost:3000` to view the app.

## Project Workflow

1. **Create Budget**: User inputs their total monthly income and a list of expected expenses.
2. **AI Review**: The backend sends the draft to Groq API, which returns a structured JSON recommendation ensuring the math balances perfectly.
3. **Approval**: User reviews the AIs suggestions, makes manual tweaks if necessary and approves the final plan.
4. **Schedule & Lock**: User assigns a withdrawal date to every category in the plan. The budget is then converted into a `LockedBudget` document.
5. **Release & Withdraw**: The background cron job unlocks money on the specified dates. Users can then withdraw the available funds, which gets logged in the transaction history.