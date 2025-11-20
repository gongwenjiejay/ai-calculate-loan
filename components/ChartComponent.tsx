
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AmortizationItem } from '../types';
import { TrendingUp, PieChart } from 'lucide-react';

interface ChartComponentProps {
  data: AmortizationItem[];
  hasWealthData: boolean;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, hasWealthData }) => {
  const [mode, setMode] = useState<'amortization' | 'wealth'>('amortization');

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500">
            {mode === 'amortization' ? '还款趋势图 (本金 vs 利息)' : '财富积累曲线 (结余预测)'}
        </h3>
        {hasWealthData && (
            <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                    onClick={() => setMode('amortization')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                        mode === 'amortization' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <PieChart className="w-3 h-3" />
                    房贷
                </button>
                <button
                    onClick={() => setMode('wealth')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                        mode === 'wealth' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <TrendingUp className="w-3 h-3" />
                    财富
                </button>
            </div>
        )}
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'amortization' ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(val) => `${Math.floor(val/12)}年`}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(val) => `${(val / 10000).toFixed(0)}万`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)}
                  labelFormatter={(label) => `第 ${Math.floor(Number(label)/12)} 年`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="剩余本金" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
                 <Area 
                  type="monotone" 
                  dataKey="totalPaid" 
                  name="累计还款" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorPrincipal)" 
                />
              </AreaChart>
          ) : (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(val) => `${Math.floor(val/12)}年`}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(val) => `${(val / 10000).toFixed(0)}万`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)}
                  labelFormatter={(label) => `第 ${Math.floor(Number(label)/12)} 年`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="wealthAccumulation" 
                  name="累计结余" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#colorWealth)" 
                />
              </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartComponent;
