export type EquipmentType = 'bomba' | 'booster' | 'reservatorio' | 'poco' | 'pressao' | 'vazao' | 'nivel' | 'valvula';

export type EquipmentStatus = 
  | 'ligada' 
  | 'automatico' 
  | 'desligada' 
  | 'manutencao' 
  | 'falha' 
  | 'alarme_critico'
  | 'pressao_normal' 
  | 'pressao_baixa' 
  | 'pressao_critica'
  | 'aberta'
  | 'fechada';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  regionId: string;
  status: EquipmentStatus;
  lastCommunication: string;
  x: number; // Percentage on SVG (0-100)
  y: number; // Percentage on SVG (0-100)
  
  // Electrical / Operational metrics (for pumps/boosters/wells)
  hoursWorked?: number;
  voltage?: number; // V
  current?: number; // A
  power?: number; // kW
  powerFactor?: number;
  temperature?: number; // °C
  vibration?: number; // mm/s
  numStarts?: number;
  timeSinceLastStart?: number; // minutes
  photoUrl?: string;
  lastMaintenance?: string;
  controlMode?: 'manual' | 'automatico';
  controlLocation?: 'local' | 'remoto';

  // Hydraulic metrics (for flow, level, pressure sensors and reservoirs)
  pressure?: number; // mca (meters of water column)
  pressureLimitLow?: number;
  pressureLimitHigh?: number;
  flowRate?: number; // L/s
  level?: number; // %
  volume?: number; // m³
  capacity?: number; // m³
  inletFlow?: number; // L/s
  outletFlow?: number; // L/s
  valveOpen?: boolean;
}

export interface Region {
  id: string;
  name: string;
  color: string;
  points: string; // SVG path or polygon points e.g. "20,10 40,12 35,30..."
  operator: string;
  bombasCount: number;
  reservatoriosCount: number;
  medidoresCount: number;
}

export type AlarmSeverity = 'critico' | 'alto' | 'medio' | 'baixo';
export type AlarmStatus = 'ativo' | 'reconhecido';

export interface Alarm {
  id: string;
  timestamp: string;
  equipmentId: string;
  equipmentName: string;
  description: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  responsible?: string;
  openDuration: number; // seconds
}

export interface EventLog {
  id: string;
  timestamp: string;
  username: string;
  equipmentId?: string;
  type: 'comando' | 'sistema' | 'alarme' | 'cadastro' | 'acesso';
  description: string;
  oldValue?: string;
  newValue?: string;
}

export type UserProfile = 'admin' | 'operator' | 'supervisor' | 'visitor';

export interface Pipeline {
  id: string;
  fromId: string;
  toId: string;
  points: string; // SVG polyline points "x1,y1 x2,y2"
  status: 'normal' | 'baixa_pressao' | 'falha' | 'sem_comunicacao';
}
