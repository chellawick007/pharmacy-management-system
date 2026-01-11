import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  Package,
  BarChart3,
  Zap,
  RefreshCw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

export default function Predictions() {
  const { isDark } = useTheme();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('chart');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictions();
      if (data.message) {
        setPredictions([]);
      } else {
        setPredictions(data);
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    if (predictions.length === 0) return { total: 0, needsReorder: 0, avgPrediction: 0 };
    
    const needsReorder = predictions.filter(p => p.predicted_demand > p.current_stock).length;
    const avgPrediction = predictions.reduce((sum, p) => sum + p.predicted_demand, 0) / predictions.length;
    
    return {
      total: predictions.length,
      needsReorder,
      avgPrediction: Math.round(avgPrediction)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-lg">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className={`space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="text-green-500" size={32} />
              Demand Predictions
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered inventory forecasting
            </p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-12 rounded-xl shadow-lg text-center`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <h2 className="text-2xl font-semibold mb-2">
            Insufficient Data for Predictions
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Please record at least 7 sales to generate AI-powered demand predictions.
          </p>
          <button
            onClick={loadPredictions}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-green-500" size={32} />
            Demand Predictions
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered inventory forecasting
          </p>
        </div>
        <button
          onClick={loadPredictions}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <RefreshCw size={20} />
          Refresh Predictions
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={<Package size={24} />}
          title="Total Predictions"
          value={stats.total}
          color="blue"
          isDark={isDark}
        />
        <StatsCard
          icon={<AlertCircle size={24} />}
          title="Needs Reorder"
          value={stats.needsReorder}
          color="orange"
          isDark={isDark}
        />
        <StatsCard
          icon={<Activity size={24} />}
          title="Avg Demand"
          value={stats.avgPrediction}
          color="green"
          isDark={isDark}
        />
      </div>

      {/* View Toggle */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-lg`}>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'chart'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={18} />
            Chart View
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeView === 'table'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity size={18} />
            Table View
          </button>
        </div>
      </div>

      {/* Chart View */}
      {activeView === 'chart' && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            7-Day Demand Forecast
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={predictions}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="medicine_name" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }}
                labelStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="predicted_demand" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorDemand)" 
                name="Predicted Demand" 
              />
              <Area 
                type="monotone" 
                dataKey="current_stock" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorStock)" 
                name="Current Stock" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table View */}
      {activeView === 'table' && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Medicine</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Current Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Predicted Demand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Difference</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {predictions.map((pred, index) => {
                  const difference = pred.predicted_demand - pred.current_stock;
                  const needsReorder = difference > 0;
                  
                  return (
                    <tr 
                      key={index}
                      className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-green-900/30' : 'bg-green-100'
                          }`}>
                            <Package className="text-green-600" size={20} />
                          </div>
                          <p className="font-semibold">{pred.medicine_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold">{pred.current_stock}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> units</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {pred.predicted_demand}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400"> units</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${
                          difference > 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {difference > 0 ? '+' : ''}{difference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {needsReorder ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1 w-fit">
                            <AlertCircle size={12} />
                            Reorder Needed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1 w-fit">
                            <CheckCircle size={12} />
                            Stock Sufficient
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {needsReorder && (
                          <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg text-sm transition-all">
                            Order {difference} units
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, title, value, color, isDark }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
