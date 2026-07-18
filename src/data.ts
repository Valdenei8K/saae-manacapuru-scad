import { Equipment, Region, Alarm, EventLog, Pipeline } from './types';

// Regions of Manacapuru
export const INITIAL_REGIONS: Region[] = [
  {
    id: 'centro',
    name: 'Centro (Zona Urbana)',
    color: '#3b82f6', // blue
    points: '20,40 45,40 55,60 40,80 15,75',
    operator: 'Eng. Roberto Santos',
    bombasCount: 2,
    reservatoriosCount: 1,
    medidoresCount: 2
  },
  {
    id: 'norte',
    name: 'Região Norte (Aparecida/São José)',
    color: '#10b981', // green
    points: '45,15 80,15 80,45 45,40',
    operator: 'Sup. Alzira Melo',
    bombasCount: 1,
    reservatoriosCount: 1,
    medidoresCount: 2
  },
  {
    id: 'sul',
    name: 'Região Sul (Liberdade/Terra Preta)',
    color: '#f59e0b', // amber
    points: '10,40 45,40 40,80 10,80',
    operator: 'Téc. Fernando Lima',
    bombasCount: 1,
    reservatoriosCount: 1,
    medidoresCount: 1
  },
  {
    id: 'rural',
    name: 'Expansão & Zona Rural',
    color: '#8b5cf6', // purple
    points: '80,15 95,15 95,75 55,60',
    operator: 'Téc. Jander Pereira',
    bombasCount: 1,
    reservatoriosCount: 0,
    medidoresCount: 1
  }
];

