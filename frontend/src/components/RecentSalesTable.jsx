import React from 'react';
import { Clock } from 'lucide-react';

export default function RecentSalesTable({ sales, isDark }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
        <h2 className="text-lg font-semibold">Recent Sales</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} border-b-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <th className="text-left px-4 py-3 font-semibold">Medicine</th>
              <th className="text-left px-4 py-3 font-semibold">Quantity</th>
              <th className="text-left px-4 py-3 font-semibold">Amount</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {sales.length > 0 ? (
              sales.slice(0, 10).map((sale, index) => (
                <tr 
                  key={index}
                  className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">{sale.medicine_name}</td>
                  <td className="px-4 py-3">{sale.quantity} units</td>
                  <td className="px-4 py-3">₹{sale.total?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">{new Date(sale.sale_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No sales recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
