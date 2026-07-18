import React, { useState } from 'react';
import { X, Play, Square, RotateCcw, Shield, Activity, Settings, Info, BatteryCharging, Thermometer, Clock, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { Equipment, Alarm, EventLog, UserProfile, AlarmSeverity } from '../types';
import { generateHistoryData } from '../data';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface EquipmentSidebarProps {
  equipment: Equipment;
  onClose: () => void;
  userProfile: UserProfile;
  activeAlarms: Alarm[];
  equipmentAlarms: Alarm[];
  equipmentHistory: EventLog[];
  onCommand: (equipmentId: string, command: string, value?: string) => void;
  onAcknowledgeAlarm: (alarmId: string, operator: string) => void;
}

export default function EquipmentSidebar({
  equipment,
  onClose,
  userProfile,
  activeAlarms,
  equipmentAlarms,
  equipmentHistory,
  onCommand,
  onAcknowledgeAlarm
}: EquipmentSidebarProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [obsText, setObsText] = useState('');

  // Generate charts data based on selected timeRange
  const chartDays = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
  const historyData = generateHistoryData(equipment.id, chartDays);

  const canControl = userProfile === 'admin' || userProfile === 'operator' || userProfile === 'supervisor';
  const isVisitor = userProfile === 'visitor';

  const handleObsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim()) return;
    onCommand(equipment.id, 'observacao', obsText);
    setObsText('');
  };

  // Helper for severity color
  const getSeverityBadgeColor = (severity: AlarmSeverity) => {
    switch (severity) {
      case 'critico': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'alto': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'medio': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'baixo': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
  };

  // Helper for equipment status color/text
  const getStatusDisplay = () => {
    switch (equipment.status) {
      case 'ligada':
        return { label: 'Em Operação (Manual)', color: 'bg-green-500 text-green-950', ring: 'ring-green-500/30' };
      case 'automatico':
        return { label: 'Operação Automática', color: 'bg-blue-500 text-blue-950', ring: 'ring-blue-500/30' };
      case 'desligada':
        return { label: 'Desligado / Standby', color: 'bg-zinc-500 text-zinc-100', ring: 'ring-zinc-500/30' };
      case 'manutencao':
        return { label: 'Em Manutenção', color: 'bg-amber-500 text-amber-950', ring: 'ring-amber-500/30' };
      case 'falha':
        return { label: 'FALHA DE SISTEMA', color: 'bg-red-500 text-red-950 animate-pulse', ring: 'ring-red-500/50' };
      case 'alarme_critico':
        return { label: 'ALARME CRÍTICO', color: 'bg-red-600 text-white animate-pulse', ring: 'ring-red-600/50' };
      case 'pressao_normal':
        return { label: 'Pressão Normal', color: 'bg-green-500 text-green-950', ring: 'ring-green-500/30' };
      case 'pressao_baixa':
        return { label: 'Pressão Baixa', color: 'bg-amber-500 text-amber-950 animate-pulse', ring: 'ring-amber-500/30' };
      case 'pressao_critica':
        return { label: 'Pressão Crítica', color: 'bg-red-500 text-red-950 animate-pulse', ring: 'ring-red-500/50' };
      case 'aberta':
        return { label: 'Válvula Aberta', color: 'bg-green-500 text-green-950', ring: 'ring-green-500/30' };
      case 'fechada':
        return { label: 'Válvula Fechada', color: 'bg-zinc-600 text-zinc-200', ring: 'ring-zinc-600/30' };
      default:
        return { label: 'Não Identificado', color: 'bg-zinc-400 text-zinc-950', ring: 'ring-zinc-400/30' };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div id={`sidebar-${equipment.id}`} className="fixed top-14 right-0 w-full md:w-112 h-[calc(100vh-3.5rem)] bg-scada-card border-l border-scada text-scada-primary flex flex-col z-45 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-scada flex justify-between items-center bg-scada-main/95">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusInfo.color} ring-4 ${statusInfo.ring}`}></div>
          <div>
            <h3 className="font-sans font-bold text-base tracking-tight text-scada-primary">{equipment.name}</h3>
            <p className="font-mono text-xs text-scada-secondary">{(equipment.id || '').toUpperCase()} • Região: {(equipment.regionId || '').toUpperCase()}</p>
          </div>
        </div>
        <button id={`close-sidebar-${equipment.id}`} onClick={onClose} className="p-1.5 rounded-lg hover:bg-scada-main text-scada-secondary hover:text-scada-primary transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-scada">
        
        {/* Photo & Basic Info */}
        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-scada shadow-md animate-in fade-in">
          <img 
            src={equipment.photoUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"} 
            alt={equipment.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className="text-[10px] font-mono text-white bg-black/80 px-2 py-0.5 rounded-md">
              Manut.: {equipment.lastMaintenance || 'N/D'}
            </span>
          </div>
        </div>

        {/* Remote Commands Section */}
        <div className="bg-scada-main/40 border border-scada rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm">
            <Shield className="w-4 h-4" />
            <span>Comandos Remotos de Operação</span>
            {isVisitor && <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded ml-auto">Visualização</span>}
          </div>

          {!canControl ? (
            <p className="text-xs text-scada-secondary bg-scada-main/60 p-2.5 rounded-lg border border-scada font-mono">
              ⚠️ Seu perfil ({userProfile.toUpperCase()}) não possui permissões para enviar comandos a este equipamento.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Manual vs Automatic */}
              {(equipment.type === 'bomba' || equipment.type === 'booster' || equipment.type === 'poco') && (
                <>
                  <button 
                    id={`btn-manual-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'controlMode', 'manual')}
                    className={`p-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      equipment.controlMode === 'manual' 
                        ? 'bg-amber-600/20 text-amber-600 border-amber-500/50 shadow-md' 
                        : 'bg-scada-card hover:bg-scada-main text-scada-secondary border-scada'
                    }`}
                  >
                    Ativar Modo Manual
                  </button>
                  <button 
                    id={`btn-auto-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'controlMode', 'automatico')}
                    className={`p-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
                      equipment.controlMode === 'automatico' 
                        ? 'bg-blue-600/20 text-blue-500 border-blue-500/50 shadow-md' 
                        : 'bg-scada-card hover:bg-scada-main text-scada-secondary border-scada'
                    }`}
                  >
                    Ativar Automático
                  </button>

                  {/* Remote / Local Switcher */}
                  <button 
                    id={`btn-local-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'controlLocation', 'local')}
                    className={`p-2 rounded-lg border font-mono text-[11px] cursor-pointer ${
                      equipment.controlLocation === 'local' 
                        ? 'bg-scada-main text-amber-500 border-amber-500/30' 
                        : 'bg-scada-card/40 text-scada-secondary border-scada'
                    }`}
                  >
                    Controle: LOCAL
                  </button>
                  <button 
                    id={`btn-remoto-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'controlLocation', 'remoto')}
                    className={`p-2 rounded-lg border font-mono text-[11px] cursor-pointer ${
                      equipment.controlLocation === 'remoto' 
                        ? 'bg-scada-main text-green-500 border-green-500/30' 
                        : 'bg-scada-card/40 text-scada-secondary border-scada'
                    }`}
                  >
                    Controle: REMOTO (CCO)
                  </button>

                  {/* Ligar / Desligar - Only available in Manual mode & Remote Control */}
                  <button
                    id={`btn-turnon-${equipment.id}`}
                    disabled={equipment.controlMode !== 'manual' || equipment.controlLocation !== 'remoto'}
                    onClick={() => onCommand(equipment.id, 'status', 'ligada')}
                    className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all col-span-1 cursor-pointer ${
                      equipment.status === 'ligada'
                        ? 'bg-green-600 text-white shadow-lg'
                        : equipment.controlMode === 'manual' && equipment.controlLocation === 'remoto'
                          ? 'bg-scada-card hover:bg-green-500/10 hover:text-green-500 text-scada-secondary border border-green-500/20'
                          : 'bg-scada-main text-scada-secondary/40 cursor-not-allowed border border-scada/30'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    LIGAR BOMBA
                  </button>

                  <button
                    id={`btn-turnoff-${equipment.id}`}
                    disabled={equipment.controlMode !== 'manual' || equipment.controlLocation !== 'remoto'}
                    onClick={() => onCommand(equipment.id, 'status', 'desligada')}
                    className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all col-span-1 cursor-pointer ${
                      equipment.status === 'desligada'
                        ? 'bg-red-600/40 text-red-500 border border-red-500/50 shadow-lg'
                        : equipment.controlMode === 'manual' && equipment.controlLocation === 'remoto'
                          ? 'bg-scada-card hover:bg-red-500/10 hover:text-red-500 text-scada-secondary border border-red-500/20'
                          : 'bg-scada-main text-scada-secondary/40 cursor-not-allowed border border-scada/30'
                    }`}
                  >
                    <Square className="w-4 h-4 fill-current" />
                    DESLIGAR
                  </button>
                </>
              )}

              {/* Reset Faults (Always active if equipment has fault) */}
              {equipment.status === 'falha' && (
                <button
                  id={`btn-reset-${equipment.id}`}
                  onClick={() => onCommand(equipment.id, 'reset')}
                  className="p-3 bg-red-950/25 hover:bg-red-950/40 text-red-500 border border-red-500/30 rounded-xl font-bold col-span-2 flex items-center justify-center gap-2 shadow-md animate-pulse cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  RESETAR TRIP / REARMAL FALHA
                </button>
              )}

              {/* Valve Control */}
              {equipment.type === 'valvula' && (
                <>
                  <button
                    id={`btn-valveopen-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'valve', 'aberta')}
                    className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 col-span-1 transition-all cursor-pointer ${
                      equipment.status === 'aberta' ? 'bg-green-600 text-white shadow-md' : 'bg-scada-card hover:bg-scada-main text-scada-primary border border-scada'
                    }`}
                  >
                    ABRIR VÁLVULA
                  </button>
                  <button
                    id={`btn-valveclose-${equipment.id}`}
                    onClick={() => onCommand(equipment.id, 'valve', 'fechada')}
                    className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 col-span-1 transition-all cursor-pointer ${
                      equipment.status === 'fechada' ? 'bg-zinc-600 text-white shadow-md' : 'bg-scada-card hover:bg-scada-main text-scada-primary border border-scada'
                    }`}
                  >
                    FECHAR VÁLVULA
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Real-time Telemetry Data Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-scada-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            Dados Operacionais em Tempo Real
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* For pumps/wells/boosters */}
            {(equipment.type === 'bomba' || equipment.type === 'booster' || equipment.type === 'poco') && (
              <>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary flex items-center gap-1 text-[11px]"><Thermometer className="w-3.5 h-3.5 text-red-500" />Temp. Motor</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.temperature !== undefined ? `${equipment.temperature} °C` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary flex items-center gap-1 text-[11px]"><Info className="w-3.5 h-3.5 text-amber-500" />Vibração</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.vibration !== undefined ? `${equipment.vibration} mm/s` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary flex items-center gap-1 text-[11px]"><BatteryCharging className="w-3.5 h-3.5 text-yellow-500" />Tensão Fase</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.voltage !== undefined ? `${equipment.voltage} V` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary flex items-center gap-1 text-[11px]"><Activity className="w-3.5 h-3.5 text-emerald-500" />Corrente Nominal</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.current !== undefined ? `${equipment.current} A` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary text-[11px]">Potência Consumida</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.power !== undefined ? `${equipment.power} kW` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary text-[11px]">Fator de Potência</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.powerFactor !== undefined ? `${equipment.powerFactor} φ` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary flex items-center gap-1 text-[11px]"><Clock className="w-3.5 h-3.5 text-blue-500" />Horas Trabalhadas</span>
                  <span className="font-mono text-sm font-bold text-scada-primary mt-1">{equipment.hoursWorked !== undefined ? `${equipment.hoursWorked} h` : 'N/D'}</span>
                </div>
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-scada-secondary text-[11px]">Partidas Totais</span>
                  <span className="font-mono text-base font-bold text-scada-primary mt-1">{equipment.numStarts !== undefined ? equipment.numStarts : 'N/D'}</span>
                </div>
              </>
            )}

            {/* Hydraulic measurements if present */}
            {equipment.pressure !== undefined && (
              <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between col-span-1">
                <span className="text-scada-secondary text-[11px]">Pressão Manométrica</span>
                <span className={`font-mono text-lg font-bold mt-1 ${
                  equipment.status.includes('pressao_critica') ? 'text-red-500 animate-pulse' : 
                  equipment.status.includes('pressao_baixa') ? 'text-amber-500' : 'text-blue-500'
                }`}>
                  {equipment.pressure} mca
                </span>
              </div>
            )}

            {equipment.flowRate !== undefined && (
              <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3 flex flex-col justify-between col-span-1">
                <span className="text-scada-secondary text-[11px]">Vazão Instatânea</span>
                <span className="font-mono text-lg font-bold text-emerald-500 mt-1">
                  {equipment.flowRate} L/s
                </span>
              </div>
            )}

            {/* For reservoirs */}
            {equipment.type === 'reservatorio' && (
              <div className="col-span-2 space-y-3">
                <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-scada-secondary font-medium">Nível do Reservatório</span>
                    <span className="font-mono text-scada-primary font-bold">{equipment.level}%</span>
                  </div>
                  {/* Custom progress bar */}
                  <div className="w-full bg-scada-main rounded-full h-3 overflow-hidden border border-scada">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        (equipment.level || 0) < 30 ? 'bg-red-500' :
                        (equipment.level || 0) < 50 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${equipment.level}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3">
                    <span className="text-scada-secondary text-[11px]">Volume Armazenado</span>
                    <span className="block font-mono text-base font-bold text-blue-500 mt-1">{equipment.volume} m³</span>
                  </div>
                  <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3">
                    <span className="text-scada-secondary text-[11px]">Capacidade Total</span>
                    <span className="block font-mono text-base font-bold text-scada-primary mt-1">{equipment.capacity} m³</span>
                  </div>
                  <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3">
                    <span className="text-scada-secondary text-[11px]">Vazão de Entrada (Q_in)</span>
                    <span className="block font-mono text-base font-bold text-emerald-500 mt-1">+{equipment.inletFlow} L/s</span>
                  </div>
                  <div className="bg-scada-main/30 border border-scada/60 rounded-xl p-3">
                    <span className="text-scada-secondary text-[11px]">Vazão de Saída (Q_out)</span>
                    <span className="block font-mono text-base font-bold text-orange-500 mt-1">-{equipment.outletFlow} L/s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Panel */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-scada-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Gráficos Históricos
            </h4>
            <div className="flex bg-scada-main border border-scada rounded-lg p-0.5 text-[10px] font-mono">
              {(['24h', '7d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${
                    timeRange === r ? 'bg-blue-600 text-white shadow-sm' : 'text-scada-secondary hover:text-scada-primary'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 bg-scada-main/30 border border-scada/60 rounded-xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="label" stroke="var(--text-secundario)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-secundario)" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-navbar)', borderColor: 'var(--border-color)', color: 'var(--text-principal)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  name={equipment.type === 'reservatorio' ? 'Nível %' : 'Métrica Principal'} 
                  type="monotone" 
                  dataKey="metric1" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false} 
                />
                <Line 
                  name={equipment.type === 'reservatorio' ? 'Volume m³' : 'Métrica Secundária'} 
                  type="monotone" 
                  dataKey="metric2" 
                  stroke="#10b981" 
                  strokeWidth={1.5}
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Alarms list */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-scada-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-red-500" />
            Alarmes Ativos ({equipmentAlarms.filter(a => a.status === 'ativo').length})
          </h4>
          
          {equipmentAlarms.filter(a => a.status === 'ativo').length === 0 ? (
            <p className="text-xs text-scada-secondary bg-scada-main/20 border border-scada/40 p-3 rounded-xl text-center">
              Nenhum alarme ativo para este equipamento.
            </p>
          ) : (
            <div className="space-y-2">
              {equipmentAlarms.filter(a => a.status === 'ativo').map((alarm) => (
                <div key={alarm.id} className="bg-scada-main/30 border border-scada rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold uppercase ${getSeverityBadgeColor(alarm.severity)}`}>
                      {alarm.severity}
                    </span>
                    <span className="text-[10px] font-mono text-scada-secondary">
                      {new Date(alarm.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-scada-primary">{alarm.description}</p>
                  
                  {canControl && (
                    <button
                      id={`ack-${alarm.id}`}
                      onClick={() => onAcknowledgeAlarm(alarm.id, `Operador (${userProfile})`)}
                      className="mt-1 flex items-center justify-center gap-1 bg-scada-main hover:bg-scada-main/80 text-emerald-500 font-semibold py-1.5 px-3 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      RECONHECER ALARME
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Logger / Comments */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-scada-secondary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Registrar Ocorrência / Observação
          </h4>
          
          <form onSubmit={handleObsSubmit} className="flex gap-2">
            <input 
              type="text"
              placeholder={isVisitor ? "Apenas leitura..." : "Digite uma observação operacional..."}
              disabled={isVisitor}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              className="flex-1 text-xs bg-scada-main border border-scada rounded-xl px-3 py-2 text-scada-primary placeholder-scada-secondary/50 focus:outline-none focus:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button 
              id="submit-obs"
              type="submit" 
              disabled={isVisitor}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              Gravar
            </button>
          </form>
        </div>

        {/* History of changes / Events */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-scada-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-scada-secondary" />
            Log Operacional Recente
          </h4>
          
          {equipmentHistory.length === 0 ? (
            <p className="text-xs text-scada-secondary bg-scada-main/10 p-3 rounded-xl text-center">
              Nenhum evento registrado hoje para este equipamento.
            </p>
          ) : (
            <div className="bg-scada-main/20 border border-scada rounded-xl divide-y divide-scada/50">
              {equipmentHistory.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 text-xs space-y-1">
                  <div className="flex justify-between text-scada-secondary text-[10px] font-mono">
                    <span>{log.username}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                  </div>
                  <p className="text-scada-primary">{log.description}</p>
                  {(log.oldValue || log.newValue) && (
                    <div className="text-[10px] text-scada-secondary/80 font-mono flex gap-1.5">
                      <span>Val:</span>
                      <span className="line-through">{log.oldValue || 'None'}</span>
                      <span>➔</span>
                      <span className="text-blue-500">{log.newValue || 'None'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
