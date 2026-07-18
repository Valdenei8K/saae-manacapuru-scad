import { Equipment, Region, Alarm, EventLog, Pipeline } from './types';

// Regions of Manacapuru
export const INITIAL_REGIONS: Region[] = [
  { id: 'norte', name: 'Região Norte (Aparecida/São José)', color: '#10b981', points: '56.4,14.3 70.4,2.4 80,15 100.6,40.6 96.2,70.9 60.3,58.3 50,55.6 53.5,45.4', operator: 'Sup. Alzira Melo', bombasCount: 1, reservatoriosCount: 1, medidoresCount: 2 },
  { id: 'REG-429', name: 'Nova Região REG-429', color: '#19e025', points: '40,20 60,20 50,50', operator: 'Novo Responsável', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 },
  { id: 'REG-129', name: 'Nova Região REG-129', color: '#a17b05', points: '40,20 60,20 50,50', operator: 'Novo Responsável', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 },
  { id: 'REG-967', name: 'Nova Região REG-967', color: '#8779a1', points: '40,20 60,20 50,50', operator: 'Novo Responsável', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 },
  { id: 'REG-208', name: 'Nova Região REG-208', color: '#fc42b4', points: '40,20 60,20 50,50', operator: 'Novo Responsável', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 },
  { id: 'REG-639', name: 'Nova Região REG-639', color: '#aca112', points: '40,20 38.6,-8.4 67.2,2 54.4,19.7 50,50', operator: 'Coord. Jose Azevedo.', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 },
  { id: 'REG-263', name: 'Nova Região REG-263', color: '#f8d895', points: '-2.3,8 36.5,-10 41.6,16.6 34.7,45.8 21.3,40.3', operator: 'Novo Responsável', bombasCount: 0, reservatoriosCount: 0, medidoresCount: 0 }
];

