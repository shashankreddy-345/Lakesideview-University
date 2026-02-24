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
import { store } from "../store";
import { format, addDays, subDays, eachDayOfInterval } from "date-fns";

const COLORS = ['#003DA5', '#0066CC', '#4A90E2', '#7FB3FF', '#B8D4FF'];

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [waitlistData, setWaitlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendStartDate, setTrendStartDate] = useState(subDays(new Date(), 6));
  const [trendEndDate, setTrendEndDate] = useState(new Date());
  const [peakStartDate, setPeakStartDate] = useState(subDays(new Date(), 6));
  const [peakEndDate, setPeakEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || '';
      try {
        const [resourcesData, bookingsResponse, feedbackResponse, waitlistResponse] = await Promise.all([
          store.getResources(),
          fetch(`${API_URL}/api/bookings?_t=${Date.now()}`),
          fetch(`${API_URL}/api/feedback?_t=${Date.now()}`),
          fetch(`${API_URL}/api/waitlist?_t=${Date.now()}`)
        ]);

        const bookingsData = await bookingsResponse.json();
        const feedbackResData = await feedbackResponse.json();
        const waitlistResData = await waitlistResponse.json();

        // Map MongoDB _id to frontend id
        const mappedBookings = bookingsData.map((b: any) => ({ ...b, id: b._id }));
        const mappedFeedback = feedbackResData.map((f: any) => ({ ...f, id: f._id }));

        setResources(resourcesData);
        setBookings(mappedBookings);
        setFeedbackData(mappedFeedback);
        setWaitlistData(waitlistResData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate Analytics
  const today = format(new Date(), 'yyyy-MM-dd');
  const totalUtilizationRate = resources.length > 0 
    ? Math.round(resources.reduce((acc, r) => acc + r.utilization, 0) / resources.length) 
    : 0;

  const studentSatisfactionScore = feedbackData.length > 0
    ? (feedbackData.reduce((acc, f) => acc + f.rating, 0) / feedbackData.length).toFixed(1)
    : "0.0";

  const allocatedToday = waitlistData.filter((w: any) => w.status === 'allocated' && w.date === today);
  const avgWaitingTime = allocatedToday.length > 0
    ? Math.round(
        allocatedToday.reduce((acc: number, w: any) => {
            const [startH, startM] = w.startTime.split(':').map(Number);
            const [endH, endM] = w.endTime.split(':').map(Number);
            return acc + ((endH * 60 + endM) - (startH * 60 + startM));
          }, 0) / allocatedToday.length
      )
    : 0;

  // Calculate Peak Hours from bookings
  const peakHoursMap = new Array(14).fill(0); // 8AM to 10PM
  bookings.forEach(b => {
    if (b.status === 'cancelled') return;
    
    const startStr = format(peakStartDate, 'yyyy-MM-dd');
    const endStr = format(peakEndDate, 'yyyy-MM-dd');
    if (b.date < startStr || b.date > endStr) return;
    
    const [startH, startM] = b.startTime.split(':').map(Number);
    const [endH, endM] = b.endTime.split(':').map(Number);
    const start = startH + startM / 60;
    const end = endH + endM / 60;

    for (let i = 0; i < 14; i++) {
      const slotStart = 8 + i;
      const slotEnd = slotStart + 1;
      if (start < slotEnd && end > slotStart) {
        peakHoursMap[i]++;
      }
    }
  });
  
  const peakHoursData = peakHoursMap.map((count, i) => {
    const h = i + 8;
    const hour12 = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return {
      hour: `${hour12}${ampm}`,
      bookings: count
    };
  });

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

  // Calculate Utilization Trend based on actual bookings
  let utilizationTrend: any[] = [];
  try {
    utilizationTrend = eachDayOfInterval({ start: trendStartDate, end: trendEndDate }).map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    let dailyUtilization = 0;
    if (resources.length > 0) {
      const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
      const bookedMinutes = dayBookings.reduce((acc, b) => {
        const [startH, startM] = b.startTime.split(':').map(Number);
        const [endH, endM] = b.endTime.split(':').map(Number);
        return acc + ((endH * 60 + endM) - (startH * 60 + startM));
      }, 0);
      
      // Capacity: resources * 14 hours (8am-10pm) * 60 mins
      const totalCapacityMinutes = resources.length * 14 * 60;
      dailyUtilization = totalCapacityMinutes > 0 ? Math.round((bookedMinutes / totalCapacityMinutes) * 100) : 0;
    }

    return {
      date: format(date, 'EEE'),
      fullDate: dateStr,
      rate: dailyUtilization
    };
  });
  } catch (e) {
    // Handle invalid interval (start > end)
    utilizationTrend = [];
  }

  if (loading) {
    return <div className="p-8 flex justify-center text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Analytics Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights into campus resource utilization and student Feedback
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
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
              <Star className="w-6 h-6 text-primary" />
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Utilization Trend</h3>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={format(trendStartDate, 'yyyy-MM-dd')}
                onChange={(e) => setTrendStartDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="date" 
                value={format(trendEndDate, 'yyyy-MM-dd')}
                onChange={(e) => setTrendEndDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg">Peak Booking Hours</h3>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={format(peakStartDate, 'yyyy-MM-dd')}
                onChange={(e) => setPeakStartDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="date" 
                value={format(peakEndDate, 'yyyy-MM-dd')}
                onChange={(e) => setPeakEndDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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