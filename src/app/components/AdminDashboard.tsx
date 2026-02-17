import { 
  Users, 
  Clock, 
  Star, 
  TrendingUp, 
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { Resource, Booking, Feedback } from "../types";

const COLORS = ['#003DA5', '#0066CC', '#4A90E2', '#7FB3FF', '#B8D4FF'];

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResponse, bookingsResponse, feedbackResponse] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/bookings'),
          fetch('/api/feedback')
        ]);

        const resData = await resResponse.json();
        const bookingsData = await bookingsResponse.json();
        const feedbackResData = await feedbackResponse.json();

        // Map MongoDB _id to frontend id
        const mappedResources = resData.map((r: any) => ({ ...r, id: r._id }));
        const mappedBookings = bookingsData.map((b: any) => ({ ...b, id: b._id }));
        const mappedFeedback = feedbackResData.map((f: any) => ({ ...f, id: f._id }));

        setResources(mappedResources);
        setBookings(mappedBookings);
        setFeedbackData(mappedFeedback);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate Analytics
  const totalUtilizationRate = resources.length > 0 
    ? Math.round(resources.reduce((acc, r) => acc + r.utilization, 0) / resources.length) 
    : 0;

  const studentSatisfactionScore = feedbackData.length > 0
    ? (feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length).toFixed(1)
    : "0.0";

  // Calculate Peak Hours from bookings
  const peakHoursMap = new Array(12).fill(0); // 8AM to 7PM
  bookings.forEach(b => {
    const hour = parseInt(b.startTime.split(':')[0]);
    if (hour >= 8 && hour <= 19) {
      peakHoursMap[hour - 8]++;
    }
  });
  
  const peakHoursData = peakHoursMap.map((count, i) => ({
    hour: `${i + 8}${i + 8 < 12 ? 'AM' : 'PM'}`,
    bookings: count
  }));

  // Calculate Resource Type Distribution
  const typeDist: Record<string, number> = { 'study-room': 0, 'c-lab': 0, 'conf-room': 0 };
  resources.forEach(r => {
    if (typeDist[r.type] !== undefined) {
      typeDist[r.type]++;
    }
  });
  
  const resourceTypeDistribution = [
    { name: 'Study Rooms', value: typeDist['study-room'] },
    { name: 'Computer Labs', value: typeDist['c-lab'] },
    { name: 'Conference Rooms', value: typeDist['conf-room'] },
  ];

  // Calculate Building Utilization
  const buildingMap: Record<string, { total: number, count: number }> = {};
  resources.forEach(r => {
    if (!buildingMap[r.building]) buildingMap[r.building] = { total: 0, count: 0 };
    buildingMap[r.building].total += r.utilization;
    buildingMap[r.building].count += 1;
  });

  const buildingUtilization = Object.keys(buildingMap).map(b => ({
    building: b,
    utilization: Math.round(buildingMap[b].total / buildingMap[b].count)
  }));

  // Generate Trend Data (Simulated based on current rate for visualization)
  const utilizationTrend = [
    { date: 'Mon', rate: Math.max(0, totalUtilizationRate - 5) },
    { date: 'Tue', rate: Math.max(0, totalUtilizationRate - 2) },
    { date: 'Wed', rate: Math.min(100, totalUtilizationRate + 3) },
    { date: 'Thu', rate: totalUtilizationRate },
    { date: 'Fri', rate: Math.max(0, totalUtilizationRate - 8) },
    { date: 'Sat', rate: Math.max(0, totalUtilizationRate - 15) },
    { date: 'Sun', rate: Math.max(0, totalUtilizationRate - 20) },
  ];

  if (loading) {
    return <div className="p-8 flex justify-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Analytics Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights into campus resource utilization and student engagement
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +5.2% from last week
            </span>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Total Resource Utilization Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl">{totalUtilizationRate}%</span>
            <span className="text-sm text-muted-foreground mb-1">across {resources.length} resources</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              -2 min from last week
            </span>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Average Waiting Time</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl">12</span>
            <span className="text-sm text-muted-foreground mb-1">minutes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +0.3 from last week
            </span>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Student Satisfaction Score</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl">{studentSatisfactionScore}</span>
            <span className="text-sm text-muted-foreground mb-1">out of 5.0</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Utilization Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg">Weekly Utilization Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={utilizationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#003DA5" 
                strokeWidth={2}
                dot={{ fill: '#003DA5', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg">Peak Booking Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="bookings" fill="#003DA5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <h3 className="text-lg mb-4">Resource Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={resourceTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback Monitor Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-6 h-6 text-primary" />
          <h2 className="text-2xl">Student Application Feedback</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Anonymized student reviews about the booking system (Latest {feedbackData.length} entries)
        </p>
        <div className="space-y-4">
          {feedbackData.slice(0, 5).map((feedback) => (
            <div key={feedback.id} className="border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? 'fill-primary text-primary' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {feedback.rating}.0 / 5.0
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{feedback.comment}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">Student ID: {feedback.studentId}</p>
                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}