// Initial equipment list
export const INITIAL_EQUIPMENT: Equipment[] = [
  {"id":"B-01","name":"Captação Solimões - Bomba 1","type":"bomba","regionId":"centro","status":"automatico","lastCommunication":"2026-07-18T01:29:50.808Z","x":28.8,"y":42.49,"hoursWorked":4325.4096,"voltage":378,"current":121,"power":67.3,"powerFactor":0.83,"temperature":54.1,"vibration":1.6,"numStarts":145,"timeSinceLastStart":340,"photoUrl":"https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-05-12","controlMode":"automatico","controlLocation":"remoto","pressure":4.2,"pressureLimitLow":1,"pressureLimitHigh":6,"flowRate":150.4},
  {"id":"B-02","name":"Booster Liberdade - B-02","type":"booster","regionId":"sul","status":"ligada","lastCommunication":"2026-07-18T01:29:50.808Z","x":32.45,"y":0.7,"hoursWorked":1892.4096,"voltage":382,"current":35,"power":19.7,"powerFactor":0.83,"temperature":53.9,"vibration":1.5,"numStarts":94,"timeSinceLastStart":120,"photoUrl":"https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-06-01","controlMode":"manual","controlLocation":"remoto","pressure":2.5,"pressureLimitLow":0.8,"pressureLimitHigh":4.5,"flowRate":45.1},
  {"id":"B-03","name":"Estação Elevatória Aparecida - B-03","type":"bomba","regionId":"norte","status":"ligada","lastCommunication":"2026-07-18T01:29:50.808Z","x":62,"y":28,"hoursWorked":5120.4096,"voltage":376,"current":87,"power":48.1,"powerFactor":0.85,"temperature":63.8,"vibration":4.5,"numStarts":322,"timeSinceLastStart":45,"photoUrl":"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-04-18","controlMode":"automatico","controlLocation":"remoto","pressure":4.8,"pressureLimitLow":1.5,"pressureLimitHigh":7,"flowRate":109.9},
  {"id":"B-04","name":"Recalque Reservatório Novo Manacapuru","type":"bomba","regionId":"rural","status":"desligada","lastCommunication":"2026-07-18T01:29:50.808Z","x":89.74,"y":43.24,"hoursWorked":843,"voltage":0,"current":0,"power":0,"powerFactor":0,"temperature":25.3,"vibration":0,"numStarts":38,"timeSinceLastStart":1440,"photoUrl":"https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-06-20","controlMode":"manual","controlLocation":"local","pressure":0,"pressureLimitLow":1,"pressureLimitHigh":5,"flowRate":0},
  {"id":"B-05","name":"Bomba Reserva Captação - B-05","type":"bomba","regionId":"centro","status":"manutencao","lastCommunication":"2026-07-18T01:29:50.808Z","x":-58.75,"y":-27.42,"hoursWorked":3200,"voltage":0,"current":0,"power":0,"powerFactor":0,"temperature":25,"vibration":0,"numStarts":84,"timeSinceLastStart":18000,"photoUrl":"https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-07-15","controlMode":"manual","controlLocation":"local","pressure":0,"flowRate":0},
  {"id":"P-01","name":"Poço Profundo - Bairro de Fátima","type":"poco","regionId":"centro","status":"ligada","lastCommunication":"2026-07-18T01:29:50.808Z","x":48,"y":42,"hoursWorked":6241.4096,"voltage":380,"current":14,"power":7.8,"powerFactor":0.85,"temperature":53.9,"vibration":1.5,"numStarts":241,"timeSinceLastStart":620,"photoUrl":"https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-01-10","pressure":2.5,"flowRate":14.8},
  {"id":"P-02","name":"Poço Profundo - Novo Manacapuru","type":"poco","regionId":"rural","status":"falha","lastCommunication":"2026-07-18T01:29:50.808Z","x":91.88,"y":73.34,"hoursWorked":1120,"voltage":0,"current":0,"power":0,"powerFactor":0,"temperature":25.3,"vibration":0,"numStarts":42,"timeSinceLastStart":540,"photoUrl":"https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-06-15","pressure":0,"flowRate":0},
  {"id":"R-01","name":"Reservatório Central Apoiado - SAAE Centro","type":"reservatorio","regionId":"centro","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":26.44,"y":12.91,"level":78.4,"volume":3920,"capacity":5000,"inletFlow":150.1,"outletFlow":135,"photoUrl":"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2025-10-14"},
  {"id":"R-02","name":"Reservatório Elevado Aparecida","type":"reservatorio","regionId":"norte","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":75,"y":22,"level":42.1,"volume":842,"capacity":2000,"inletFlow":110.2,"outletFlow":125,"photoUrl":"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-02-28"},
  {"id":"R-03","name":"Reservatório Metálico Terra Preta","type":"reservatorio","regionId":"sul","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":-19.91,"y":-7.22,"level":89.5,"volume":1342,"capacity":1500,"inletFlow":45,"outletFlow":38,"photoUrl":"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400","lastMaintenance":"2026-03-12"},
  {"id":"MP-01","name":"Transmissor Pressão Saída ETA Centro","type":"pressao","regionId":"centro","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":46.18,"y":17.17,"pressure":3.8,"pressureLimitLow":1.5,"pressureLimitHigh":6},
  {"id":"MP-02","name":"Transmissor Pressão Rede Aparecida","type":"pressao","regionId":"norte","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":55,"y":32,"pressure":4,"pressureLimitLow":1.5,"pressureLimitHigh":5.5},
  {"id":"MP-03","name":"Transmissor Pressão Rede Zona Rural","type":"pressao","regionId":"rural","status":"pressao_critica","lastCommunication":"2026-07-18T01:29:50.808Z","x":67.42,"y":59.64,"pressure":0.4,"pressureLimitLow":1.2,"pressureLimitHigh":5},
  {"id":"MV-01","name":"Macromedidor Vazão Saída ETA Centro","type":"vazao","regionId":"centro","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":21.72,"y":31.53,"flowRate":147.8},
  {"id":"MV-02","name":"Macromedidor Setor Aparecida Norte","type":"vazao","regionId":"norte","status":"pressao_normal","lastCommunication":"2026-07-18T01:29:50.808Z","x":68,"y":22,"flowRate":108.2},
  {"id":"VAL-01","name":"Válvula Controle Entrada R-01 Centro","type":"valvula","regionId":"centro","status":"aberta","lastCommunication":"2026-07-18T01:29:50.808Z","x":4.98,"y":29.18,"valveOpen":true},
  {"id":"VAL-02","name":"Válvula Controle Redutora Norte","type":"valvula","regionId":"norte","status":"fechada","lastCommunication":"2026-07-18T01:29:50.808Z","x":71,"y":24,"valveOpen":false}
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
