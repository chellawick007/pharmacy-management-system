import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MonthlySalesTrend({ data, isDark }) {
  // Process sales data to aggregate by month
  const monthlySalesData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const monthlyMap = {};
    
    data.forEach(sale => {
      const date = new Date(sale.sale_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          month: monthName,
          sales: 0,
          revenue: 0
        };
      }
      
      monthlyMap[monthYear].sales += sale.quantity || 0;
      monthlyMap[monthYear].revenue += sale.total || 0;
    });
    
    // Convert to array and sort by date
    return Object.keys(monthlyMap)
      .sort()
      .map(key => monthlyMap[key]);
  }, [data]);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Monthly Sales Trend</h2>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={monthlySalesData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="month" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Revenue (₹)"
              dot={{ fill: '#3b82f6' }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Units Sold"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
