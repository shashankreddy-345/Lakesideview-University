import { AlertCircle, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Resource } from "../types";
import { store } from "../store";
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

  useEffect(() => {
    store.getResources()
      .then(data => {
        setResources(data);
      })
      .catch(err => console.error("Failed to fetch resources", err));
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

  // Calculate dynamic type comparison based on actual resources
  const typeStats: Record<string, { totalUtil: number, count: number }> = {};
  resources.forEach(r => {
    if (!typeStats[r.type]) {
      typeStats[r.type] = { totalUtil: 0, count: 0 };
    }
    typeStats[r.type].totalUtil += r.utilization;
    typeStats[r.type].count += 1;
  });

  const typeComparison = Object.keys(typeStats).map(type => {
    const avgUtil = Math.round(typeStats[type].totalUtil / typeStats[type].count);
    let name = type;
    if (type === 'study-room') name = 'Study Rooms';
    else if (type === 'c-lab') name = 'Computer Labs';
    else if (type === 'conf-room') name = 'Conference Rooms';
    
    return {
      type: name,
      current: avgUtil,
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
          <h3 className="text-lg mb-4">Current Utilization</h3>
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
