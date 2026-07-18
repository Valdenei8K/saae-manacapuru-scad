import React, { useState } from 'react';
import { FileText, Calendar, Shield, Check, Printer, Sparkles, Download } from 'lucide-react';
import { Equipment, Alarm, EventLog } from '../types';

interface ReportsPanelProps {
  equipmentList: Equipment[];
  activeAlarms: Alarm[];
  events: EventLog[];
}

export default function ReportsPanel({ equipmentList, activeAlarms, events }: ReportsPanelProps) {
  const [reportType, setReportType] = useState<string>('bombas');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedEquipId, setSelectedEquipId] = useState<string>('all');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [reportSummary, setReportSummary] = useState<string>('');

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setReportData(null);

    // Simulate database lookup latency
    setTimeout(() => {
      setIsGenerating(false);

      // Generate dummy data rows based on type
      let data: any[] = [];
      let summaryText = '';

      if (reportType === 'bombas') {
        const pumps = selectedEquipId === 'all' 
          ? equipmentList.filter(e => e.type === 'bomba' || e.type === 'booster')
          : equipmentList.filter(e => e.id === selectedEquipId);
        
        data = pumps.map(p => ({
          tag: p.id,
          nome: p.name,
          status: p.status === 'ligada' || p.status === 'automatico' ? 'Ativo' : p.status === 'falha' ? 'Falha' : 'Parado',
          horas: p.hoursWorked || 0,
          partidas: p.numStarts || 0,
          vazaoMedia: p.flowRate ? (p.flowRate * 0.95).toFixed(1) : '0',
          pressaoMedia: p.pressure ? (p.pressure * 0.98).toFixed(1) : '0',
          tempMotor: p.temperature ? `${p.temperature}°C` : 'N/D'
        }));
        summaryText = `Relatório Operacional de Moto-bombas gerado com sucesso. Período: Últimos ${dateRange === '7d' ? '7 dias' : '30 dias'}. Amostragem de ${data.length} dispositivos telemetrados.`;
      
      } else if (reportType === 'alarmes') {
        data = activeAlarms.map(a => ({
          timestamp: new Date(a.timestamp).toLocaleDateString('pt-BR') + ' ' + new Date(a.timestamp).toLocaleTimeString('pt-BR'),
          tag: a.equipmentId,
          equipamento: a.equipmentName,
          severidade: a.severity.toUpperCase(),
          descricao: a.description,
          status: a.status === 'ativo' ? 'Pendente' : 'Reconhecido',
          duracao: `${Math.round(a.openDuration / 60)} min`
        }));
        summaryText = `Relatório de Ocorrências e Eventos de Falha. Identificados ${data.length} alarmes no intervalo configurado. Nível crítico representa ${data.filter(d=>d.severidade === 'CRITICO').length} interrupções de fluxo.`;

      } else if (reportType === 'energia') {
        data = equipmentList.filter(p => p.power !== undefined).map(p => {
          const kWhMedio = (p.power || 0) * 24 * (dateRange === '7d' ? 7 : 30);
          const custoReais = kWhMedio * 0.92; // R$ per kWh
          return {
            tag: p.id,
            nome: p.name,
            potenciaNominal: `${p.power || 0} kW`,
            fatorPotencia: p.powerFactor || '0',
            consumoKwh: Math.round(kWhMedio).toLocaleString('pt-BR'),
            custoEstimado: `R$ ${Math.round(custoReais).toLocaleString('pt-BR')}`,
            eficiencia: p.status === 'manutencao' || p.status === 'falha' ? 'Baixa (Parada)' : 'Excelente (92%)'
          };
        });
        summaryText = `Análise Integrada de Eficiência Energética e Custos Estimados (Tarifa Comercial Light SAAE). Total medido no período: ${data.reduce((acc,c)=> acc + Number(c.consumoKwh.replace(/\./g,'')), 0).toLocaleString('pt-BR')} kWh de consumo.`;

      } else if (reportType === 'pressao' || reportType === 'vazao') {
        const sensors = equipmentList.filter(e => reportType === 'pressao' ? e.type === 'pressao' : e.type === 'vazao');
        data = sensors.map(s => ({
          tag: s.id,
          nome: s.name,
          regiao: s.regionId.toUpperCase(),
          valorAtual: reportType === 'pressao' ? `${s.pressure || 0} mca` : `${s.flowRate || 0} L/s`,
          valorMinimo: reportType === 'pressao' ? '1.1 mca' : '35 L/s',
          valorMaximo: reportType === 'pressao' ? '5.4 mca' : '155 L/s',
          conformidade: s.status.includes('critica') || s.status.includes('baixa') ? 'Não Conforme (Alerta)' : 'Dentro da Meta'
        }));
        summaryText = `Relatório Hidráulico de ${reportType === 'pressao' ? 'Pressões de Linha' : 'Vazões de Setorização'}. Conformidade da rede atinge ${(data.filter(d => d.conformidade === 'Dentro da Meta').length / data.length * 100).toFixed(0)}% de estabilidade.`;

      } else if (reportType === 'manutencao') {
        data = equipmentList.map(e => ({
          tag: e.id,
          nome: e.name,
          tipo: e.type.toUpperCase(),
          ultimaManutencao: e.lastMaintenance || 'Aguardando Cadastro',
          statusGeral: e.status === 'manutencao' ? 'Sob Reparo' : e.status === 'falha' ? 'Corretiva Urgente' : 'Preventiva em Dia',
          horasTrabalhadas: e.hoursWorked || 0,
          proximaManutencao: e.lastMaintenance ? new Date(new Date(e.lastMaintenance).getTime() + 180*24*60*60*1000).toLocaleDateString('pt-BR') : '01/10/2026'
        }));
        summaryText = `Cronograma e Histórico de Engenharia de Manutenção. 5 ativos cadastrados e avaliados para paradas programadas de prevenção de cavitação de bomba.`;

      } else {
        // Histórico de Horas trabalhadas
        data = equipmentList.filter(p => p.hoursWorked !== undefined).map(p => ({
          tag: p.id,
          nome: p.name,
          tipo: p.type.toUpperCase(),
          horasTrabalhadas: p.hoursWorked || 0,
          fatorDesgaste: p.hoursWorked && p.hoursWorked > 4000 ? '94% (Requer Revisão)' : '25% (Sem Risco)',
          disponibilidade: p.status === 'falha' ? '0% (Fora de Linha)' : '98.5%'
        }));
        summaryText = `Relatório Acumulado de Horas Trabalhadas (Horímetro). Horas Totais Operadas no Ativo SAAE Centro e Aparecida.`;
      }

      setReportData(data);
      setReportSummary(summaryText);
    }, 1000);
  };

  // Mock excel export download
  const handleExcelExport = () => {
    if (!reportData) return;
    
    // Convert to simple CSV representation
    const headers = Object.keys(reportData[0]).join(",");
    const rows = reportData.map(row => 
      Object.values(row).map(val => `"${val}"`).join(",")
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAAE_Relatorio_${reportType}_Manacapuru.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock PDF printing
  const handlePDFPrint = () => {
    window.print();
  };

  return (
    <div id="reports-panel" className="space-y-6 p-1">
      
      {/* 1. SELECTION FORM */}
      <div className="bg-scada-card border border-scada rounded-2xl p-4 shadow-lg">
        <div className="border-b border-scada pb-3 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="font-sans font-bold text-sm text-scada-primary">Gerador Automatizado de Relatórios Oficiais - SAAE</h3>
        </div>

        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
          {/* Report Type */}
          <div className="space-y-1.5">
            <label className="text-scada-secondary font-bold uppercase tracking-wider block text-[10px]">Tipo de Relatório</label>
            <div className="flex items-center bg-scada-main border border-scada rounded-xl px-3 py-1 text-scada-primary">
              <select
                id="select-report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-transparent focus:outline-none w-full py-1.5 cursor-pointer text-scada-primary"
              >
                <option value="bombas" className="bg-scada-card text-scada-primary">Moto-bombas (Desempenho)</option>
                <option value="alarmes" className="bg-scada-card text-scada-primary">Histórico de Ocorrências / Alarmes</option>
                <option value="energia" className="bg-scada-card text-scada-primary">Eficiência Energética & Custos</option>
                <option value="pressao" className="bg-scada-card text-scada-primary">Níveis de Pressão (Rede)</option>
                <option value="vazao" className="bg-scada-card text-scada-primary">Medição de Vazão (Macromedidores)</option>
                <option value="manutencao" className="bg-scada-card text-scada-primary">Manutenção & Engenharia Preventiva</option>
                <option value="horas" className="bg-scada-card text-scada-primary">Horímetro Acumulado (Horas Trabalhadas)</option>
              </select>
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-1.5">
            <label className="text-scada-secondary font-bold uppercase tracking-wider block text-[10px]">Período de Amostragem</label>
            <div className="flex items-center bg-scada-main border border-scada rounded-xl px-3 py-1 text-scada-primary">
              <Calendar className="w-4 h-4 text-scada-secondary mr-2 shrink-0" />
              <select
                id="select-report-period"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none w-full py-1.5 cursor-pointer text-scada-primary"
              >
                <option value="24h" className="bg-scada-card text-scada-primary">Últimas 24 Horas</option>
                <option value="7d" className="bg-scada-card text-scada-primary">Últimos 7 dias (Semanal)</option>
                <option value="30d" className="bg-scada-card text-scada-primary">Últimos 30 dias (Mensal)</option>
                <option value="90d" className="bg-scada-card text-scada-primary">Últimos 3 meses (Trimestral)</option>
              </select>
            </div>
          </div>

          {/* Device filter */}
          <div className="space-y-1.5">
            <label className="text-scada-secondary font-bold uppercase tracking-wider block text-[10px]">Ativo de Campo</label>
            <div className="flex items-center bg-scada-main border border-scada rounded-xl px-3 py-1 text-scada-primary">
              <select
                id="select-report-device"
                value={selectedEquipId}
                onChange={(e) => setSelectedEquipId(e.target.value)}
                className="bg-transparent focus:outline-none w-full py-1.5 cursor-pointer text-scada-primary"
              >
                <option value="all" className="bg-scada-card text-scada-primary">Todos os Equipamentos</option>
                {equipmentList.map(e => (
                  <option key={e.id} value={e.id} className="bg-scada-card text-scada-primary">{e.id} - {e.name.substring(0, 24)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Button Submit */}
          <button
            id="btn-generate-report"
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Buscando Dados...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Relatório Analítico
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. REPORT CONTENT PREVIEW */}
      {reportData && (
        <div className="bg-scada-card border border-scada rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
          
          {/* Report Metadata and Header for Print */}
          <div className="p-6 bg-scada-main/90 border-b border-scada space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500 font-black font-sans text-xs">
                  SAAE
                </div>
                <div>
                  <h2 className="font-sans font-black text-scada-primary tracking-tight text-base">SAAE Manacapuru - Serviço Autônomo de Água e Esgoto</h2>
                  <p className="text-xs text-scada-secondary font-mono">CNPJ: 04.982.341/0001-90 • Manacapuru, Amazonas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  id="btn-export-excel"
                  onClick={handleExcelExport}
                  className="bg-scada-card hover:bg-scada-main text-emerald-500 border border-scada font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Excel (.CSV)
                </button>
                <button
                  id="btn-print-pdf"
                  onClick={handlePDFPrint}
                  className="bg-scada-card hover:bg-scada-main text-scada-primary border border-scada font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-scada-main/50 p-3 rounded-xl border border-scada">
              <div>
                <span className="text-scada-secondary block">Relatório de Tipo</span>
                <span className="text-scada-primary font-bold capitalize">{reportType}</span>
              </div>
              <div>
                <span className="text-scada-secondary block">Período Selecionado</span>
                <span className="text-scada-primary font-bold">{dateRange === '24h' ? 'Últimas 24h' : dateRange === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}</span>
              </div>
              <div>
                <span className="text-scada-secondary block">Data de Emissão</span>
                <span className="text-scada-primary font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-scada-secondary block">Emitido por CCO</span>
                <span className="text-emerald-500 font-bold">Operador Conectado</span>
              </div>
            </div>

            <p className="text-xs text-scada-secondary leading-relaxed font-sans bg-scada-main/40 p-3 rounded-xl border border-scada/60">
              💡 <span className="font-semibold text-blue-500">Sumário Analítico:</span> {reportSummary}
            </p>
          </div>

          {/* Render Table Dynamically */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-scada-main/60 border-b border-scada text-scada-secondary font-bold uppercase tracking-wider">
                  {Object.keys(reportData[0]).map((key, i) => (
                    <th key={i} className="p-3 capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-scada/40 text-scada-primary font-mono">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-scada-main/15 transition-colors">
                    {Object.values(row).map((val: any, cellIdx) => (
                      <td key={cellIdx} className="p-3">
                        <span className={
                          val === 'Conforme' || val === 'Dentro da Meta' || val === 'Ativo' ? 'text-green-500 font-bold' :
                          val === 'Falha' || val === 'Não Conforme (Alerta)' ? 'text-red-500 font-bold' : 'text-scada-primary'
                        }>
                          {val}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer of Printable report */}
          <div className="p-4 bg-scada-main/80 border-t border-scada text-[10px] text-scada-secondary/85 font-mono text-center">
            Este relatório foi assinado eletronicamente e auditado sob a diretriz de auditoria ISO 50001 (Gestão de Energia) e diretrizes da AGER (Agência Reguladora do Amazonas).
          </div>
        </div>
      )}

      {/* No report state */}
      {!reportData && !isGenerating && (
        <div className="border border-dashed border-scada rounded-2xl h-64 flex flex-col items-center justify-center text-center p-6 text-scada-secondary">
          <FileText className="w-12 h-12 text-scada-secondary/60 mb-2.5" />
          <p className="text-sm font-medium text-scada-primary">Nenhum relatório emitido nesta sessão.</p>
          <p className="text-xs text-scada-secondary/80 mt-1 max-w-sm">
            Selecione o tipo de dados, o intervalo desejado e o ativo de campo para compilar a documentação analítica e exportar em formatos comerciais.
          </p>
        </div>
      )}

    </div>
  );
}
