import React from 'react';
import { Shield, Zap, TrendingUp, AlertTriangle, Droplet, Check, RefreshCw, BarChart2, Radio, Activity } from 'lucide-react';
import { Equipment, Region, Pipeline, Alarm, EventLog, UserProfile } from '../types';
import InteractiveMap from './InteractiveMap';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface OperationalDashboardProps {
  equipmentList: Equipment[];
  regions: Region[];
  pipelines: Pipeline[];
  activeAlarms: Alarm[];
  events: EventLog[];
  userProfile: UserProfile;
  selectedEquipment: Equipment | null;
  onSelectEquipment: (equipment: Equipment) => void;
  hoveredEquipment: Equipment | null;
  onHoverEquipment: (equipment: Equipment | null) => void;
  onAcknowledgeAlarm: (alarmId: string, operator: string) => void;
  theme?: 'dark' | 'light';
}

export default function OperationalDashboard({
  equipmentList,
  regions,
  pipelines,
  activeAlarms,
  events,
  userProfile,
  selectedEquipment,
  onSelectEquipment,
  hoveredEquipment,
  onHoverEquipment,
  onAcknowledgeAlarm,
  theme = 'dark'
}: OperationalDashboardProps) {

  // Calculations for stats
  const totalPumps = equipmentList.filter(e => e.type === 'bomba' || e.type === 'booster').length;
  const pumpsOn = equipmentList.filter(e => (e.type === 'bomba' || e.type === 'booster') && (e.status === 'ligada' || e.status === 'automatico')).length;
  const pumpsOff = equipmentList.filter(e => (e.type === 'bomba' || e.type === 'booster') && e.status === 'desligada').length;
  const pumpsFail = equipmentList.filter(e => (e.type === 'bomba' || e.type === 'booster') && e.status === 'falha').length;
  const pumpsMaint = equipmentList.filter(e => (e.type === 'bomba' || e.type === 'booster') && e.status === 'manutencao').length;
  
  const totalReservoirs = equipmentList.filter(e => e.type === 'reservatorio').length;
  
  const pressureMeters = equipmentList.filter(e => e.type === 'pressao' && e.pressure !== undefined);
  const avgPressure = pressureMeters.reduce((acc, curr) => acc + (curr.pressure || 0), 0) / (pressureMeters.length || 1);
  
  const activeEnergy = equipmentList
    .filter(e => e.power !== undefined && (e.status === 'ligada' || e.status === 'automatico'))
    .reduce((acc, curr) => acc + (curr.power || 0), 0);

  const totalActiveAlarmsCount = activeAlarms.filter(a => a.status === 'ativo').length;
  
  // Simulated stats for communications lost (lastComms > 30s)
  const commsLost = equipmentList.filter(e => {
    const timeDiff = Date.now() - new Date(e.lastCommunication).getTime();
    return timeDiff > 30000;
  }).length;

  // Real-time graphs seed data
  const chartData = [
    { name: '10:00', bombasOn: 3, energia: 105, pressao: 2.8, vazao: 220 },
    { name: '11:00', bombasOn: 4, energia: 145, pressao: 3.2, vazao: 280 },
    { name: '12:00', bombasOn: 3, energia: 110, pressao: 3.1, vazao: 240 },
    { name: '13:00', bombasOn: 4, energia: 164, pressao: 3.4, vazao: 310 },
    { name: '14:00', bombasOn: 3, energia: 115, pressao: 2.9, vazao: 230 },
    { name: '15:00', bombasOn: 4, energia: 185, pressao: 3.6, vazao: 345 },
    { name: '16:00', bombasOn: 3, energia: 130, pressao: 3.0, vazao: 260 },
  ];

  return (
    <div id="operational-dashboard" className="space-y-4 p-1">
      
      {/* 1. TOP INDICATORS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-10 gap-2.5">
        
        {/* Pumps Total */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-scada-secondary uppercase tracking-wider">Bombas Totais</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-scada-primary">{totalPumps}</span>
            <span className="text-[9px] text-scada-secondary font-mono">Unidades</span>
          </div>
        </div>

        {/* Pumps On */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Ligadas / Auto</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-green-500">{pumpsOn}</span>
            <span className="text-[9px] text-green-500 font-mono bg-green-500/10 px-1.5 py-0.5 rounded-md">Ativas</span>
          </div>
        </div>

        {/* Pumps Off */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-scada-secondary uppercase tracking-wider">Desligadas</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-scada-secondary">{pumpsOff}</span>
            <span className="text-[9px] text-scada-secondary font-mono">Standby</span>
          </div>
        </div>

        {/* Pumps Fault */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Em Falha</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className={`text-xl font-mono font-bold ${pumpsFail > 0 ? 'text-red-500 animate-pulse' : 'text-scada-secondary'}`}>{pumpsFail}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${pumpsFail > 0 ? 'bg-red-500/15 text-red-400 font-bold' : 'bg-scada-main text-scada-secondary'}`}>Trip</span>
          </div>
        </div>

        {/* Pumps Maintenance */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Manutenção</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-amber-500">{pumpsMaint}</span>
            <span className="text-[9px] text-amber-500 font-mono">Oficina</span>
          </div>
        </div>

        {/* Reservoirs */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Reservatórios</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-blue-500">{totalReservoirs}</span>
            <span className="text-[9px] text-scada-secondary font-mono">Monitorados</span>
          </div>
        </div>

        {/* Avg Pressure */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-scada-secondary uppercase tracking-wider">Pressão Média</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-scada-primary">{avgPressure.toFixed(1)}</span>
            <span className="text-[9px] text-scada-secondary font-mono">mca</span>
          </div>
        </div>

        {/* Power Cons */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Consumo Ativo</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className="text-xl font-mono font-bold text-yellow-500">{activeEnergy.toFixed(1)}</span>
            <span className="text-[9px] text-scada-secondary font-mono">kW</span>
          </div>
        </div>

        {/* Active Alarms */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Alarmes Ativos</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className={`text-xl font-mono font-bold ${totalActiveAlarmsCount > 0 ? 'text-red-500 animate-bounce' : 'text-scada-secondary'}`}>{totalActiveAlarmsCount}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${totalActiveAlarmsCount > 0 ? 'bg-red-500/20 text-red-400 font-bold' : 'bg-scada-main text-scada-secondary'}`}>Hoje</span>
          </div>
        </div>

        {/* Comm Loss */}
        <div className="bg-scada-card border border-scada p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
          <span className="text-[10px] font-bold text-scada-secondary uppercase tracking-wider">Falha Comm</span>
          <div className="flex justify-between items-baseline mt-1.5">
            <span className={`text-xl font-mono font-bold ${commsLost > 0 ? 'text-orange-500' : 'text-scada-secondary'}`}>{commsLost}</span>
            <span className="text-[9px] text-scada-secondary font-mono">Nós GPRS</span>
          </div>
        </div>

      </div>

      {/* 2. CENTER SCADA GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-auto lg:h-[620px]">
        
        {/* LEFT SIDE - ALARMS LIST PANEL (25%) */}
        <div className="lg:col-span-1 h-[320px] lg:h-full bg-scada-card border border-scada rounded-2xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-3 border-b border-scada bg-scada-main/60 flex justify-between items-center">
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Central de Alarmes Ativos
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              theme === 'light' 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-red-950/60 text-red-400 border-red-500/20'
            }`}>
              {activeAlarms.filter(a => a.status === 'ativo').length} pendentes
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
            {activeAlarms.filter(a => a.status === 'ativo').length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Check className="w-10 h-10 text-green-500 bg-green-500/10 p-2 rounded-full mb-2" />
                <p className="text-xs font-medium text-scada-primary">Sem alarmes pendentes</p>
                <p className="text-[10px] text-scada-secondary mt-1">Toda a rede SAAE operando dentro dos limites de conformidade.</p>
              </div>
            ) : (
              activeAlarms
                .filter(a => a.status === 'ativo')
                .map((alm) => {
                  let sevColor = '';
                  let itemBorder = '';
                  if (alm.severity === 'critico') {
                    sevColor = theme === 'light' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-red-500/20 text-red-500 border border-red-500/30';
                    itemBorder = 'border-l-4 border-l-red-500';
                  } else if (alm.severity === 'alto') {
                    sevColor = theme === 'light' 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'bg-orange-500/20 text-orange-550 border border-orange-500/30';
                    itemBorder = 'border-l-4 border-l-orange-550';
                  } else {
                    sevColor = theme === 'light' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-amber-500/20 text-amber-550 border border-amber-500/30';
                    itemBorder = 'border-l-4 border-l-amber-500';
                  }

                  return (
                    <div 
                      key={alm.id} 
                      className={`bg-scada-main/40 border border-scada rounded-xl p-3 ${itemBorder} hover:border-scada/80 transition-all flex flex-col gap-1.5`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${sevColor}`}>
                          {alm.severity}
                        </span>
                        <span className="text-[9px] font-mono text-scada-secondary">
                          {new Date(alm.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-scada-primary block">{alm.equipmentName}</span>
                        <p className="text-[11px] text-scada-secondary leading-normal">{alm.description}</p>
                      </div>

                      {userProfile !== 'visitor' && (
                        <button
                          id={`ack-dashboard-${alm.id}`}
                          onClick={() => onAcknowledgeAlarm(alm.id, `Operador (${userProfile})`)}
                          className={`mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold py-1.2 px-2.5 rounded-lg border transition-all cursor-pointer ${
                            theme === 'light'
                              ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-950/25 hover:bg-emerald-900/40 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Reconhecer Alarme
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* CENTER PANEL - REAL-TIME GIS MAP (50%) */}
        <div className="lg:col-span-2 h-[420px] lg:h-full bg-scada-card border border-scada rounded-2xl overflow-hidden shadow-lg flex flex-col relative">
          <div className="p-3 border-b border-scada bg-scada-main/60 flex justify-between items-center z-10">
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-scada-primary flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
              Supervisão Georreferenciada em Tempo Real - GIS
            </h3>
            <span className="text-[9px] font-mono text-scada-secondary">
              Manacapuru, AM
            </span>
          </div>

          <div className="flex-1 relative">
            <InteractiveMap
              equipmentList={equipmentList}
              regions={regions}
              pipelines={pipelines}
              activeAlarms={activeAlarms}
              selectedEquipment={selectedEquipment}
              onSelectEquipment={onSelectEquipment}
              hoveredEquipment={hoveredEquipment}
              onHoverEquipment={onHoverEquipment}
              theme={theme}
            />
          </div>
        </div>

        {/* RIGHT SIDE - TELEMETRY GRAPHICS (25%) */}
        <div className="lg:col-span-1 h-auto lg:h-full bg-scada-card border border-scada rounded-2xl flex flex-col overflow-hidden shadow-lg p-3 space-y-3.5">
          <div className="border-b border-scada pb-2 bg-scada-card flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-scada-primary">
              Tendências Operacionais CCO
            </h3>
          </div>

          {/* Graph 1: Active Pumps Rate */}
          <div className="flex-1 flex flex-col min-h-36">
            <span className="text-[10px] text-scada-secondary font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" /> Bombas Ativas p/ Hora
            </span>
            <div className={`flex-1 rounded-xl p-1.5 border border-scada ${theme === 'light' ? 'bg-slate-50/50' : 'bg-scada-main/50'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" stroke="var(--text-secundario)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-secundario)" fontSize={9} tickLine={false} domain={[0, 6]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 10 }} />
                  <Bar dataKey="bombasOn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 2: Active Energy */}
          <div className="flex-1 flex flex-col min-h-36">
            <span className="text-[10px] text-scada-secondary font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Consumo Elétrico ETA (kW)
            </span>
            <div className={`flex-1 rounded-xl p-1.5 border border-scada ${theme === 'light' ? 'bg-slate-50/50' : 'bg-scada-main/50'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" stroke="var(--text-secundario)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-secundario)" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 10 }} />
                  <Area type="monotone" dataKey="energia" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.06} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 3: Flow & Pressure */}
          <div className="flex-1 flex flex-col min-h-36">
            <span className="text-[10px] text-scada-secondary font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Vazão de Saída (L/s)
            </span>
            <div className={`flex-1 rounded-xl p-1.5 border border-scada ${theme === 'light' ? 'bg-slate-50/50' : 'bg-scada-main/50'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="name" stroke="var(--text-secundario)" fontSize={9} tickLine={false} />
                  <YAxis stroke="var(--text-secundario)" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)', fontSize: 10 }} />
                  <Area type="monotone" dataKey="vazao" stroke="#10b981" fill="#10b981" fillOpacity={0.06} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* 3. SCADA FOOTER LOG STREAMING TICKER */}
      <div className="bg-scada-card border border-scada rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-md">
        <div className="bg-blue-600/15 text-blue-500 text-[10px] font-bold px-2.5 py-1 rounded border border-blue-500/20 uppercase tracking-widest font-mono shrink-0 flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Live CCO Log
        </div>
        
        {/* Scrolling Ticker Box */}
        <div className="flex-1 overflow-hidden relative h-5">
          <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite] text-xs font-mono text-scada-secondary">
            {events.slice(0, 8).map((ev, idx) => (
              <span key={ev.id || idx} className="inline-flex items-center gap-1.5">
                <span className="text-scada-secondary/60">[{new Date(ev.timestamp).toLocaleTimeString('pt-BR')}]</span>
                <span className={ev.type === 'alarme' ? 'text-red-500 font-bold' : ev.type === 'comando' ? 'text-amber-500' : 'text-scada-primary'}>
                  {ev.description}
                </span>
                <span className="text-scada-secondary/40 font-normal">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
