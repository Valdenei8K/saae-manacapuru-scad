import React from 'react';
import { Award, Zap, DollarSign, Wrench, TrendingUp, CheckCircle, Clock, AlertOctagon, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';

export default function ExecutiveDashboard() {
  // KPIs constants
  const availability = 98.6; // %
  const mtbf = 248; // Hours
  const mttr = 1.8; // Hours
  const energyEfficiency = 92.4; // %
  
  // Costs & consumption
  const totalCostThisMonth = 34500; // R$
  const totalCostLastMonth = 37200; // R$
  const costReduction = ((totalCostLastMonth - totalCostThisMonth) / totalCostLastMonth) * 100;

  // Monthly consumption chart data
  const monthlyConsumptionData = [
    { name: 'Jan', consumo: 42000, custo: 21000, eficiencia: 91 },
    { name: 'Fev', consumo: 38000, custo: 19000, eficiencia: 92 },
    { name: 'Mar', consumo: 45000, custo: 22500, eficiencia: 90 },
    { name: 'Abr', consumo: 41000, custo: 20500, eficiencia: 93 },
    { name: 'Mai', consumo: 49000, custo: 24500, eficiencia: 89 },
    { name: 'Jun', consumo: 36000, custo: 18000, eficiencia: 94 },
    { name: 'Jul', consumo: 34500, custo: 17250, eficiencia: 95 },
  ];

  // Pumps usage data
  const pumpsUsageData = [
    { name: 'B-01 (Captação)', horas: 420, uso: 85, status: 'Otimizado' },
    { name: 'B-03 (Aparecida)', horas: 380, uso: 76, status: 'Alto Desgaste' },
    { name: 'B-02 (Liberdade)', horas: 180, uso: 36, status: 'Subutilizado' },
    { name: 'P-01 (Fátima)', horas: 290, uso: 58, status: 'Otimizado' },
    { name: 'P-02 (Rural)', horas: 95, uso: 19, status: 'Sobressalente' },
  ];

  // Occurrences by region for heat map
  const heatMapData = [
    { region: 'Centro', ocorrencias: 14, manutencoes: 6, criticidade: 'Baixo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { region: 'Região Norte', ocorrencias: 38, manutencoes: 15, criticidade: 'Alto', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { region: 'Região Sul', ocorrencias: 22, manutencoes: 8, criticidade: 'Médio', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { region: 'Zona Rural', ocorrencias: 41, manutencoes: 19, criticidade: 'Muito Alto', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ];

  const pieData = [
    { name: 'Otimizado', value: 3, color: '#10b981' },
    { name: 'Alto Desgaste', value: 1, color: '#ef4444' },
    { name: 'Subutilizado', value: 1, color: '#f59e0b' },
  ];

  return (
    <div id="executive-dashboard" className="space-y-6 p-1">
      
      {/* 1. TOP EXECUTIVE KPIs CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Availability Card */}
        <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-scada-secondary font-bold uppercase tracking-wider block">Disponibilidade de Rede</span>
            <span className="text-2xl font-mono font-black text-scada-primary">{availability}%</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-500">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acima da meta (95.0%)</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Award className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* MTBF / MTTR Card */}
        <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-scada-secondary font-bold uppercase tracking-wider block">Confiabilidade Ativos</span>
            <div className="flex gap-4 items-baseline">
              <span className="text-2xl font-mono font-black text-scada-primary">{mtbf}h <span className="text-[10px] text-scada-secondary font-normal">MTBF</span></span>
              <span className="text-xl font-mono font-bold text-scada-secondary">{mttr}h <span className="text-[10px] text-scada-secondary font-normal">MTTR</span></span>
            </div>
            <p className="text-[11px] text-scada-secondary">Tempo médio de falha e reparo</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Energy Costs Card */}
        <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-scada-secondary font-bold uppercase tracking-wider block">Custos de Energia Mensal</span>
            <span className="text-2xl font-mono font-black text-scada-primary">R$ {totalCostThisMonth.toLocaleString('pt-BR')}</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-500">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Redução de {costReduction.toFixed(1)}% vs mês ant.</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 shrink-0">
            <DollarSign className="w-6 h-6 text-yellow-550" />
          </div>
        </div>

        {/* Energy Efficiency Card */}
        <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-scada-secondary font-bold uppercase tracking-wider block">Eficiência de Bombeamento</span>
            <span className="text-2xl font-mono font-black text-scada-primary">{energyEfficiency}%</span>
            <div className="flex items-center gap-1 text-[11px] text-amber-500">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Alinhado c/ metas Proesco SAAE</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
        </div>

      </div>

      {/* 2. MAIN CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost & Efficiency Trends (Area/Line chart) */}
        <div className="lg:col-span-2 bg-scada-card border border-scada rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-scada pb-3">
            <div>
              <h3 className="font-sans font-bold text-sm text-scada-primary">Consumo de Energia e Custos Operacionais Históricos</h3>
              <p className="text-xs text-scada-secondary">Acompanhamento de eficiência de custo no CCO SAAE de Manacapuru</p>
            </div>
            <div className="text-xs text-scada-secondary font-mono">
              Jan - Jul 2026
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyConsumptionData}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--text-secundario)" fontSize={11} />
                <YAxis yAxisId="left" stroke="var(--text-secundario)" fontSize={11} label={{ value: 'Consumo (kWh)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: 'var(--text-secundario)', fontSize: 10 } }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-secundario)" fontSize={11} label={{ value: 'Custos (R$)', angle: 90, position: 'insideRight', offset: 5, style: { fill: 'var(--text-secundario)', fontSize: 10 } }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: 'var(--text-principal)' }} />
                <Line yAxisId="left" type="monotone" name="Consumo Ativo (kWh)" dataKey="consumo" stroke="#fbbf24" strokeWidth={2.5} dot />
                <Line yAxisId="right" type="monotone" name="Custos ETA (R$)" dataKey="custo" stroke="#3b82f6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pumps Distribution Ratio (Pie chart & list) */}
        <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="border-b border-scada pb-3">
            <h3 className="font-sans font-bold text-sm text-scada-primary">Eficiência de Uso dos Motores</h3>
            <p className="text-xs text-scada-secondary">Fração de desgaste dos equipamentos</p>
          </div>

          <div className="h-44 flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-mono font-black text-scada-primary">5</span>
              <span className="text-[10px] text-scada-secondary uppercase tracking-widest">Bombas</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {pieData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-scada-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span>{d.name}</span>
                </div>
                <span className="font-mono text-scada-secondary">{d.value} ({Math.round((d.value/5)*100)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. CITY OCCURRENCES HEATMAP & MAINTENANCE METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heat Map Table of City Districts */}
        <div className="lg:col-span-1 bg-scada-card border border-scada rounded-2xl p-4 shadow-lg space-y-4">
          <div>
            <h3 className="font-sans font-bold text-sm text-scada-primary">Mapa de Calor: Ocorrências de Rede</h3>
            <p className="text-xs text-scada-secondary">Mapeamento de quebras e vazamentos por região urbana</p>
          </div>

          <div className="space-y-3">
            {heatMapData.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex justify-between items-center ${item.color} transition-all hover:scale-102`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-scada-primary block">{item.region}</span>
                  <span className="text-[10px] text-scada-secondary font-mono">Manutenções preventivas: {item.manutencoes}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-mono text-xs font-bold text-scada-primary block">{item.ocorrencias} falhas</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold font-mono">
                    Nível: {item.criticidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-scada-main/50 border border-scada p-2.5 rounded-xl text-[10px] text-scada-secondary font-mono text-center flex items-center gap-1.5 justify-center">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Zona Rural apresenta a menor redundância e maior desgaste de fase elétrica.</span>
          </div>
        </div>

        {/* Detailed active usage bar chart */}
        <div className="lg:col-span-2 bg-scada-card border border-scada rounded-2xl p-4 shadow-lg space-y-4">
          <div className="border-b border-scada pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-sm text-scada-primary">Tempo de Operação de Bombas (Últimos 30 dias)</h3>
              <p className="text-xs text-scada-secondary">Uso cumulativo e horas de desgaste total</p>
            </div>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pumpsUsageData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis type="number" stroke="var(--text-secundario)" fontSize={10} label={{ value: 'Horas Trabalhadas', position: 'insideBottom', offset: -3, style: { fill: 'var(--text-secundario)', fontSize: 10 } }} />
                <YAxis type="category" dataKey="name" stroke="var(--text-secundario)" fontSize={10} width={95} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 11 }} />
                <Bar dataKey="horas" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {pumpsUsageData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.uso > 70 ? '#ef4444' : entry.uso < 30 ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono border-t border-scada pt-3">
            <div className="space-y-0.5">
              <span className="text-scada-secondary block">Bomba Crítica</span>
              <span className="text-red-500 font-bold">B-03 Aparecida</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-scada-secondary block">Eficiência Geral</span>
              <span className="text-green-500 font-bold">92.4% COP</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-scada-secondary block">Status MTTR</span>
              <span className="text-blue-500 font-bold">Melhorado (-0.6h)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