// Initial equipment list
export const INITIAL_EQUIPMENT: Equipment[] = [
  // PUMPS
  {
    id: 'B-01',
    name: 'Captação Solimões - Bomba 1',
    type: 'bomba',
    regionId: 'centro',
    status: 'automatico',
    lastCommunication: new Date(Date.now() - 4000).toISOString(),
    x: 15,
    y: 85,
    hoursWorked: 4325,
    voltage: 380,
    current: 124,
    power: 74.5,
    powerFactor: 0.86,
    temperature: 58.2,
    vibration: 2.1,
    numStarts: 145,
    timeSinceLastStart: 340,
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-05-12',
    controlMode: 'automatico',
    controlLocation: 'remoto',
    pressure: 4.2,
    pressureLimitLow: 1.0,
    pressureLimitHigh: 6.0,
    flowRate: 150 // L/s
  },
  {
    id: 'B-02',
    name: 'Booster Liberdade - B-02',
    type: 'booster',
    regionId: 'sul',
    status: 'ligada',
    lastCommunication: new Date(Date.now() - 2000).toISOString(),
    x: 28,
    y: 58,
    hoursWorked: 1892,
    voltage: 378,
    current: 48,
    power: 28.3,
    powerFactor: 0.84,
    temperature: 42.1,
    vibration: 1.4,
    numStarts: 94,
    timeSinceLastStart: 120,
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-06-01',
    controlMode: 'manual',
    controlLocation: 'remoto',
    pressure: 2.8,
    pressureLimitLow: 0.8,
    pressureLimitHigh: 4.5,
    flowRate: 45 // L/s
  },
  {
    id: 'B-03',
    name: 'Estação Elevatória Aparecida - B-03',
    type: 'bomba',
    regionId: 'norte',
    status: 'ligada',
    lastCommunication: new Date(Date.now() - 1000).toISOString(),
    x: 62,
    y: 28,
    hoursWorked: 5120,
    voltage: 382,
    current: 135,
    power: 82.1,
    powerFactor: 0.87,
    temperature: 64.5,
    vibration: 4.8, // High vibration
    numStarts: 322,
    timeSinceLastStart: 45,
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-04-18',
    controlMode: 'automatico',
    controlLocation: 'remoto',
    pressure: 5.1,
    pressureLimitLow: 1.5,
    pressureLimitHigh: 7.0,
    flowRate: 110 // L/s
  },
  {
    id: 'B-04',
    name: 'Recalque Reservatório Novo Manacapuru',
    type: 'bomba',
    regionId: 'rural',
    status: 'desligada',
    lastCommunication: new Date(Date.now() - 5000).toISOString(),
    x: 82,
    y: 45,
    hoursWorked: 843,
    voltage: 0,
    current: 0,
    power: 0,
    powerFactor: 0,
    temperature: 28.4,
    vibration: 0,
    numStarts: 38,
    timeSinceLastStart: 1440,
    photoUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-06-20',
    controlMode: 'manual',
    controlLocation: 'local',
    pressure: 0,
    pressureLimitLow: 1.0,
    pressureLimitHigh: 5.0,
    flowRate: 0 // L/s
  },
  {
    id: 'B-05',
    name: 'Bomba Reserva Captação - B-05',
    type: 'bomba',
    regionId: 'centro',
    status: 'manutencao',
    lastCommunication: new Date(Date.now() - 120000).toISOString(),
    x: 12,
    y: 82,
    hoursWorked: 3200,
    voltage: 0,
    current: 0,
    power: 0,
    powerFactor: 0,
    temperature: 25.0,
    vibration: 0,
    numStarts: 84,
    timeSinceLastStart: 18000,
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-07-15', // In maintenance since yesterday
    controlMode: 'manual',
    controlLocation: 'local',
    pressure: 0,
    flowRate: 0
  },

  // WELLS (POÇOS)
  {
    id: 'P-01',
    name: 'Poço Profundo - Bairro de Fátima',
    type: 'poco',
    regionId: 'centro',
    status: 'ligada',
    lastCommunication: new Date(Date.now() - 2500).toISOString(),
    x: 48,
    y: 42,
    hoursWorked: 6241,
    voltage: 380,
    current: 28,
    power: 14.5,
    powerFactor: 0.81,
    temperature: 34.6,
    vibration: 0.8,
    numStarts: 241,
    timeSinceLastStart: 620,
    photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-01-10',
    pressure: 1.8,
    flowRate: 15
  },
  {
    id: 'P-02',
    name: 'Poço Profundo - Novo Manacapuru',
    type: 'poco',
    regionId: 'rural',
    status: 'falha', // Electrical trip fault
    lastCommunication: new Date(Date.now() - 30000).toISOString(),
    x: 90,
    y: 60,
    hoursWorked: 1120,
    voltage: 320, // Low voltage phase loss
    current: 0,
    power: 0,
    powerFactor: 0,
    temperature: 45.8,
    vibration: 0,
    numStarts: 42,
    timeSinceLastStart: 540,
    photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-06-15',
    pressure: 0,
    flowRate: 0
  },

  // RESERVOIRS
  {
    id: 'R-01',
    name: 'Reservatório Central Apoiado - SAAE Centro',
    type: 'reservatorio',
    regionId: 'centro',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 3000).toISOString(),
    x: 35,
    y: 65,
    level: 78.4, // %
    volume: 3920, // m³
    capacity: 5000, // m³
    inletFlow: 150, // L/s (from B-01)
    outletFlow: 135, // L/s
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2025-10-14'
  },
  {
    id: 'R-02',
    name: 'Reservatório Elevado Aparecida',
    type: 'reservatorio',
    regionId: 'norte',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 1500).toISOString(),
    x: 75,
    y: 22,
    level: 42.1, // %
    volume: 842, // m³
    capacity: 2000, // m³
    inletFlow: 110, // L/s (from B-03)
    outletFlow: 125, // L/s (Exceeding input - level is dropping)
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-02-28'
  },
  {
    id: 'R-03',
    name: 'Reservatório Metálico Terra Preta',
    type: 'reservatorio',
    regionId: 'sul',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 2200).toISOString(),
    x: 15,
    y: 48,
    level: 89.5, // %
    volume: 1342, // m³
    capacity: 1500, // m³
    inletFlow: 45, // L/s (from B-02)
    outletFlow: 38, // L/s
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400',
    lastMaintenance: '2026-03-12'
  },

  // PRESSURE METERS (MEDIDORES DE PRESSÃO)
  {
    id: 'MP-01',
    name: 'Transmissor Pressão Saída ETA Centro',
    type: 'pressao',
    regionId: 'centro',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 4000).toISOString(),
    x: 42,
    y: 72,
    pressure: 3.8, // mca
    pressureLimitLow: 1.5,
    pressureLimitHigh: 6.0
  },
  {
    id: 'MP-02',
    name: 'Transmissor Pressão Rede Aparecida',
    type: 'pressao',
    regionId: 'norte',
    status: 'pressao_baixa', // Low pressure warning
    lastCommunication: new Date(Date.now() - 2000).toISOString(),
    x: 55,
    y: 32,
    pressure: 1.2, // mca (Below 1.5 threshold!)
    pressureLimitLow: 1.5,
    pressureLimitHigh: 5.5
  },
  {
    id: 'MP-03',
    name: 'Transmissor Pressão Rede Zona Rural',
    type: 'pressao',
    regionId: 'rural',
    status: 'pressao_critica', // Critical low pressure!
    lastCommunication: new Date(Date.now() - 1000).toISOString(),
    x: 88,
    y: 35,
    pressure: 0.4, // mca (Critical!)
    pressureLimitLow: 1.2,
    pressureLimitHigh: 5.0
  },

  // FLOW METERS (MEDIDORES DE VAZÃO)
  {
    id: 'MV-01',
    name: 'Macromedidor Vazão Saída ETA Centro',
    type: 'vazao',
    regionId: 'centro',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 3000).toISOString(),
    x: 30,
    y: 74,
    flowRate: 148 // L/s
  },
  {
    id: 'MV-02',
    name: 'Macromedidor Setor Aparecida Norte',
    type: 'vazao',
    regionId: 'norte',
    status: 'pressao_normal',
    lastCommunication: new Date(Date.now() - 2000).toISOString(),
    x: 68,
    y: 22,
    flowRate: 108 // L/s
  },

  // VALVES (VÁLVULAS)
  {
    id: 'VAL-01',
    name: 'Válvula Controle Entrada R-01 Centro',
    type: 'valvula',
    regionId: 'centro',
    status: 'aberta',
    lastCommunication: new Date(Date.now() - 3500).toISOString(),
    x: 31,
    y: 67,
    valveOpen: true
  },
  {
    id: 'VAL-02',
    name: 'Válvula Controle Redutora Norte',
    type: 'valvula',
    regionId: 'norte',
    status: 'fechada',
    lastCommunication: new Date(Date.now() - 4000).toISOString(),
    x: 71,
    y: 24,
    valveOpen: false
  }
];

