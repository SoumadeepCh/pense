# Expense Tracker AI 🤖💰

A modern, AI-powered expense tracking application built with Next.js 14, TypeScript, and beautiful UI components. Track your income and expenses with intelligent categorization and stunning analytics..

## ✨ Features

### 🧠 AI-Powered Categorization
- **Smart Text Analysis**: Simply type "Bought groceries $50" and the AI automatically categorizes it
- **High Confidence Detection**: AI provides confidence scores and reasoning for each categorization
- **Smart Suggestions**: Get contextual suggestions based on your input patterns
- **Learning System**: Improves over time based on your transaction patterns

### 📊 Beautiful Analytics
- **Interactive Charts**: Line, bar, area, and pie charts with Recharts
- **Multiple Time Views**: Daily, weekly, monthly, and yearly analysis
- **Category Breakdown**: Detailed spending analysis by category
- **Real-time Updates**: Charts update instantly as you add transactions

### 🎨 Modern UI/UX
- **Aceternity UI Components**: Stunning animations and interactions
- **Framer Motion Animations**: Smooth page transitions and micro-interactions
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Glass Morphism**: Modern frosted glass effects with backdrop blur
- **Particle Effects**: Sparkles and background beams for visual appeal

### 💾 Data Management & Authentication
- **User Authentication**: Secure sign-up and sign-in with NextAuth.js
- **MongoDB Storage**: Persistent data storage with user isolation
- **Import/Export**: Backup and restore your data as JSON files
- **Real-time Sync**: Instant updates across all components
- **Data Validation**: Robust error handling and data integrity
- **Session Management**: Secure session handling with JWT

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - The app will connect to `mongodb://localhost:27017/expense-tracker`
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create a free MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Create a `.env.local` file in the root directory:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
     NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
     NEXTAUTH_URL=http://localhost:3000
     ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Chart library for React

### UI Components
- **shadcn/ui** - Modern React components
- **Aceternity UI** - Beautiful animated components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library

### Database & Data Management
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling for Node.js
- **Next.js API Routes** - Server-side API endpoints
- **React Hooks** - State management
- **Date-fns** - Date manipulation utilities

## 🎯 Usage Guide

### Adding Transactions

#### Method 1: AI-Powered Quick Entry
1. Click the "AI Assistant" toggle in the transaction form
2. Type natural language like:
   - "Bought groceries $45"
   - "Received freelance payment $1200"
   - "Gas for car $35"
3. The AI will automatically fill in the form fields
4. Review and submit

#### Method 2: Manual Entry
1. Click "Add Transaction"
2. Select income or expense
3. Enter amount, description, category, and date
4. Submit the transaction

### Viewing Analytics
1. Navigate to the "Analytics" tab
2. Choose your preferred time period (1 week to 1 year)
3. Select view type (daily, weekly, monthly, yearly)
4. Choose chart type (area, line, bar)
5. Explore category breakdowns and top spending areas

## 🧠 AI Categorization System

The AI system uses advanced pattern matching and keyword analysis to categorize transactions:

### Supported Categories

**Income Categories:**
- Salary, Freelance, Business, Investments
- Rental, Side Hustle, Gifts, Refunds

**Expense Categories:**
- Food & Dining, Groceries, Transportation
- Entertainment, Shopping, Health & Medical
- Bills & Utilities, Education, Travel
- Home & Garden, Personal Care, Insurance

### How It Works
1. **Text Analysis**: Extracts amounts and meaningful keywords
2. **Pattern Matching**: Matches against pre-trained keyword databases
3. **Confidence Scoring**: Provides confidence levels for each categorization
4. **Smart Suggestions**: Generates contextual suggestions for similar inputs

## 📱 Mobile Experience

The app is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Swipe gestures for navigation
- Optimized charts for small screens
- Mobile-first design approach

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Next.js and modern web technologies**
