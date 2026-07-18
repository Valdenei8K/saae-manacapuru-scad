import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Map as MapIcon, 
  Tv, 
  TrendingUp, 
  Clock, 
  FileText, 
  Volume2, 
  VolumeX, 
  Settings, 
  Activity, 
  UserCheck, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { Equipment, Region, Pipeline, Alarm, EventLog, UserProfile, EquipmentStatus } from './types';
import { INITIAL_REGIONS, INITIAL_EQUIPMENT, INITIAL_PIPELINES, INITIAL_ALARMS, INITIAL_EVENTS } from './data';

// Component Imports
import InteractiveMap from './components/InteractiveMap';
import EquipmentSidebar from './components/EquipmentSidebar';
import OperationalDashboard from './components/OperationalDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import HistoryLog from './components/HistoryLog';
import ReportsPanel from './components/ReportsPanel';

export default function App() {
  // Main states
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('saae_equipment_list');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });
  const [regionsList, setRegionsList] = useState<Region[]>(() => {
    const saved = localStorage.getItem('saae_regions_list');
    return saved ? JSON.parse(saved) : INITIAL_REGIONS;
  });
  const [pipelinesList, setPipelinesList] = useState<Pipeline[]>(() => {
    const saved = localStorage.getItem('saae_pipelines_list');
    return saved ? JSON.parse(saved) : INITIAL_PIPELINES;
  });
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>(INITIAL_ALARMS);

  // Sync state changes with Local Storage
  useEffect(() => {
    localStorage.setItem('saae_equipment_list', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('saae_regions_list', JSON.stringify(regionsList));
  }, [regionsList]);

  useEffect(() => {
    localStorage.setItem('saae_pipelines_list', JSON.stringify(pipelinesList));
  }, [pipelinesList]);
  const [events, setEvents] = useState<EventLog[]>(INITIAL_EVENTS);
  const [userProfile, setUserProfile] = useState<UserProfile>('operator');
  const [activeTab, setActiveTab] = useState<'mapa' | 'dashboard' | 'executivo' | 'historico' | 'relatorios'>('mapa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Selection and hover states for equipment
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [hoveredEquipment, setHoveredEquipment] = useState<Equipment | null>(null);
  
  // Try to load persisted data from central API if available (Vite: VITE_API_URL)
  useEffect(() => {
    const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
    const fetchRemote = async () => {
      try {
        const eqRes = await fetch((API_BASE || '') + '/api/equipment');
        if (eqRes.ok) {
          const eq = await eqRes.json();
          if (Array.isArray(eq) && eq.length) setEquipmentList(eq);
        }
        const rgRes = await fetch((API_BASE || '') + '/api/regions');
        if (rgRes.ok) {
          const rg = await rgRes.json();
          if (Array.isArray(rg) && rg.length) setRegionsList(rg);
        }
        const plRes = await fetch((API_BASE || '') + '/api/pipelines');
        if (plRes.ok) {
          const pl = await plRes.json();
          if (Array.isArray(pl) && pl.length) setPipelinesList(pl);
        }
      } catch (e) {
        // API not available; keep using localStorage fallback
        console.warn('Central API not reachable, using localStorage fallback');
      }
    };
    fetchRemote();
  }, []);

  // Simulation controls
  const [simSpeed, setSimSpeed] = useState<'off' | '1x' | '5x'>('1x');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  
  // Audio context for SCADA alarm buzzer
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sync selected equipment reference if list updates
  useEffect(() => {
    if (selectedEquipment) {
      const updated = equipmentList.find(e => e.id === selectedEquipment.id);
      if (updated) {
        setSelectedEquipment(updated);
      }
    }
  }, [equipmentList, selectedEquipment]);

  // SCADA Buzz siren tone when there are critical/high active alarms
  useEffect(() => {
    const criticalAlarms = activeAlarms.filter(a => a.status === 'ativo' && (a.severity === 'critico' || a.severity === 'alto'));
    const hasAlarmTrigger = criticalAlarms.length > 0;

    if (soundEnabled && hasAlarmTrigger) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        // Create oscillator if not already buzzing
        if (!oscillatorRef.current) {
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();

          osc.type = 'sine';
          // Alternating alarm frequency
          osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
          
          // Siren effect: sweep frequency up and down
          const timer = setInterval(() => {
            if (oscillatorRef.current && audioContextRef.current) {
              const freq = osc.frequency.value === 440 ? 580 : 440;
              osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
            } else {
              clearInterval(timer);
            }
          }, 600);

          gain.gain.setValueAtTime(0.04, audioContextRef.current.currentTime); // very subtle safe volume
          
          osc.connect(gain);
          gain.connect(audioContextRef.current.destination);
          
          osc.start();
          oscillatorRef.current = osc;
          gainNodeRef.current = gain;
        }
      } catch (err) {
        console.warn('Audio Context error:', err);
      }
    } else {
      // Turn off buzzer
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch(e){}
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e){}
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    };
  }, [activeAlarms, soundEnabled]);

  // SIMULATION INTERVAL ENGINE
  useEffect(() => {
    if (simSpeed === 'off') return;

    const intervalMs = simSpeed === '1x' ? 3000 : 800;
    
    const interval = setInterval(() => {
      setEquipmentList(prevList => {
        return prevList.map(eq => {
          // Clone item
          const updated = { ...eq };
          const noise = (Math.random() - 0.5) * 0.1;
          const randomFactor = Math.random();

          // Update communication heartbeat timestamp
          updated.lastCommunication = new Date().toISOString();

          // 1. SIMULATE RESERVOIRS LEVEL FLUXES
          if (updated.type === 'reservatorio') {
            const level = updated.level || 50;
            const capacity = updated.capacity || 2000;
            const inFlow = updated.inletFlow || 0;
            const outFlow = updated.outletFlow || 0;

            // level delta in % based on inflow - outflow (L/s)
            // L/s to m³ in 3 seconds: L * 3 / 1000
            const volumeDelta = ((inFlow - outFlow) * (intervalMs / 1000)) / 1000;
            const currentVolume = updated.volume || (level / 100) * capacity;
            
            const nextVolume = Math.max(0, Math.min(capacity, currentVolume + volumeDelta));
            const nextLevel = parseFloat(((nextVolume / capacity) * 100).toFixed(1));

            updated.volume = Math.round(nextVolume);
            updated.level = nextLevel;

            // Trigger warnings based on levels
            if (nextLevel < 25 && eq.status !== 'pressao_baixa') {
              updated.status = 'pressao_baixa';
              triggerAlarm(eq.id, eq.name, `Reservatório atingiu nível baixo crítico (${nextLevel}%)`, 'medio');
            } else if (nextLevel >= 25 && nextLevel < 95 && eq.status !== 'pressao_normal') {
              updated.status = 'pressao_normal';
            } else if (nextLevel >= 95 && eq.status !== 'pressao_critica') {
              updated.status = 'pressao_critica';
              triggerAlarm(eq.id, eq.name, `Alerta de transbordo: Nível do reservatório extremamente alto (${nextLevel}%)`, 'alto');
            }
          }

          // 2. SIMULATE MOTOR TEMPERATURES / RUN TIME (Pumps, Booster, Wells)
          if (updated.type === 'bomba' || updated.type === 'booster' || updated.type === 'poco') {
            const isWorking = updated.status === 'ligada' || updated.status === 'automatico';

            if (isWorking) {
              // Drift hours worked
              updated.hoursWorked = parseFloat(((updated.hoursWorked || 0) + (intervalMs / 3600000)).toFixed(4));
              
              // Heating up motor
              const targetTemp = updated.id === 'B-03' ? 64 : 54; // B-03 runs hot
              updated.temperature = parseFloat(Math.min(95, (updated.temperature || 30) + (targetTemp - (updated.temperature || 30)) * 0.15 + noise * 3).toFixed(1));
              
              // Vibration noise
              const baseVib = updated.id === 'B-03' ? 4.5 : 1.5; // B-03 has high vibration
              updated.vibration = parseFloat(Math.max(0.1, baseVib + noise * 1.5).toFixed(1));

              // Flow dynamic updates
              const baseFlow = updated.id === 'B-01' ? 150 : updated.id === 'B-03' ? 110 : updated.id === 'P-01' ? 15 : 45;
              updated.flowRate = parseFloat(Math.max(0, baseFlow + noise * 8).toFixed(1));

              // Electrical variations
              updated.voltage = Math.round(380 + (Math.random() - 0.5) * 8);
              updated.current = Math.round((updated.flowRate * 0.8) + (Math.random() - 0.5) * 4);
              updated.power = parseFloat(((updated.voltage * updated.current * 1.73 * 0.85) / 1000).toFixed(1));
              updated.powerFactor = parseFloat((0.84 + (Math.random() - 0.5) * 0.03).toFixed(2));

              // Simulate dynamic pressures
              const basePress = updated.id === 'B-03' ? 4.8 : updated.id === 'B-01' ? 4.1 : 2.5;
              updated.pressure = parseFloat(Math.max(0.1, basePress + noise * 1.2).toFixed(1));

              // Trigger vibration high alarm
              if (updated.vibration > 4.5 && updated.id === 'B-03') {
                const hasActiveVibAlm = activeAlarms.some(a => a.equipmentId === 'B-03' && a.description.includes('Vibração') && a.status === 'ativo');
                if (!hasActiveVibAlm) {
                  triggerAlarm('B-03', 'Estação Elevatória Aparecida - B-03', `Vibração anômala detectada no mancal superior (${updated.vibration} mm/s)`, 'alto');
                }
              }
            } else {
              // Cooling down motor
              updated.temperature = parseFloat(Math.max(25, (updated.temperature || 25) - ((updated.temperature || 25) - 25) * 0.15).toFixed(1));
              updated.vibration = 0;
              updated.flowRate = 0;
              updated.voltage = 0;
              updated.current = 0;
              updated.power = 0;
              updated.powerFactor = 0;
              updated.pressure = 0;
            }
          }

          // 3. PRESSURE SENSORS DRIFT BASED ON PIPELINE FEED
          if (updated.type === 'pressao') {
            // Find feeding pumps to calculate network pressure
            const b03 = prevList.find(e => e.id === 'B-03');
            const p02 = prevList.find(e => e.id === 'P-02');
            
            if (updated.id === 'MP-02') {
              // Aparecida pressure relies on B-03 running
              const b03On = b03 && (b03.status === 'ligada' || b03.status === 'automatico');
              const targetPress = b03On ? 4.1 : 0.8;
              updated.pressure = parseFloat(Math.max(0.1, (updated.pressure || 0.5) + (targetPress - (updated.pressure || 0.5)) * 0.2 + noise * 0.4).toFixed(1));
              
              if (updated.pressure < 1.5 && updated.status !== 'pressao_baixa') {
                updated.status = 'pressao_baixa';
                triggerAlarm(updated.id, updated.name, `Pressão baixa na rede Aparecida (${updated.pressure} mca)`, 'medio');
              } else if (updated.pressure >= 1.5 && updated.status !== 'pressao_normal') {
                updated.status = 'pressao_normal';
              }
            }

            if (updated.id === 'MP-03') {
              // Rural pressure relies on Poço P-02 running
              const p02On = p02 && (p02.status === 'ligada' || p02.status === 'automatico');
              const targetPress = p02On ? 3.2 : 0.4;
              updated.pressure = parseFloat(Math.max(0.1, (updated.pressure || 0.4) + (targetPress - (updated.pressure || 0.4)) * 0.25 + noise * 0.3).toFixed(1));

              if (updated.pressure < 1.0 && updated.status !== 'pressao_critica') {
                updated.status = 'pressao_critica';
                triggerAlarm(updated.id, updated.name, `Pressão crítica de sub-abastecimento na Zona Rural (${updated.pressure} mca)`, 'critico');
              } else if (updated.pressure >= 1.0 && updated.status !== 'pressao_normal') {
                updated.status = 'pressao_normal';
              }
            }
          }

          // 4. FLOW METERS DRIFT
          if (updated.type === 'vazao') {
            if (updated.id === 'MV-01') {
              const b01 = prevList.find(e => e.id === 'B-01');
              const b01On = b01 && (b01.status === 'ligada' || b01.status === 'automatico');
              updated.flowRate = b01On ? parseFloat(Math.max(10, 148 + noise * 12).toFixed(1)) : 0;
            }
            if (updated.id === 'MV-02') {
              const b03 = prevList.find(e => e.id === 'B-03');
              const b03On = b03 && (b03.status === 'ligada' || b03.status === 'automatico');
              updated.flowRate = b03On ? parseFloat(Math.max(10, 108 + noise * 8).toFixed(1)) : 0;
            }
          }

          // 5. AUTOMATIC LOOP CONTROL (PLC LOGIC)
          // - R-01 (Reservatório Central) controls B-01 (Captação Solimões) in AUTO Mode
          if (updated.id === 'B-01' && updated.status === 'automatico') {
            const r01 = prevList.find(e => e.id === 'R-01');
            if (r01) {
              const rLevel = r01.level || 75;
              if (rLevel > 92 && updated.flowRate !== 0) {
                // Turn off pump to prevent spillover
                updated.flowRate = 0;
                logSystemEvent('B-01', 'Loop de Automação desligou B-01 (Reservatório R-01 Cheio: ' + rLevel + '%)', 'automatico', 'standby');
              } else if (rLevel < 40 && updated.flowRate === 0) {
                // Restart pump to refill
                updated.flowRate = 150;
                logSystemEvent('B-01', 'Loop de Automação acionou B-01 (Reservatório R-01 em Demanda: ' + rLevel + '%)', 'standby', 'automatico');
              }
            }
          }

          // - R-02 (Aparecida) controls B-03 (Elevatória Aparecida) in AUTO Mode
          if (updated.id === 'B-03' && updated.status === 'automatico') {
            const r02 = prevList.find(e => e.id === 'R-02');
            if (r02) {
              const rLevel = r02.level || 42;
              if (rLevel > 90 && updated.flowRate !== 0) {
                updated.flowRate = 0;
                logSystemEvent('B-03', 'Loop de Automação desligou B-03 (Reservatório R-02 Cheio: ' + rLevel + '%)', 'automatico', 'standby');
              } else if (rLevel < 35 && updated.flowRate === 0) {
                updated.flowRate = 110;
                logSystemEvent('B-03', 'Loop de Automação acionou B-03 (Reservatório R-02 em Demanda: ' + rLevel + '%)', 'standby', 'automatico');
              }
            }
          }

          // Map dynamic flow in and out of reservoirs based on pumps statuses
          if (updated.id === 'R-01') {
            const b01 = prevList.find(e => e.id === 'B-01');
            const b01Active = b01 && (b01.status === 'ligada' || b01.status === 'automatico');
            updated.inletFlow = b01Active ? (b01?.flowRate || 150) : 0;
            
            const b02 = prevList.find(e => e.id === 'B-02');
            const b02Active = b02 && (b02.status === 'ligada' || b02.status === 'automatico');
            updated.outletFlow = b02Active ? (b02?.flowRate || 45) + 90 : 90; // base town consumption is 90 L/s
          }

          if (updated.id === 'R-02') {
            const b03 = prevList.find(e => e.id === 'B-03');
            const b03Active = b03 && (b03.status === 'ligada' || b03.status === 'automatico');
            updated.inletFlow = b03Active ? (b03?.flowRate || 110) : 0;
          }

          if (updated.id === 'R-03') {
            const b02 = prevList.find(e => e.id === 'B-02');
            const b02Active = b02 && (b02.status === 'ligada' || b02.status === 'automatico');
            updated.inletFlow = b02Active ? (b02?.flowRate || 45) : 0;
          }

          return updated;
        });
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simSpeed, activeAlarms]);

  // TRIGGER ALARM (Helper)
  const triggerAlarm = (equipmentId: string, equipmentName: string, description: string, severity: 'critico' | 'alto' | 'medio' | 'baixo') => {
    const alarmId = 'ALM-' + Math.round(100 + Math.random() * 900);
    const newAlarm: Alarm = {
      id: alarmId,
      timestamp: new Date().toISOString(),
      equipmentId,
      equipmentName,
      description,
      severity,
      status: 'ativo',
      openDuration: 0
    };

    setActiveAlarms(prev => [newAlarm, ...prev]);
    
    // Add event log
    const logId = 'LOG-' + Math.round(100 + Math.random() * 900);
    const newLog: EventLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      username: 'Sistema SCADA',
      equipmentId,
      type: 'alarme',
      description: `Disparo de Alarme ${severity.toUpperCase()} em ${equipmentName}: ${description}`
    };
    setEvents(prev => [newLog, ...prev]);
  };

  // SYSTEM LOG (Helper)
  const logSystemEvent = (equipmentId: string, description: string, oldValue?: string, newValue?: string) => {
    const logId = 'LOG-' + Math.round(100 + Math.random() * 900);
    const newLog: EventLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      username: 'Sistema SCADA',
      equipmentId,
      type: 'sistema',
      description,
      oldValue,
      newValue
    };
    setEvents(prev => [newLog, ...prev]);
  };

  // EXECUTE USER COMMAND
  const handleCommand = (equipmentId: string, command: string, value?: string) => {
    // Audit log initialization
    const logId = 'LOG-' + Math.round(100 + Math.random() * 900);
    const username = `Operador (${userProfile.toUpperCase()})`;

    setEquipmentList(prevList => {
      return prevList.map(eq => {
        if (eq.id === equipmentId) {
          const updated = { ...eq };
          let oldVal = '';
          let newVal = '';

          if (command === 'status') {
            oldVal = eq.status;
            newVal = value || 'desligada';
            updated.status = value as any;
            
            // If turned on, increment start counts
            if (value === 'ligada' && oldVal !== 'ligada') {
              updated.numStarts = (updated.numStarts || 0) + 1;
              updated.timeSinceLastStart = 0;
            }

            // Append log
            const desc = `${username} efetuou comando remoto de chaveamento de status da bomba ${eq.id} para '${newVal.toUpperCase()}'`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'comando',
              description: desc,
              oldValue: oldVal,
              newValue: newVal
            };
            setEvents(prev => [log, ...prev]);
          }

          if (command === 'controlMode') {
            oldVal = eq.controlMode || 'manual';
            newVal = value || 'manual';
            updated.controlMode = value as any;
            
            if (value === 'automatico') {
              updated.status = 'automatico';
            } else {
              updated.status = 'desligada';
            }

            const desc = `${username} alterou o modo de malha de controle da bomba ${eq.id} de '${oldVal.toUpperCase()}' para '${newVal.toUpperCase()}'`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'comando',
              description: desc,
              oldValue: oldVal,
              newValue: newVal
            };
            setEvents(prev => [log, ...prev]);
          }

          if (command === 'controlLocation') {
            oldVal = eq.controlLocation || 'remoto';
            newVal = value || 'remoto';
            updated.controlLocation = value as any;

            const desc = `${username} redefiniu localidade de comando da bomba ${eq.id} de '${oldVal.toUpperCase()}' para '${newVal.toUpperCase()}'`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'comando',
              description: desc,
              oldValue: oldVal,
              newValue: newVal
            };
            setEvents(prev => [log, ...prev]);
          }

          if (command === 'valve') {
            oldVal = eq.status;
            newVal = value || 'fechada';
            updated.status = value as any;
            updated.valveOpen = value === 'aberta';

            const desc = `${username} emitiu comando de acionamento de válvula reguladora ${eq.id} para '${newVal.toUpperCase()}'`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'comando',
              description: desc,
              oldValue: oldVal,
              newValue: newVal
            };
            setEvents(prev => [log, ...prev]);
          }

          if (command === 'reset') {
            updated.status = 'desligada';
            
            // Clear corresponding alarms for this device
            setActiveAlarms(prev => {
              return prev.map(a => {
                if (a.equipmentId === equipmentId && a.status === 'ativo') {
                  return { ...a, status: 'reconhecido', responsible: username };
                }
                return a;
              });
            });

            const desc = `${username} enviou sinal de rearme térmico e resetou todas as falhas ativas de trip do ativo ${eq.id}`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'comando',
              description: desc,
              oldValue: 'falha',
              newValue: 'desligada (rearmada)'
            };
            setEvents(prev => [log, ...prev]);
          }

          if (command === 'observacao') {
            const desc = `${username} registrou observação no prontuário técnico: "${value}"`;
            const log: EventLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              username,
              equipmentId,
              type: 'cadastro',
              description: desc
            };
            setEvents(prev => [log, ...prev]);
          }

          return updated;
        }
        return eq;
      });
    });
  };

  // RECONHECER ALARME
  const handleAcknowledgeAlarm = (alarmId: string, operator: string) => {
    const timestamp = new Date().toISOString();
    
    setActiveAlarms(prev => {
      return prev.map(a => {
        if (a.id === alarmId) {
          // Add event log of recognition
          const logId = 'LOG-' + Math.round(100 + Math.random() * 900);
          const log: EventLog = {
            id: logId,
            timestamp,
            username: operator,
            equipmentId: a.equipmentId,
            type: 'comando',
            description: `Operador reconheceu e homologou o alarme ativo no ativo ${a.equipmentId}: "${a.description}"`
          };
          setEvents(prevEvents => [log, ...prevEvents]);

          return { ...a, status: 'reconhecido', responsible: operator };
        }
        return a;
      });
    });
  };

  // UPDATE EQUIPMENT COORDINATES (updates local state and persists to central API when available)
  const handleUpdateEquipmentCoordinates = (id: string, x: number, y: number) => {
    setEquipmentList(prevList => {
      const updated = prevList.map(eq => eq.id === id ? { ...eq, x, y } : eq);
      // Persist change to central API only for privileged profiles (e.g., admin)
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        fetch((API_BASE || '') + `/api/equipment/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated.find(e => e.id === id))
        }).catch(err => console.warn('Persisting equipment position failed', err));
      }
      return updated;
    });
  };

  // UPDATE REGION VERTEX
  const handleUpdateRegionVertex = (regionId: string, vertexIndex: number, x: number, y: number) => {
    setRegionsList(prevList => {
      const updated = prevList.map(reg => {
        if (reg.id === regionId) {
          const pts = reg.points.split(' ');
          pts[vertexIndex] = `${x},${y}`;
          return { ...reg, points: pts.join(' ') };
        }
        return reg;
      });
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const regObj = updated.find(r => r.id === regionId);
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        if (regObj) {
          fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(regionId)}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regObj)
          }).catch(err => console.warn('Persisting region failed', err));
        }
      }
      return updated;
    });
  };

  // ADD REGION VERTEX
  const handleAddRegionVertex = (regionId: string, vertexIndex: number, x: number, y: number) => {
    setRegionsList(prevList => {
      const updated = prevList.map(reg => {
        if (reg.id === regionId) {
          const pts = reg.points.split(' ');
          pts.splice(vertexIndex, 0, `${x},${y}`);
          return { ...reg, points: pts.join(' ') };
        }
        return reg;
      });
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const regObj = updated.find(r => r.id === regionId);
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        if (regObj) {
          fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(regionId)}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regObj)
          }).catch(err => console.warn('Persisting region failed', err));
        }
      }
      return updated;
    });
  };

  // DELETE REGION VERTEX
  const handleDeleteRegionVertex = (regionId: string, vertexIndex: number) => {
    setRegionsList(prevList => {
      const updated = prevList.map(reg => {
        if (reg.id === regionId) {
          const pts = reg.points.split(' ');
          if (pts.length > 3) {
            const newPts = pts.filter((_, idx) => idx !== vertexIndex);
            return { ...reg, points: newPts.join(' ') };
          }
        }
        return reg;
      });
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const regObj = updated.find(r => r.id === regionId);
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        if (regObj) {
          fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(regionId)}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regObj)
          }).catch(err => console.warn('Persisting region failed', err));
        }
      }
      return updated;
    });
  };

  // UPDATE REGION INFO (Name, operator, color, etc.)
  const handleUpdateRegionInfo = (regionId: string, updates: Partial<Region>) => {
    setRegionsList(prevList => {
      const updated = prevList.map(reg => reg.id === regionId ? { ...reg, ...updates } : reg);
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const regObj = updated.find(r => r.id === regionId);
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        if (regObj) {
          fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(regionId)}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regObj)
          }).catch(err => console.warn('Persisting region failed', err));
        }
      }
      return updated;
    });
  };

  // DELETE REGION
  const handleDeleteRegion = (regionId: string) => {
    setRegionsList(prev => {
      const updated = prev.filter(reg => reg.id !== regionId);
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        // Deleting on server: set an empty object or remove row depending on server capability. Server currently only supports upsert; remove locally and upsert empty data to keep consistency.
        fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(regionId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: regionId, deleted: true }) }).catch(() => {});
      }
      return updated;
    });
  };

  // ADD NEW REGION
  const handleAddNewRegion = () => {
    const id = 'REG-' + Math.round(100 + Math.random() * 900);
    const newReg: Region = {
      id,
      name: 'Nova Região ' + id,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      points: '40,20 60,20 50,50', // Default triangle
      operator: 'Novo Responsável',
      bombasCount: 0,
      reservatoriosCount: 0,
      medidoresCount: 0
    };
    setRegionsList(prev => {
      const updated = [...prev, newReg];
      const isPrivileged = userProfile === 'admin';
      if (isPrivileged) {
        const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : '';
        fetch((API_BASE || '') + `/api/regions/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReg) }).catch(err => console.warn('Persisting new region failed', err));
      }
      return updated;
    });
    
    // Add event log
    const logId = 'LOG-' + Math.round(100 + Math.random() * 900);
    const log: EventLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      username: 'Engenheiro Sênior',
      type: 'cadastro',
      description: `Criada nova região de fiscalização: ${newReg.name}`
    };
    setEvents(prev => [log, ...prev]);
  };

  // RESET TOTAL SIMULATOR
  const handleResetSimulator = () => {
    setEquipmentList(INITIAL_EQUIPMENT);
    setRegionsList(INITIAL_REGIONS);
    setPipelinesList(INITIAL_PIPELINES);
    setActiveAlarms(INITIAL_ALARMS);
    setActiveTab('mapa');
    setSelectedEquipment(null);
    setEvents([
      {
        id: 'LOG-RESET',
        timestamp: new Date().toISOString(),
        username: 'Administrador SAAE',
        type: 'sistema',
        description: 'Reinicialização completa do barramento de simulação do CCO SAAE Manacapuru.'
      },
      ...INITIAL_EVENTS
    ]);
  };

  // Filter lists helper for active sidebars
  const selectedEquipmentAlarms = selectedEquipment 
    ? activeAlarms.filter(a => a.equipmentId === selectedEquipment.id)
    : [];

  const selectedEquipmentHistory = selectedEquipment
    ? events.filter(e => e.equipmentId === selectedEquipment.id)
    : [];

  return (
    <div 
      id="saae-app-root" 
      data-theme={theme}
      className={`min-h-screen bg-scada-main ${theme === 'dark' ? 'text-slate-100' : 'text-[#102A43]'} flex flex-col font-sans overflow-x-hidden antialiased`}
    >
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header id="saae-header" className="min-h-14 h-auto py-2.5 md:py-0 md:h-14 bg-scada-navbar border-b border-scada flex flex-col md:flex-row items-center justify-between px-4 md:px-6 shrink-0 gap-3 z-50 sticky top-0 shadow-lg">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-scada-btn-secondary rounded-lg flex items-center justify-center font-bold font-sans text-xs tracking-tighter text-white shadow-md border border-blue-500/25">
            SAAE
          </div>
          <div>
            <h1 className="font-sans font-black text-xs text-scada-primary tracking-tight leading-none">SAAE MANACAPURU</h1>
            <span className="text-[9px] font-mono font-medium text-scada-icon tracking-widest uppercase">Supervisório SCADA v4.0</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center bg-scada-main p-0.5 border border-scada rounded-xl text-xs font-semibold">
          <button 
            id="nav-mapa"
            onClick={() => { setActiveTab('mapa'); setSelectedEquipment(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'mapa' ? 'bg-scada-navbar text-scada-primary border border-scada shadow-md' : 'text-scada-secondary hover:text-scada-primary'}`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Mapa Supervisório
          </button>
          <button 
            id="nav-dashboard"
            onClick={() => { setActiveTab('dashboard'); setSelectedEquipment(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-scada-navbar text-scada-primary border border-scada shadow-md' : 'text-scada-secondary hover:text-scada-primary'}`}
          >
            <Tv className="w-3.5 h-3.5" />
            Dashboard Operacional (CCO)
          </button>
          <button 
            id="nav-executivo"
            onClick={() => { setActiveTab('executivo'); setSelectedEquipment(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'executivo' ? 'bg-scada-navbar text-scada-primary border border-scada shadow-md' : 'text-scada-secondary hover:text-scada-primary'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Gerencial / Executivo
          </button>
          <button 
            id="nav-historico"
            onClick={() => { setActiveTab('historico'); setSelectedEquipment(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'historico' ? 'bg-scada-navbar text-scada-primary border border-scada shadow-md' : 'text-scada-secondary hover:text-scada-primary'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            Histórico Eventos
          </button>
          <button 
            id="nav-relatorios"
            onClick={() => { setActiveTab('relatorios'); setSelectedEquipment(null); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'relatorios' ? 'bg-scada-navbar text-scada-primary border border-scada shadow-md' : 'text-scada-secondary hover:text-scada-primary'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Relatórios
          </button>
        </nav>

        {/* Global Controls & Access Selectors */}
        <div className="flex items-center gap-3">
          
          {/* Active profile select */}
          <div className="flex items-center gap-2 bg-scada-main px-2.5 py-1 border border-scada rounded-lg text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              id="select-user-role"
              value={userProfile}
              onChange={(e) => {
                const newRole = e.target.value as UserProfile;
                setUserProfile(newRole);
                const lId = 'LOG-' + Math.round(100 + Math.random() * 900);
                setEvents(prev => [
                  {
                    id: lId,
                    timestamp: new Date().toISOString(),
                    username: 'Sistema SCADA',
                    type: 'acesso',
                    description: `Operador alterou sessão local para o perfil: ${newRole.toUpperCase()}`
                  },
                  ...prev
                ]);
              }}
              className="bg-transparent text-scada-primary focus:outline-none font-semibold cursor-pointer"
            >
              <option value="visitor" className="bg-scada-navbar text-scada-primary">Perfil: Visitante (Leitura)</option>
              <option value="operator" className="bg-scada-navbar text-scada-primary">Perfil: Operador SAAE</option>
              <option value="supervisor" className="bg-scada-navbar text-scada-primary">Perfil: Supervisor CCO</option>
              <option value="admin" className="bg-scada-navbar text-scada-primary">Perfil: Engenheiro Sênior</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="toggle-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-scada bg-scada-main hover:bg-scada-navbar text-scada-primary transition-all shrink-0 cursor-pointer"
            title={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </button>

          {/* Alarm sound buzzer toggle */}
          <button
            id="toggle-buzzer"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
              soundEnabled 
                ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                : 'bg-scada-main text-scada-secondary border-scada hover:bg-scada-navbar'
            }`}
            title={soundEnabled ? "Desativar sirene de alarmes" : "Ativar sirene de alarmes"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

        </div>

      </header>

      {/* MOBILE TAB BAR NAVIGATION */}
      <div id="saae-mobile-nav" className="xl:hidden bg-scada-navbar border-b border-scada flex items-center justify-around p-2 text-[10px] shrink-0 font-semibold z-40">
        <button 
          id="m-nav-mapa"
          onClick={() => { setActiveTab('mapa'); setSelectedEquipment(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${activeTab === 'mapa' ? 'text-blue-500 font-bold' : 'text-scada-secondary'}`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Mapa</span>
        </button>
        <button 
          id="m-nav-dashboard"
          onClick={() => { setActiveTab('dashboard'); setSelectedEquipment(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button 
          id="m-nav-executivo"
          onClick={() => { setActiveTab('executivo'); setSelectedEquipment(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${activeTab === 'executivo' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Gerencial</span>
        </button>
        <button 
          id="m-nav-historico"
          onClick={() => { setActiveTab('historico'); setSelectedEquipment(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${activeTab === 'historico' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Logs</span>
        </button>
        <button 
          id="m-nav-relatorios"
          onClick={() => { setActiveTab('relatorios'); setSelectedEquipment(null); }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${activeTab === 'relatorios' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Relatórios</span>
        </button>
      </div>

      {/* 2. PRIMARY SCREEN VIEWPORT CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full">
        
        {/* Render Active Screen Panel */}
        {activeTab === 'mapa' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-12rem)] relative">
            
            {/* Interactive map takes up 2/3 column */}
            <div className="lg:col-span-2 h-[60vh] min-h-[420px] lg:h-full">
              <InteractiveMap
                equipmentList={equipmentList}
                regions={regionsList}
                pipelines={pipelinesList}
                activeAlarms={activeAlarms}
                selectedEquipment={selectedEquipment}
                onSelectEquipment={(eq) => setSelectedEquipment(eq)}
                hoveredEquipment={hoveredEquipment}
                onHoverEquipment={(eq) => setHoveredEquipment(eq)}
                theme={theme}
                userProfile={userProfile}
                onUpdateEquipmentCoordinates={handleUpdateEquipmentCoordinates}
                onUpdateRegionVertex={handleUpdateRegionVertex}
                onAddRegionVertex={handleAddRegionVertex}
                onDeleteRegionVertex={handleDeleteRegionVertex}
                onUpdateRegionInfo={handleUpdateRegionInfo}
                onDeleteRegion={handleDeleteRegion}
                onAddNewRegion={handleAddNewRegion}
              />
            </div>

            {/* Quick overview side info card / selected equipment sidebar info */}
            <div className="lg:col-span-1 bg-scada-navbar border border-scada rounded-2xl p-4 flex flex-col justify-between overflow-y-auto h-auto min-h-[350px] lg:h-full space-y-4 shadow-2xl">
              
              {selectedEquipment ? (
                <div className="space-y-4 h-full flex flex-col text-scada-primary">
                  <div className="flex justify-between items-center border-b border-scada pb-2.5">
                    <h3 className="font-sans font-bold text-scada-primary text-sm">Prontuário de Controle Rápido</h3>
                    <button 
                      id="deselect-equipment"
                      onClick={() => setSelectedEquipment(null)} 
                      className="text-scada-secondary hover:text-scada-primary font-mono text-xs hover:underline cursor-pointer"
                    >
                      Limpar Seleção
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1">
                    <p className="text-xs text-scada-secondary mb-3 leading-relaxed">
                      Selecione comandos operacionais ou analise as telemetrias e curvas históricas detalhadas no prontuário do dispositivo clicado.
                    </p>
                    <div className="bg-scada-main/80 p-3 rounded-xl border border-scada text-xs font-mono space-y-1 text-scada-primary">
                      <p><span className="text-scada-secondary/60">ID:</span> {selectedEquipment.id}</p>
                      <p><span className="text-scada-secondary/60">TAG:</span> {selectedEquipment.name}</p>
                      <p><span className="text-scada-secondary/60">TIPO:</span> {selectedEquipment.type.toUpperCase()}</p>
                      <p><span className="text-scada-secondary/60">SITU:</span> {selectedEquipment.status.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    id="btn-open-full-prontuario"
                    onClick={() => {
                      const sidebarEl = document.getElementById(`sidebar-${selectedEquipment.id}`);
                      if (sidebarEl) sidebarEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    ABRIR PRONTUÁRIO COMPLETO
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-scada-primary">Nenhum Dispositivo Selecionado</h4>
                    <p className="text-xs text-scada-secondary mt-1.5 leading-relaxed">
                      Clique em qualquer ícone sobre o mapa de Manacapuru (Bombas, Reservatórios, Wells, Sensores) para obter dados em tempo real, monitorar curvas históricas, emitir comandos remotos (Ligar/Desligar) ou rearmar falhas elétricas no CCO.
                    </p>
                  </div>
                </div>
              )}

              {/* Active critical alarms quick banner in bottom of sidebar */}
              {activeAlarms.filter(a => a.status === 'ativo').length > 0 && (
                <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-xl flex items-center gap-2.5 animate-pulse shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="text-[11px] leading-snug">
                    <span className="font-bold text-red-400 block">Existem Alarmes Pendentes!</span>
                    <span className="text-scada-secondary">Reconheça as falhas na central ou na sidebar de controle.</span>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {activeTab === 'dashboard' && (
          <OperationalDashboard
            equipmentList={equipmentList}
            regions={regionsList}
            pipelines={pipelinesList}
            activeAlarms={activeAlarms}
            events={events}
            userProfile={userProfile}
            selectedEquipment={selectedEquipment}
            onSelectEquipment={(eq) => setSelectedEquipment(eq)}
            hoveredEquipment={hoveredEquipment}
            onHoverEquipment={(eq) => setHoveredEquipment(eq)}
            onAcknowledgeAlarm={handleAcknowledgeAlarm}
            theme={theme}
          />
        )}

        {activeTab === 'executivo' && (
          <ExecutiveDashboard />
        )}

        {activeTab === 'historico' && (
          <HistoryLog events={events} />
        )}

        {activeTab === 'relatorios' && (
          <ReportsPanel
            equipmentList={equipmentList}
            activeAlarms={activeAlarms}
            events={events}
          />
        )}

      </main>

      {/* 3. FLOATING EQUIPMENT SIDEBAR DRAWER PANEL */}
      {selectedEquipment && (
        <EquipmentSidebar
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          userProfile={userProfile}
          activeAlarms={activeAlarms}
          equipmentAlarms={selectedEquipmentAlarms}
          equipmentHistory={selectedEquipmentHistory}
          onCommand={handleCommand}
          onAcknowledgeAlarm={handleAcknowledgeAlarm}
        />
      )}

      {/* Global CSS animation for marquee text log */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .text-shadow {
          text-shadow: 0 1px 2px rgba(0,0,0,0.9);
        }
      `}</style>

    </div>
  );
}
