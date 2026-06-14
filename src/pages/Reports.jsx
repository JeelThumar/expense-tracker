import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';
import { DateFilter } from '../components/DateFilter.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isSameDay, isValid } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Calendar as CalendarIcon, Info } from 'lucide-react';
import { IoChevronDown } from 'react-icons/io5';

const COLORS = ['#ffffff', '#a0a0a0', '#6e6e6e', '#34c759', '#ff9f0a', '#007aff', '#ff3b30'];

export const Reports = () => {
  const { transactions } = useAppContext();
  const [dateFilter, setDateFilter] = useState({ type: 'month', value: format(new Date(), 'yyyy-MM') });
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'vehicle'

  // Filter transactions based on date
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = parseISO(t.date);
      if (!isValid(tDate)) return false;
      
      // Date filter
      let dateMatch = true;
      if (dateFilter.type === 'month') {
        const start = startOfMonth(parseISO(dateFilter.value + '-01'));
        const end = endOfMonth(start);
        dateMatch = isWithinInterval(tDate, { start, end });
      } else if (dateFilter.type === 'year') {
        const start = startOfYear(parseISO(dateFilter.value + '-01-01'));
        const end = endOfYear(start);
        dateMatch = isWithinInterval(tDate, { start, end });
      } else if (dateFilter.type === 'range') {
        dateMatch = isWithinInterval(tDate, { 
          start: parseISO(dateFilter.start), 
          end: parseISO(dateFilter.end) 
        });
      }

      return dateMatch;
    });
  }, [transactions, dateFilter]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const income = filteredTransactions.filter(t => t.type === 'income');
    
    const totalExpense = expenses.reduce((acc, curr) => {
      const people = curr.withWhom ? curr.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
      const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
      const userShare = curr.withWhom ? (curr.includeMe !== false ? curr.amount / numPeople : 0) : curr.amount;
      return acc + userShare;
    }, 0);
    
    const totalIncome = income.reduce((acc, curr) => {
      const people = curr.withWhom ? curr.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
      const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
      const userShare = curr.withWhom ? (curr.includeMe !== false ? curr.amount / numPeople : 0) : curr.amount;
      return acc + userShare;
    }, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Daily average
    let daysCount = 1;
    if (dateFilter.type === 'month') daysCount = 30;
    else if (dateFilter.type === 'year') daysCount = 365;
    else if (dateFilter.type === 'range') {
      const start = parseISO(dateFilter.start);
      const end = parseISO(dateFilter.end);
      daysCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }
    const dailyAvg = totalExpense / daysCount;

    return { totalExpense, totalIncome, balance, dailyAvg };
  }, [filteredTransactions, dateFilter]);

  // Category Data
  const categoryData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const categoryMap = {};
    expenses.forEach(t => {
      const people = t.withWhom ? t.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
      const numPeople = t.numberOfPeople || (people.length + (t.includeMe !== false ? 1 : 0)) || 1;
      const userShare = t.withWhom ? (t.includeMe !== false ? t.amount / numPeople : 0) : t.amount;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + userShare;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Trend Data
  const trendData = useMemo(() => {
    // Group by date
    const dateMap = {};
    filteredTransactions.forEach(t => {
      const dateKey = format(parseISO(t.date), 'MMM dd');
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey, expense: 0, income: 0 };
      
      const people = t.withWhom ? t.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
      const numPeople = t.numberOfPeople || (people.length + (t.includeMe !== false ? 1 : 0)) || 1;
      const userShare = t.withWhom ? (t.includeMe !== false ? t.amount / numPeople : 0) : t.amount;

      if (t.type === 'expense') dateMap[dateKey].expense += userShare;
      else dateMap[dateKey].income += userShare;
    });
    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredTransactions]);
  


  return (
    <div style={{ padding: '20px 20px 24px', paddingBottom: '100px' }}>
      
      {/* Unified Header: No-wrap container to prevent UI breaking */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        width: '100%',
        flexWrap: 'nowrap',
        gap: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          flexShrink: 1,
          overflow: 'hidden'
        }}>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ 
              background: activeTab === 'general' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'general' ? 'var(--bg-main)' : 'var(--text-secondary)',
              border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            GENERAL
          </button>
          <button 
            onClick={() => setActiveTab('vehicle')}
            style={{ 
              background: activeTab === 'vehicle' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'vehicle' ? 'var(--bg-main)' : 'var(--text-secondary)',
              border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
          >
            VEHICLE
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DateFilter filter={dateFilter} setFilter={setDateFilter} />
        </div>
      </div>

      {activeTab === 'general' ? (
        <div className="animate-slide-up">
          {/* Main Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <Wallet size={16} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Cash Flow</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: metrics.balance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                ₹{metrics.balance.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.6 }}>Net balance for period</div>
            </Card>
            <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Burn</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>
                ₹{Math.round(metrics.dailyAvg).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.6 }}>Avg. daily expense</div>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Category Distribution</h3>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
              {categoryData.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Spending Trend */}
          <Card style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Spending Trend</h3>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="expense" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <div className="animate-slide-up">
          <VehicleInsights transactions={filteredTransactions} />
        </div>
      )}
    </div>
  );
};

const VehicleInsights = ({ transactions }) => {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  
  const vehicleTxns = useMemo(() => {
    return transactions
      .filter(t => t.isVehicle && (t.category?.toLowerCase().includes('fuel') || t.litres > 0))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const stats = useMemo(() => {
    // Sort ascending for chronological calculation
    const sortedAsc = [...vehicleTxns]
      .filter(t => t.category?.toLowerCase().includes('fuel') || t.litres > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalCost = vehicleTxns.reduce((acc, t) => {
      const people = t.withWhom ? t.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
      const numPeople = t.numberOfPeople || (people.length + (t.includeMe !== false ? 1 : 0)) || 1;
      const userShare = t.withWhom ? (t.includeMe !== false ? t.amount / numPeople : 0) : t.amount;
      return acc + userShare;
    }, 0);

    const totalFuel = vehicleTxns.reduce((acc, t) => acc + (t.litres || 0), 0);

    const odometers = sortedAsc.map(t => t.odometer).filter(o => o !== null && o !== undefined);
    let distance = 0;
    if (odometers.length >= 2) {
      distance = Math.max(0, Math.max(...odometers) - Math.min(...odometers));
    }

    // Averages calculation:
    // Need at least 2 logs with odometer values to compute efficiency
    const validFuelLogs = sortedAsc.filter(t => t.odometer !== null && t.odometer !== undefined && t.litres > 0);

    let lastEfficiency = null;
    let overallEfficiency = null;
    let lastDistance = 0;
    let lastLitres = 0;

    if (validFuelLogs.length >= 2) {
      // 1. Last refueling average (mileage from the second to last fill-up to the last one)
      const lastLog = validFuelLogs[validFuelLogs.length - 1];
      const prevLog = validFuelLogs[validFuelLogs.length - 2];
      lastDistance = lastLog.odometer - prevLog.odometer;
      lastLitres = lastLog.litres;
      if (lastDistance > 0 && lastLitres > 0) {
        lastEfficiency = (lastDistance / lastLitres).toFixed(2);
      }

      // 2. Full average mileage (total distance from first to last / total litres filled excluding first log)
      const firstLog = validFuelLogs[0];
      const overallDist = lastLog.odometer - firstLog.odometer;
      const overallLitres = validFuelLogs.slice(1).reduce((acc, t) => acc + (t.litres || 0), 0);
      if (overallDist > 0 && overallLitres > 0) {
        overallEfficiency = (overallDist / overallLitres).toFixed(2);
      }
    }

    return { totalFuel, totalCost, distance, lastEfficiency, overallEfficiency, lastDistance, lastLitres };
  }, [vehicleTxns]);

  if (!stats || vehicleTxns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚜</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No Vehicle Data</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Log expenses with 'Vehicle Tracking' enabled to see insights here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Distance</div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>{stats.distance.toLocaleString()} <span style={{ fontSize: '12px', opacity: 0.5 }}>{settings.distanceUnit}</span></div>
        </Card>
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Fuel Used</div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>{stats.totalFuel.toLocaleString()} <span style={{ fontSize: '12px', opacity: 0.5 }}>{settings.fuelUnit}s</span></div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Last Refueling Mileage Card */}
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Last Mileage</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-success)', letterSpacing: '-1px' }}>
            {stats.lastEfficiency ? `${stats.lastEfficiency}` : '--'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: '600' }}>
            {stats.lastEfficiency 
              ? `${stats.lastDistance} ${settings.distanceUnit} / ${stats.lastLitres} ${settings.fuelUnit}` 
              : 'Need 2+ fuel logs'}
          </div>
        </Card>

        {/* Full Average Mileage Card */}
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Full Average</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-success)', letterSpacing: '-1px' }}>
            {stats.overallEfficiency ? `${stats.overallEfficiency}` : '--'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px', fontWeight: '600' }}>
            {stats.overallEfficiency 
              ? 'Lifetime mileage' 
              : 'Need 2+ fuel logs'}
          </div>
        </Card>
      </div>

      <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '700' }}>Total Vehicle Spends</span>
          <span style={{ fontSize: '18px', fontWeight: '800' }}>₹{stats.totalCost.toLocaleString()}</span>
        </div>
      </Card>

      {/* Recent Vehicle Spends Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Vehicle Spends</h3>
        {vehicleTxns.length > 3 && (
          <button 
            onClick={() => navigate('/vehicle-expenses')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              fontSize: '13px', 
              color: 'var(--text-secondary)', 
              fontWeight: '600', 
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            View More
          </button>
        )}
      </div>

      {/* Spends List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
        {vehicleTxns.slice(0, 3).map((txn, index) => {
          const people = txn.withWhom ? txn.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
          const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
          const displayShare = txn.withWhom ? (txn.includeMe !== false ? txn.amount / numPeople : 0) : txn.amount;

          return (
            <div 
              key={txn.id} 
              onClick={() => navigate(`/transaction/${txn.id}`)}
              className="animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.03)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
                }}>
                  ⛽
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '15px', 
                    marginBottom: '2px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px'
                  }}>
                    {txn.category}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {format(new Date(txn.date), 'MMM dd, yyyy')}
                    {txn.litres && ` · ${txn.litres} ${settings.fuelUnit}s`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: '17px', 
                  color: 'var(--text-primary)' 
                }}>
                  -₹{displayShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                {txn.withWhom && (
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Split with {txn.withWhom}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
