
import React from 'react';
import { PayrollRecord, Employee } from '../types';

interface HistoryListProps {
  records: PayrollRecord[];
  employees: Employee[];
  onRemove: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, employees, onRemove }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const calculateTotals = (record: PayrollRecord) => {
    const totalEarnings = 
      record.monthlySalary + 
      record.functionAccumulation + 
      record.otherEarnings + 
      record.bonuses + 
      record.basicBasket + 
      record.mealVoucher;

    const totalDeductions = 
      record.advances + 
      record.loans + 
      record.otherDeductions + 
      record.pharmacyAgreement + 
      record.supermarketAgreement + 
      record.dentalAgreement + 
      record.medicalAgreement + 
      record.otherAgreements;

    return { totalEarnings, totalDeductions, net: totalEarnings - totalDeductions };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Histórico de Lançamentos</h2>
          <p className="text-slate-400">Consulte os fechamentos realizados anteriormente.</p>
        </div>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <i className="fas fa-search text-4xl text-slate-700 mb-4 block"></i>
            <p className="text-slate-500">Nenhum registro encontrado.</p>
          </div>
        ) : (
          records.map((record) => {
            const employee = employees.find(e => e.id === record.employeeId);
            const { totalEarnings, totalDeductions, net } = calculateTotals(record);

            return (
              <div key={record.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{employee?.name || 'Funcionário Excluído'}</h4>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ref: {new Date(record.closingDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Líquido a Receber</p>
                      <p className={`text-xl font-black ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(net)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(record.id);
                      }}
                      className="p-3 -mr-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all active:scale-90 group relative z-10"
                      title="Excluir este lançamento permanentemente"
                    >
                      <i className="fas fa-trash-alt text-lg"></i>
                    </button>
                  </div>
                </div>
                
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Proventos (+)</h5>
                    <div className="space-y-1">
                      <SummaryItem label="Salário" value={record.monthlySalary} />
                      <SummaryItem label="Acúmulo" value={record.functionAccumulation} />
                      <SummaryItem label="Prêmios" value={record.bonuses} />
                      <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-emerald-500 text-sm">
                        <span>Total Bruto</span>
                        <span>{formatCurrency(totalEarnings)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Descontos (-)</h5>
                    <div className="space-y-1">
                      <SummaryItem label="Adiantamentos" value={record.advances} isNegative />
                      <SummaryItem label="Empréstimos" value={record.loans} isNegative />
                      <SummaryItem label="Convênios" value={record.medicalAgreement + record.pharmacyAgreement + record.dentalAgreement} isNegative />
                      <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-red-500 text-sm">
                        <span>Total Descontos</span>
                        <span>{formatCurrency(totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Outras Info</h5>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>H.E. 100% / 70% / 50%:</span>
                        <span className="font-bold text-slate-200">{record.ot100}h / {record.ot70}h / {record.ot50}h</span>
                      </div>
                      <div className="text-xs text-slate-400 flex justify-between">
                        <span>Vale Transporte:</span>
                        <span className={`font-bold ${record.transportVoucher ? 'text-emerald-500' : 'text-slate-600'}`}>
                          {record.transportVoucher ? 'SIM' : 'NÃO'}
                        </span>
                      </div>
                      {record.observations && (
                        <div className="mt-2 pt-2 border-t border-slate-800 italic text-[10px] text-slate-500 leading-tight">
                          "{record.observations}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, isNegative }: { label: string, value: number, isNegative?: boolean }) => {
  if (value === 0) return null;
  return (
    <div className="flex justify-between text-[11px] text-slate-400">
      <span>{label}</span>
      <span className={isNegative ? 'text-red-300' : 'text-emerald-300'}>
        {isNegative ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </span>
    </div>
  );
};

export default HistoryList;
