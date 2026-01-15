
import React, { useMemo, useState } from 'react';
import { PayrollRecord, Employee } from '../types';
import { 
  XAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

interface DashboardProps {
  records: PayrollRecord[];
  employees: Employee[];
}

const Dashboard: React.FC<DashboardProps> = ({ records, employees }) => {
  // Date filters state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalDeductions = 0;
    
    records.forEach(r => {
      const earnings = r.monthlySalary + r.functionAccumulation + r.otherEarnings + r.bonuses + r.basicBasket + r.mealVoucher;
      const deductions = r.advances + r.loans + r.otherDeductions + r.pharmacyAgreement + r.supermarketAgreement + r.dentalAgreement + r.medicalAgreement + r.otherAgreements;
      totalPaid += (earnings - deductions);
      totalDeductions += deductions;
    });

    return { totalPaid, totalDeductions };
  }, [records]);

  // Aggregate monthly data for chart
  const chartData = useMemo(() => {
    const months: Record<string, { name: string, total: number }> = {};
    
    const sortedRecords = [...records].sort((a, b) => a.closingDate.localeCompare(b.closingDate));
    
    sortedRecords.forEach(r => {
      const date = new Date(r.closingDate + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const earnings = r.monthlySalary + r.functionAccumulation + r.otherEarnings + r.bonuses + r.basicBasket + r.mealVoucher;
      const deductions = r.advances + r.loans + r.otherDeductions + r.pharmacyAgreement + r.supermarketAgreement + r.dentalAgreement + r.medicalAgreement + r.otherAgreements;
      
      if (!months[monthKey]) {
        months[monthKey] = { name: monthName, total: 0 };
      }
      months[monthKey].total += (earnings - deductions);
    });

    return Object.values(months);
  }, [records]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleExportExcel = () => {
    // Filter records by selected period
    const filteredRecords = records.filter(record => {
      return record.closingDate >= startDate && record.closingDate <= endDate;
    });

    if (filteredRecords.length === 0) {
      alert(`Não foram encontrados registros entre ${new Date(startDate + 'T00:00:00').toLocaleDateString()} e ${new Date(endDate + 'T00:00:00').toLocaleDateString()}.`);
      return;
    }

    const dataToExport = filteredRecords.map(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      const totalEarnings = record.monthlySalary + record.functionAccumulation + record.otherEarnings + record.bonuses + record.basicBasket + record.mealVoucher;
      const totalDeductions = record.advances + record.loans + record.otherDeductions + record.pharmacyAgreement + record.supermarketAgreement + record.dentalAgreement + record.medicalAgreement + record.otherAgreements;
      const net = totalEarnings - totalDeductions;

      return {
        'Funcionário': employee?.name || 'Não encontrado',
        'Data de Fechamento': new Date(record.closingDate + 'T00:00:00').toLocaleDateString('pt-BR'),
        'Salário Mensal': record.monthlySalary,
        'Acúmulo de Função': record.functionAccumulation,
        'Outros Rendimentos': record.otherEarnings,
        'Prêmios': record.bonuses,
        'Cesta Básica': record.basicBasket,
        'Vale Refeição': record.mealVoucher,
        'HE 100%': record.ot100,
        'HE 70%': record.ot70,
        'HE 50%': record.ot50,
        'Vale Transporte': record.transportVoucher ? 'Sim' : 'Não',
        'Adiantamentos': record.advances,
        'Faltas': record.absences,
        'Empréstimos': record.loans,
        'Convênio Farmácia': record.pharmacyAgreement,
        'Convênio Supermercado': record.supermarketAgreement,
        'Convênio Odontológico': record.dentalAgreement,
        'Convênio Médico': record.medicalAgreement,
        'Outros Convênios': record.otherAgreements,
        'Outros Descontos': record.otherDeductions,
        'Total Bruto': totalEarnings,
        'Total Descontos': totalDeductions,
        'Líquido a Pagar': net,
        'Observações': record.observations
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Folha Período");
    
    // Auto-size columns
    worksheet["!cols"] = Object.keys(dataToExport[0]).map(() => ({ wch: 20 }));

    const fileName = `folha_${startDate}_a_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Executivo</h2>
          <p className="text-slate-400">Visão geral da saúde financeira e recursos humanos.</p>
        </div>
      </header>

      {/* Export Filter Section */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Período Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Período Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="h-[52px] bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
          >
            <i className="fas fa-file-excel text-lg"></i>
            Exportar Período para Excel
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-2xl"></i>
            </div>
            <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Total Líquido Histórico</span>
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(stats.totalPaid)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-percentage text-2xl"></i>
            </div>
            <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Retenções Totais</span>
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(stats.totalDeductions)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-friends text-2xl"></i>
            </div>
            <span className="text-slate-400 font-medium uppercase text-xs tracking-wider">Funcionários Ativos</span>
          </div>
          <p className="text-3xl font-black text-white">{employees.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-chart-area text-emerald-500"></i> Tendência Mensal
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value: number) => [formatCurrency(value), 'Total Pago']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-700">Aguardando dados de fechamento...</div>
            )}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-bullseye text-blue-500"></i> Sugestão de Alocação
          </h3>
          <div className="flex-1 space-y-4">
             <div className="p-4 bg-black/40 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">Resumo Financeiro Histórico</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: '75%' }}></div>
                  <div className="bg-red-500 h-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Líquido
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Descontos
                  </div>
                </div>
             </div>
             <p className="text-sm text-slate-400 mt-4 italic leading-relaxed">
               "Utilize os filtros acima para extrair relatórios mensais detalhados para o departamento contábil. A exportação inclui o cálculo automático do líquido a pagar."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