// Pipelines linking equipment (for mapping)
export const INITIAL_PIPELINES: Pipeline[] = [
  { id: 'PL-01', fromId: 'B-01', toId: 'R-01', points: '15,85 30,74 35,65', status: 'normal' },
  { id: 'PL-02', fromId: 'R-01', toId: 'B-02', points: '35,65 28,58', status: 'normal' },
  { id: 'PL-03', fromId: 'B-02', toId: 'R-03', points: '28,58 15,48', status: 'normal' },
  { id: 'PL-04', fromId: 'R-01', toId: 'MP-01', points: '35,65 42,72', status: 'normal' },
  { id: 'PL-05', fromId: 'MP-01', toId: 'P-01', points: '42,72 48,42', status: 'normal' },
  { id: 'PL-06', fromId: 'P-01', toId: 'MP-02', points: '48,42 55,32', status: 'baixa_pressao' },
  { id: 'PL-07', fromId: 'MP-02', toId: 'B-03', points: '55,32 62,28', status: 'baixa_pressao' },
  { id: 'PL-08', fromId: 'B-03', toId: 'R-02', points: '62,28 71,24 75,22', status: 'normal' },
  { id: 'PL-09', fromId: 'R-02', toId: 'MP-03', points: '75,22 88,35', status: 'falha' },
  { id: 'PL-10', fromId: 'P-02', toId: 'MP-03', points: '90,60 88,35', status: 'sem_comunicacao' },
];

// Preset Alarms
export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'ALM-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    equipmentId: 'B-03',
    equipmentName: 'Estação Elevatória Aparecida - B-03',
    description: 'Vibração excessiva no motor (4.8 mm/s - Limite: 4.0)',
    severity: 'alto',
    status: 'ativo',
    openDuration: 900
  },
  {
    id: 'ALM-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 mins ago
    equipmentId: 'MP-03',
    equipmentName: 'Transmissor Pressão Rede Zona Rural',
    description: 'Pressão de rede crítica abaixo do limite mínimo (0.4 mca)',
    severity: 'critico',
    status: 'ativo',
    openDuration: 1920
  },
  {
    id: 'ALM-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    equipmentId: 'P-02',
    equipmentName: 'Poço Profundo - Novo Manacapuru',
    description: 'Relé Térmico Desarmado - Sobrecarga de Fase L3',
    severity: 'critico',
    status: 'ativo',
    openDuration: 2700
  },
  {
    id: 'ALM-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 65 mins ago
    equipmentId: 'MP-02',
    equipmentName: 'Transmissor Pressão Rede Aparecida',
    description: 'Alerta: Pressão de rede baixa (1.2 mca - Esperado: >1.5)',
    severity: 'medio',
    status: 'ativo',
    openDuration: 3900
  },
  {
    id: 'ALM-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    equipmentId: 'R-02',
    equipmentName: 'Reservatório Elevado Aparecida',
    description: 'Nível abaixo do limite operacional (42.1%)',
    severity: 'medio',
    status: 'reconhecido',
    responsible: 'Operador João Silva',
    openDuration: 7200
  }
];

