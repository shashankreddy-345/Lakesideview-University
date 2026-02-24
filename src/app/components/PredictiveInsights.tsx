import { AlertCircle, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Resource } from "../types";
import { store } from "../store";
import { format, subDays, differenceInCalendarDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PredictiveInsights() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 6));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || '';
      try {
        const [resourcesData, bookingsResponse] = await Promise.all([
          store.getResources(),
          fetch(`${API_URL}/api/bookings?_t=${Date.now()}`)
        ]);
        
        if (bookingsResponse.ok) {
          setBookings(await bookingsResponse.json());
        }
        setResources(resourcesData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const overUtilized = resources.filter(r => r.status === 'over-utilized');
  const underUtilized = resources.filter(r => r.status === 'under-utilized');
  const optimal = resources.filter(r => r.status === 'optimal');

  const resourceMetrics = resources.map(r => ({
    name: r.name,
    utilization: r.utilization,
    capacity: r.capacity,
    type: r.type
  }));

  // Calculate utilization based on date range and bookings
  const typeStats: Record<string, { totalCapacity: number, totalBooked: number }> = {};
  
  // Initialize stats
  resources.forEach(r => {
    if (!typeStats[r.type]) {
      typeStats[r.type] = { totalCapacity: 0, totalBooked: 0 };
    }
  });

  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  const dayCount = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);

  // Calculate capacity (14 hours * 60 mins per day)
  resources.forEach(r => {
    if (typeStats[r.type]) {
      typeStats[r.type].totalCapacity += (14 * 60 * dayCount);
    }
  });

  // Calculate booked minutes
  bookings.forEach(b => {
    if (b.status === 'cancelled') return;
    if (b.date < startStr || b.date > endStr) return;
    
    const rId = typeof b.resourceId === 'object' ? b.resourceId._id : b.resourceId;
    const resource = resources.find(r => r.id === rId || r._id === rId);
    
    if (resource && typeStats[resource.type]) {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);
      typeStats[resource.type].totalBooked += duration;
    }
  });

  const typeComparison = Object.keys(typeStats).map(type => {
    const stats = typeStats[type];
    const util = stats.totalCapacity > 0 ? Math.round((stats.totalBooked / stats.totalCapacity) * 100) : 0;

    let name = type;
    if (type === 'study-room') name = 'Study Rooms';
    else if (type === 'c-lab') name = 'Computer Labs';
    else if (type === 'conf-room') name = 'Conference Rooms';
    
    return {
      type: name,
      current: util,
      capacity: 100
    };
  });


  return (
    <div className="p-6 md:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Insights</h1>
        <p className="text-muted-foreground">
          Forecasting resource optimization
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg text-red-900">Over-utilized</h3>
            </div>
            <ArrowUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl mb-2 text-red-900">{overUtilized.length}</p>
          <p className="text-sm text-red-700">Resources at critical capacity</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg text-green-900">Optimal</h3>
            </div>
            <Minus className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl mb-2 text-green-900">{optimal.length}</p>
          <p className="text-sm text-green-700">Resources at ideal capacity</p>
        </div>

        <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg text-amber-900">Under-utilized</h3>
            </div>
            <ArrowDown className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-4xl mb-2 text-amber-900">{underUtilized.length}</p>
          <p className="text-sm text-amber-700">Resources below capacity</p>
        </div>
      </div>

      {/* Detailed Resource Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">Utilization by Type</h3>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="date" 
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="type" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="current" fill="#003DA5" name="Current %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Details Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border">
        <h3 className="text-lg mb-4">All Resources - Detailed View</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Resource Name</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Building</th>
                <th className="text-left p-3">Capacity</th>
                <th className="text-left p-3">Utilization</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="p-3">{resource.name}</td>
                  <td className="p-3 capitalize">{resource.type.replace('-', ' ')}</td>
                  <td className="p-3">{resource.building}</td>
                  <td className="p-3">{resource.capacity}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            resource.status === 'over-utilized' ? 'bg-red-500' :
                            resource.status === 'under-utilized' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${resource.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm">{resource.utilization}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      resource.status === 'over-utilized' ? 'bg-red-100 text-red-700' :
                      resource.status === 'under-utilized' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {resource.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
