import React from 'react';
import { FileText, Package, UserPlus, BarChart3 } from 'lucide-react';

export default function QuickActions({ onAction, isDark }) {
  const actions = [
    {
      id: 'new-bill',
      icon: FileText,
      title: 'New Bill',
      description: 'Create sales transaction',
      color: 'blue',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      textLight: 'text-blue-600',
      textDark: 'dark:text-blue-400',
      borderLight: 'border-blue-200',
      borderDark: 'dark:border-blue-800'
    },
    {
      id: 'add-stock',
      icon: Package,
      title: 'Add Stock',
      description: 'Manage inventory levels',
      color: 'green',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      textLight: 'text-green-600',
      textDark: 'dark:text-green-400',
      borderLight: 'border-green-200',
      borderDark: 'dark:border-green-800'
    },
    {
      id: 'add-customer',
      icon: UserPlus,
      title: 'Add Customer',
      description: 'Register new customer',
      color: 'purple',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-900/20',
      textLight: 'text-purple-600',
      textDark: 'dark:text-purple-400',
      borderLight: 'border-purple-200',
      borderDark: 'dark:border-purple-800'
    },
    {
      id: 'view-reports',
      icon: BarChart3,
      title: 'View Reports',
      description: 'Analyze performance data',
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      textLight: 'text-orange-600',
      textDark: 'dark:text-orange-400',
      borderLight: 'border-orange-200',
      borderDark: 'dark:border-orange-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`${action.bgLight} ${action.bgDark} border ${action.borderLight} ${action.borderDark}
              rounded-lg p-4 hover:shadow-lg transition-all duration-200
              hover:scale-105 text-left group flex flex-col items-center justify-center gap-2`}
          >
            <div className={`${action.textLight} ${action.textDark}`}>
              <Icon size={24} />
            </div>

            <div className="text-center">
              <h3 className={`${action.textLight} ${action.textDark} font-semibold text-sm`}>
                {action.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {action.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
