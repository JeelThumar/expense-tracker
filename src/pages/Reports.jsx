import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#ffffff', '#a0a0a0', '#6e6e6e', '#34c759', '#ff9f0a', '#007aff', '#ff3b30'];

export const Reports = () => {
  const { transactions } = useAppContext();

  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Total Expenses</h3>
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>₹{totalExpense.toFixed(2)}</h2>
      </Card>

      {expenseData.length > 0 ? (
        <Card style={{ height: '400px', padding: '20px 0' }}>
          <h3 style={{ fontSize: '16px', marginLeft: '20px', marginBottom: '20px', color: 'var(--text-secondary)' }}>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: 'var(--bg-card-elevated)', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <p className="text-secondary" style={{ textAlign: 'center', marginTop: '40px' }}>No expenses to report.</p>
      )}
    </div>
  );
};
