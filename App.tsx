
import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, MapPin, Home, DollarSign, AlertCircle, Loader2, ChevronDown, ChevronUp, RefreshCw, HelpCircle, Wallet, Coins, Coffee } from 'lucide-react';
import { fetchMortgageAssumptions } from './services/geminiService';
import { calculateMortgage, formatCurrency } from './utils/finance';
import { CalculationResult, LoadingState, UserInput, AIMortgageParams } from './types';
import ChartComponent from './components/ChartComponent';
import { CITY_DATA } from './utils/constants';

const App: React.FC = () => {
  const [input, setInput] = useState<UserInput>({
    city: '上海',
    price: 3000000,
    isFirstHome: true,
    annualSalary: 0,
    downPaymentRatio: 0.3 // Default 30%
  });

  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [editableParams, setEditableParams] = useState<AIMortgageParams | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handler for calculating mortgage based on params
  // Note: We pass input.downPaymentRatio explicitly as the master source for ratio
  const performCalculation = useCallback((params: AIMortgageParams) => {
    const res = calculateMortgage(input.price, input.downPaymentRatio, params);
    setResult(res);
  }, [input.price, input.downPaymentRatio]);

  // Handler for AI fetch
  const handleCalculate = async () => {
    if (!input.city || !input.price) return;
    
    setLoadingState(LoadingState.LOADING);
    setResult(null);
    setEditableParams(null);

    try {
      const aiParams = await fetchMortgageAssumptions(input);
      setEditableParams(aiParams);
      performCalculation(aiParams);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Recalculate when editable params OR input down payment ratio change
  useEffect(() => {
    if (editableParams) {
      performCalculation(editableParams);
    }
  }, [editableParams, performCalculation, input.downPaymentRatio]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI 智能房贷计算器</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
            <span>Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-500" />
                房产与收入信息
              </h2>
              
              <div className="space-y-5">
                {/* City Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所在城市</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={input.city}
                      onChange={(e) => setInput({ ...input, city: e.target.value })}
                      className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800 appearance-none bg-white"
                    >
                        {CITY_DATA.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                                {group.cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">房屋总价 (元)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={input.price}
                      onChange={(e) => setInput({ ...input, price: Number(e.target.value) })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800"
                      placeholder="3000000"
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500 text-right">
                    {formatCurrency(input.price)}
                  </div>
                </div>

                {/* Down Payment Ratio Slider */}
                <div>
                    <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                        <span>首付比例</span>
                        <span className="text-indigo-600 font-bold">{(input.downPaymentRatio * 100).toFixed(0)}%</span>
                    </label>
                    <input
                        type="range"
                        min="0.15"
                        max="0.80"
                        step="0.05"
                        value={input.downPaymentRatio}
                        onChange={(e) => setInput({ ...input, downPaymentRatio: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>15%</span>
                        <span>80%</span>
                    </div>
                </div>

                {/* Annual Salary Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">税前年薪 (元) <span className="text-slate-400 font-normal">- 选填</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={input.annualSalary || ''}
                      onChange={(e) => setInput({ ...input, annualSalary: Number(e.target.value) })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-800"
                      placeholder="例如: 300000"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">用于估算社保、公积金及生活结余</p>
                </div>

                {/* Type Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setInput({ ...input, isFirstHome: true })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      input.isFirstHome ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    首套房
                  </button>
                  <button
                    onClick={() => setInput({ ...input, isFirstHome: false })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      !input.isFirstHome ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    二套房
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCalculate}
                  disabled={loadingState === LoadingState.LOADING}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loadingState === LoadingState.LOADING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI 分析中...
                    </>
                  ) : (
                    <>
                      开始计算
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Parameters Adjustment Panel */}
            {editableParams && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                        调整 AI 预设参数
                    </span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500"/> : <ChevronDown className="w-4 h-4 text-slate-500"/>}
                </button>
                
                {showAdvanced && (
                  <div className="p-6 space-y-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                        <span>商业贷款利率 (%)</span>
                        <span className="text-indigo-600">{editableParams.interestRate}%</span>
                      </label>
                      <input
                        type="range"
                        min="2.0"
                        max="6.0"
                        step="0.05"
                        value={editableParams.interestRate}
                        onChange={(e) => setEditableParams({ ...editableParams, interestRate: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    
                    {/* 
                        Removed Down Payment Ratio from here since it is now a primary input.
                        However, we can keep loan term here. 
                    */}

                     <div>
                        <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                            <span>贷款年限 (年)</span>
                            <span className="text-indigo-600">{editableParams.loanTermYears} 年</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={editableParams.loanTermYears}
                            onChange={(e) => setEditableParams({ ...editableParams, loanTermYears: Number(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                     {/* Income/Cost Adjustments if user wants to tweak AI assumptions */}
                     {input.annualSalary > 0 && (
                        <>
                            <div className="pt-2 border-t border-slate-100">
                                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                                    <span>预估月生活费 (元)</span>
                                    <span className="text-indigo-600">{editableParams.monthlyLivingCost}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1000"
                                    max="20000"
                                    step="500"
                                    value={editableParams.monthlyLivingCost || 3000}
                                    onChange={(e) => setEditableParams({ ...editableParams, monthlyLivingCost: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </>
                     )}

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {loadingState === LoadingState.IDLE && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed min-h-[400px] p-8">
                  <Calculator className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg">请输入城市和房价开始 AI 计算</p>
               </div>
            )}

            {loadingState === LoadingState.LOADING && (
               <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 min-h-[400px] p-8">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-600 animate-pulse">Gemini 正在分析 {input.city} 政策及生活成本...</p>
               </div>
            )}

            {loadingState === LoadingState.ERROR && (
               <div className="h-full flex flex-col items-center justify-center bg-red-50 rounded-2xl border border-red-100 min-h-[400px] p-8 text-red-600">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p>分析失败，请检查网络或稍后重试。</p>
               </div>
            )}

            {result && editableParams && loadingState === LoadingState.SUCCESS && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* AI Insight Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                             <span className="text-2xl">✨</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">AI 市场洞察</h3>
                            <p className="text-indigo-100 leading-relaxed text-sm">
                                {editableParams.marketAnalysis}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1 rounded-full">
                                趋势: {editableParams.cityTrend}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-500 mb-1">每月还款 (参考)</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(result.monthlyPayment)}</p>
                        <p className="text-xs text-slate-400 mt-1">等额本息</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-500 mb-1">首付金额 ({(input.downPaymentRatio * 100).toFixed(0)}%)</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(result.downPayment)}</p>
                        <p className="text-xs text-slate-400 mt-1">贷款总额: {formatCurrency(result.loanAmount)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-sm text-slate-500 mb-1">利息总额</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.totalInterest)}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">利率: {editableParams.interestRate}%</span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">基于{input.city}政策</span>
                        </div>
                    </div>
                </div>

                {/* Life Quality & Wealth Analysis (Only if Salary is provided) */}
                {input.annualSalary > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-500" />
                            生活质量与财富结余分析
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                             <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-slate-500 mb-1">税后月入(预估)</p>
                                <p className="font-semibold text-slate-800">{formatCurrency(editableParams.netMonthlyIncome || 0)}</p>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-slate-500 mb-1">每月公积金</p>
                                <p className="font-semibold text-slate-800">{formatCurrency(editableParams.monthlyHousingFund || 0)}</p>
                             </div>
                             <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-slate-500 mb-1">预估生活费</p>
                                <p className="font-semibold text-slate-800">{formatCurrency(editableParams.monthlyLivingCost || 0)}</p>
                             </div>
                             <div className={`p-3 rounded-lg ${ (result.monthlyNetSavings || 0) > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <p className={`${ (result.monthlyNetSavings || 0) > 0 ? 'text-emerald-600' : 'text-red-600'} mb-1`}>每月理论结余</p>
                                <p className={`font-bold ${ (result.monthlyNetSavings || 0) > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {formatCurrency(result.monthlyNetSavings || 0)}
                                </p>
                             </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            * 结余公式 = (税后月入 + 公积金) - 月供 - 生活费。此数据基于 AI 估算的当地平均消费水平，仅供参考。
                        </p>
                    </div>
                )}

                {/* Chart */}
                <ChartComponent 
                    data={result.schedule} 
                    hasWealthData={input.annualSalary > 0}
                />

                {/* Detailed Schedule Preview */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-100">
                       <h3 className="font-semibold text-slate-700">还款计划概览 (前5年)</h3>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500">
                               <tr>
                                   <th className="px-6 py-3 font-medium">年份</th>
                                   <th className="px-6 py-3 font-medium relative group cursor-help">
                                      <div className="flex items-center gap-1">
                                        剩余本金
                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                      </div>
                                      {/* Tooltip */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                        剩余本金指您贷款总额中尚未归还的金额。随着每月还款，这部分金额逐渐减少，产生的利息也随之降低。
                                      </div>
                                   </th>
                                   <th className="px-6 py-3 font-medium">偿还本金</th>
                                   <th className="px-6 py-3 font-medium">偿还利息</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {result.schedule.filter((item) => item.month % 12 === 0 && item.month <= 60).map((item) => (
                                   <tr key={item.month} className="hover:bg-slate-50">
                                       <td className="px-6 py-3 text-slate-800">第 {item.month / 12} 年</td>
                                       <td className="px-6 py-3 text-slate-600">{formatCurrency(item.balance)}</td>
                                       <td className="px-6 py-3 text-emerald-600">+{formatCurrency(item.principal)}</td>
                                       <td className="px-6 py-3 text-amber-600">-{formatCurrency(item.interest)}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   <div className="px-6 py-3 bg-slate-50 text-center text-xs text-slate-400">
                       * 实际还款金额可能因银行具体执行利率和政策调整而异
                   </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