// Preset Event Log
export const INITIAL_EVENTS: EventLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    username: 'Operador João Silva',
    equipmentId: 'B-03',
    type: 'comando',
    description: 'Acionamento remoto da Bomba B-03 em modo automático.',
    oldValue: 'desligada',
    newValue: 'automatico'
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    username: 'Operador João Silva',
    equipmentId: 'VAL-02',
    type: 'comando',
    description: 'Fechamento de válvula reguladora de rede VAL-02.',
    oldValue: 'aberta',
    newValue: 'fechada'
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    username: 'Sistema SCADA',
    equipmentId: 'B-03',
    type: 'alarme',
    description: 'Alarme de Vibração Alta ativo (4.8 mm/s).'
  },
  {
    id: 'LOG-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    username: 'Sistema SCADA',
    equipmentId: 'MP-03',
    type: 'alarme',
    description: 'Alarme Crítico de Pressão Baixa ativo (0.4 mca).'
  },
  {
    id: 'LOG-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    username: 'Sistema SCADA',
    equipmentId: 'P-02',
    type: 'alarme',
    description: 'Falha no Poço Profundo P-02: Relé Térmico Desarmado.'
  },
  {
    id: 'LOG-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    username: 'Supervisor Roberto',
    equipmentId: 'R-02',
    type: 'comando',
    description: 'Reconhecimento de alarme de Nível Baixo R-02.'
  },
  {
    id: 'LOG-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    username: 'Administrador SAAE',
    equipmentId: 'B-05',
    type: 'cadastro',
    description: 'Equipamento B-05 colocado em manutenção programada.',
    oldValue: 'desligada',
    newValue: 'manutencao'
  }
];

// Helper to generate dynamic mock history for charting (24 hours, 7 days, 30 days)
export function generateHistoryData(equipmentId: string, days: number = 1): any[] {
  const data: any[] = [];
  const now = new Date();
  const pointCount = days === 1 ? 24 : days === 7 ? 7 : 30;
  
  // Seed random generators based on equipmentId to make it consistent but distinct
  const hash = equipmentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = pointCount; i >= 0; i--) {
    const time = new Date(now.getTime() - i * (days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const label = days === 1 
      ? time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : time.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    // Default metrics
    let val1 = 0; // Primary metric (pressure, flow, level, temperature)
    let val2 = 0; // Secondary metric (voltage, current, inlet, vibration)
    
    // Vary based on equipment ID hash and type
    const factor = Math.sin((i + hash) * 0.5);
    const noise = Math.cos((i * 2 + hash) * 0.3) * 0.1;
    
    if (equipmentId.startsWith('B-') || equipmentId.startsWith('P-')) {
      // Pump, Booster, Well: Voltage, current, temperature, vibration
      const isOff = i % 8 === 0 && equipmentId !== 'B-03'; // simulate cycle off
      
      if (isOff) {
        val1 = 28 + factor * 2; // Ambient temp
        val2 = 0; // No vibration / flow
      } else {
        // Temperature (motor)
        val1 = 50 + factor * 10 + noise * 5;
        // Flow rate or vibration
        val2 = equipmentId === 'B-03' 
          ? 4.0 + (factor * 0.6) + (i === 0 ? 0.8 : 0) // high vibration near present
          : 1.5 + factor * 0.3 + noise * 0.1;
      }
    } else if (equipmentId.startsWith('R-')) {
      // Reservoir: Level %, Volume m³
      const baseLevel = equipmentId === 'R-01' ? 75 : equipmentId === 'R-02' ? 45 : 85;
      val1 = Math.max(15, Math.min(100, baseLevel + factor * 12 + noise * 2));
      const capacity = equipmentId === 'R-01' ? 5000 : equipmentId === 'R-02' ? 2000 : 1500;
      val2 = Math.round((val1 / 100) * capacity);
    } else if (equipmentId.startsWith('MP-')) {
      // Pressure sensor: mca
      const basePress = equipmentId === 'MP-01' ? 3.5 : equipmentId === 'MP-02' ? 1.4 : 0.6;
      val1 = Math.max(0.1, basePress + factor * 0.4 + noise * 0.1);
      val2 = val1 * 1.422; // PSI conversion
    } else if (equipmentId.startsWith('MV-')) {
      // Flow meter: L/s
      const baseFlow = equipmentId === 'MV-01' ? 140 : 100;
      val1 = Math.max(0, baseFlow + factor * 15 + noise * 3);
      val2 = val1 * 3.6; // m³/h
    } else {
      // Valves
      val1 = equipmentId === 'VAL-01' ? 100 : 0; // Open %
      val2 = val1 > 0 ? 120 + factor * 10 : 0; // flow through valve
    }
    
    data.push({
      timestamp: time.toISOString(),
      label,
      metric1: parseFloat(val1.toFixed(1)),
      metric2: parseFloat(val2.toFixed(1))
    });
  }
  
  return data;
}
