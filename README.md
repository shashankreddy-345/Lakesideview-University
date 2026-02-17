# Predictive Campus Resource System

A comprehensive web application designed to optimize the management and utilization of campus resources such as study rooms, computer labs, and conference rooms. The system bridges the gap between students needing spaces and administrators needing data-driven insights.

## Features

### 🎓 Student Portal
- **Resource Discovery**: Browse and filter resources by type (Study Rooms, VR Labs, etc.), location, and capacity.
- **Smart Booking**: View real-time availability and book time slots with conflict detection.
- **Dashboard**: Manage upcoming bookings, view history, and cancel reservations.
- **Feedback System**: Rate resources and provide comments after usage.
- **Favorites**: Save frequently used spaces for quick access.

### 📊 Admin Dashboard
- **Analytics Overview**: Real-time metrics on utilization rates, peak hours, and student satisfaction scores.
- **Predictive Insights**: Visualizations identifying over-utilized and under-utilized resources to aid strategic planning.
- **Feedback Monitor**: Track and analyze student sentiment and reviews.
- **Utilization Heatmaps**: Visual representation of building and resource usage trends.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Visualization**: Recharts (for analytics and trends)
- **Icons**: Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Deployment**: Configured for Vercel (Serverless) and Render

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas connection string)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Predictive Campus Resource System"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with your database credentials:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-system
   PORT=5000
   ```

4. **Seed the Database**
   Initialize the database with default resources and users:
   ```bash
   node src/app/components/seed.js
   ```

5. **Run the Application**
   
   Start the backend server:
   ```bash
   node index.js
   ```

   In a separate terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

### Demo Login
The login page includes quick-access buttons for demonstration purposes:

- **Admin Access**: `sophia.young10@lakeside.edu` (Sophia Young)
- **Student Access**: `noah.jackson11@lakeside.edu` (Noah Jackson)

## Deployment

### Vercel (Recommended)
The project includes a `vercel.json` configuration to run the Express backend as serverless functions.
1. Push code to GitHub.
2. Import the project into Vercel.
3. Add the `MONGODB_URI` environment variable in Vercel settings.
4. Deploy.

### Render / Traditional Hosting
The `index.js` is configured to serve static frontend files in production.
1. Build the frontend: `npm run build`
2. Set `NODE_ENV=production`.
3. Start the server: `node index.js`.

## License
MIT