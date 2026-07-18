import React, { useState } from 'react';
import { Search, Calendar, Filter, FileText, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { EventLog } from '../types';

interface HistoryLogProps {
  events: EventLog[];
}

export default function HistoryLog({ events }: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Filter lists
  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.equipmentId && e.equipmentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesOperator = operatorFilter === 'all' || e.username.includes(operatorFilter);

    return matchesSearch && matchesType && matchesOperator;
  });

  const uniqueOperators = Array.from(new Set(events.map(e => e.username)));

  // Mock CSV export downloads
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      
      // Build dummy CSV contents
      const csvHeader = "ID,Timestamp,Usuario,Equipamento,Tipo,Descricao,ValorAnterior,ValorNovo\n";
      const csvRows = filteredEvents.map(e => 
        `"${e.id}","${e.timestamp}","${e.username}","${e.equipmentId || ''}","${e.type}","${e.description}","${e.oldValue || ''}","${e.newValue || ''}"`
      ).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + csvHeader + csvRows;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Historico_SAAE_Manacapuru_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div id="history-log" className="space-y-4 p-1">
      
      {/* 1. FILTER PANEL */}
      <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-sans font-bold text-sm text-scada-primary">Pesquisa e Filtragem do Histórico Operacional</h3>
          <button
            id="btn-export-csv"
            disabled={exporting}
            onClick={handleExportCSV}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 font-semibold text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer ${
              exportSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
            }`}
          >
            {exporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Exportando...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Planilha Baixada!
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Exportar Planilha (CSV)
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-scada-secondary" />
            <input
              id="search-history"
              type="text"
              placeholder="Pesquisar por descrição, operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-scada-main border border-scada rounded-xl pl-9 pr-3 py-2.5 text-scada-primary placeholder-scada-secondary/60 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center bg-scada-main border border-scada rounded-xl px-3 py-1 text-scada-primary">
            <Filter className="w-4 h-4 text-scada-secondary mr-2 shrink-0" />
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none w-full py-1.5 cursor-pointer text-scada-primary"
            >
              <option value="all" className="bg-scada-card text-scada-primary">Todos os Eventos</option>
              <option value="comando" className="bg-scada-card text-scada-primary">Comandos Remotos</option>
              <option value="alarme" className="bg-scada-card text-scada-primary">Alarmes</option>
              <option value="sistema" className="bg-scada-card text-scada-primary">Alertas de Sistema</option>
              <option value="cadastro" className="bg-scada-card text-scada-primary">Cadastros/Manutenção</option>
              <option value="acesso" className="bg-scada-card text-scada-primary">Acessos/Sessões</option>
            </select>
          </div>

          {/* Operator Filter */}
          <div className="flex items-center bg-scada-main border border-scada rounded-xl px-3 py-1 text-scada-primary">
            <Calendar className="w-4 h-4 text-scada-secondary mr-2 shrink-0" />
            <select
              id="filter-operator"
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="bg-transparent focus:outline-none w-full py-1.5 text-ellipsis overflow-hidden cursor-pointer text-scada-primary"
            >
              <option value="all" className="bg-scada-card text-scada-primary">Todos Operadores</option>
              {uniqueOperators.map((op, idx) => (
                <option key={idx} value={op} className="bg-scada-card text-scada-primary">{op}</option>
              ))}
            </select>
          </div>

          {/* Date Range Simulator placeholder */}
          <div className="bg-scada-main border border-scada rounded-xl px-3.5 py-2.5 text-scada-secondary flex justify-between items-center font-mono">
            <span>Intervalo: Últimas 48h</span>
            <ChevronDown className="w-4 h-4 text-scada-secondary" />
          </div>
        </div>
      </div>

      {/* 2. LOG TABLE & CARDS */}
      <div className="bg-scada-card border border-scada rounded-2xl overflow-hidden shadow-lg">
        
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-scada-main/80 border-b border-scada text-scada-secondary font-bold uppercase tracking-wider">
                <th className="p-3 w-32 font-mono">Data / Hora</th>
                <th className="p-3 w-40">Operador</th>
                <th className="p-3 w-32 font-mono">ID Tag</th>
                <th className="p-3 w-28">Categoria</th>
                <th className="p-3">Descrição do Evento</th>
                <th className="p-3 w-52 font-mono">Alterações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scada/60 text-scada-primary">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-scada-secondary font-mono">
                    Nenhum registro histórico atende aos critérios de pesquisa.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((log) => {
                  let badgeColor = '';
                  switch (log.type) {
                    case 'comando':
                      badgeColor = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                      break;
                    case 'alarme':
                      badgeColor = 'bg-red-500/10 text-red-500 border border-red-500/20';
                      break;
                    case 'cadastro':
                      badgeColor = 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
                      break;
                    case 'acesso':
                      badgeColor = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
                      break;
                    default:
                      badgeColor = 'bg-scada-main text-scada-secondary border border-scada';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-scada-main/20 transition-colors">
                      <td className="p-3 font-mono text-scada-secondary whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="p-3 font-medium text-scada-primary">{log.username}</td>
                      <td className="p-3 font-mono text-scada-secondary">{log.equipmentId || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${badgeColor}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-3 text-scada-secondary leading-normal">{log.description}</td>
                      <td className="p-3 font-mono text-[10px] text-scada-secondary/80">
                        {log.oldValue || log.newValue ? (
                          <div className="flex gap-1.5 items-center">
                            <span className="line-through">{log.oldValue || 'N/D'}</span>
                            <span>➔</span>
                            <span className="text-blue-500">{log.newValue || 'N/D'}</span>
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Card List) */}
        <div className="block md:hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-scada-secondary font-mono text-xs">
              Nenhum registro histórico atende aos critérios de pesquisa.
            </div>
          ) : (
            <div className="divide-y divide-scada/60">
              {filteredEvents.map((log) => {
                let badgeColor = '';
                switch (log.type) {
                  case 'comando':
                    badgeColor = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                    break;
                  case 'alarme':
                    badgeColor = 'bg-red-500/10 text-red-500 border border-red-500/20';
                    break;
                  case 'cadastro':
                    badgeColor = 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
                    break;
                  case 'acesso':
                    badgeColor = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
                    break;
                  default:
                    badgeColor = 'bg-scada-main text-scada-secondary border border-scada';
                }

                return (
                  <div key={log.id} className="p-4 space-y-2 hover:bg-scada-main/10 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${badgeColor}`}>
                        {log.type}
                      </span>
                      <span className="text-[10px] font-mono text-scada-secondary whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-scada-primary">{log.username}</span>
                        {log.equipmentId && (
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                            {log.equipmentId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-scada-secondary leading-normal">{log.description}</p>
                    </div>

                    {(log.oldValue || log.newValue) && (
                      <div className="bg-scada-main/30 border border-scada rounded-lg p-2.5 flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-scada-secondary/60 shrink-0">Ajuste:</span>
                        <div className="flex gap-1.5 items-center flex-wrap">
                          <span className="line-through text-scada-secondary/80">{log.oldValue || 'N/D'}</span>
                          <span className="text-scada-secondary/40">➔</span>
                          <span className="text-blue-500 font-bold">{log.newValue || 'N/D'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Pagination simulator */}
        <div className="p-3 bg-scada-main/60 border-t border-scada flex flex-col sm:flex-row gap-2 justify-between items-center text-[11px] text-scada-secondary font-mono">
          <span className="text-center sm:text-left">Mostrando {filteredEvents.length} de {events.length} logs arquivados.</span>
          <div className="flex gap-2">
            <button className="px-2 py-0.5 bg-scada-main text-scada-secondary/60 rounded hover:text-scada-primary transition-colors cursor-not-allowed">Anterior</button>
            <button className="px-2 py-0.5 bg-scada-main text-scada-secondary/60 rounded hover:text-scada-primary transition-colors cursor-not-allowed">Próximo</button>
          </div>
        </div>
      </div>

    </div>
  );
}
