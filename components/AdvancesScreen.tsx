
import React, { useState, useMemo } from 'react';
import { Employee, SalaryAdvance } from '../types';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

interface AdvancesScreenProps {
  employees: Employee[];
  advances: SalaryAdvance[];
  onAdd: (advance: SalaryAdvance) => void;
  onRemove: (id: string) => void;
  onGoToEmployees: () => void;
}

const AdvancesScreen: React.FC<AdvancesScreenProps> = ({ 
  employees, 
  advances, 
  onAdd, 
  onRemove,
  onGoToEmployees 
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [observations, setObservations] = useState('');
  
  // Export filters
  const [exportStart, setExportStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [exportEnd, setExportEnd] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === selectedEmployeeId), 
    [selectedEmployeeId, employees]
  );

  const calculatedAdvance = useMemo(() => {
    if (!selectedEmployee) return 0;
    return selectedEmployee.baseSalary * 0.4;
  }, [selectedEmployee]);

  // Update advanceAmount when employee changes
  React.useEffect(() => {
    if (selectedEmployee) {
      setAdvanceAmount(calculatedAdvance.toFixed(2));
    } else {
      setAdvanceAmount('');
    }
  }, [selectedEmployee, calculatedAdvance]);

  // Função para navegar com ENTER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault(); 
      
      const form = e.currentTarget as HTMLFormElement;
      const focusableElements = Array.from(
        form.querySelectorAll('input, select, textarea, button:not([type="button"])')
      ) as HTMLElement[];
      
      const index = focusableElements.indexOf(target);
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    const newAdvance: SalaryAdvance = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      date,
      salaryBase: selectedEmployee?.baseSalary || 0,
      advanceAmount: parseFloat(advanceAmount) || 0,
      status: 'pendente',
      observations
    };

    onAdd(newAdvance);
    setSelectedEmployeeId('');
    setObservations('');
    alert('Adiantamento registrado com sucesso!');
  };

  const handleExportExcel = () => {
    const filteredAdvances = advances.filter(adv => {
      return adv.date >= exportStart && adv.date <= exportEnd;
    });

    if (filteredAdvances.length === 0) {
      alert("Nenhum adiantamento encontrado no período selecionado.");
      return;
    }

    const data = filteredAdvances.map(adv => {
      const emp = employees.find(e => e.id === adv.employeeId);
      return {
        'Colaborador': emp?.name || 'Não encontrado',
        'Data do Adiantamento': new Date(adv.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        'Salário Base (Mês)': adv.salaryBase,
        'Valor Adiantamento (40%)': adv.advanceAmount,
        'Status': adv.status.toUpperCase(),
        'Observações': adv.observations || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Adiantamentos");
    XLSX.writeFile(workbook, `adiantamentos_${exportStart}_a_${exportEnd}.xlsx`);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (employees.length === 0) {
    return (
      <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-4">
        <i className="fas fa-user-slash text-4xl text-amber-500"></i>
        <h2 className="text-2xl font-bold">Nenhum Funcionário</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Cadastre funcionários para poder lançar adiantamentos salariais.
        </p>
        <button
          onClick={onGoToEmployees}
          className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
        >
          Ir para Cadastro
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold">Gestão de Adiantamentos</h2>
        <p className="text-slate-400">Lançamento de vale salarial (40% automático sobre o salário base).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={handleKeyDown}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6"
          >
            <h3 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <i className="fas fa-plus-circle"></i> Novo Lançamento
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Colaborador</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none h-[52px]"
                required
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data do Vale</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none h-[52px]"
                  required
                />
              </div>

              {selectedEmployee && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in zoom-in-95">
                  <p className="text-[10px] text-emerald-500/70 font-black uppercase mb-1">Cálculo Automático (40%)</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs text-slate-500">Salário: {formatCurrency(selectedEmployee.baseSalary)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">{formatCurrency(calculatedAdvance)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor do Adiantamento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-emerald-500 outline-none h-[52px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observações</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                  placeholder="Ex: Adiantamento excepcional"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              Registrar Adiantamento
            </button>
          </form>
        </div>

        {/* History and Export Column */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">De:</label>
                  <input
                    type="date"
                    value={exportStart}
                    onChange={(e) => setExportStart(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Até:</label>
                  <input
                    type="date"
                    value={exportEnd}
                    onChange={(e) => setExportEnd(e.target.value)}
                    className="w-full bg-black border border-slate-700 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                className="bg-slate-800 text-emerald-400 border border-emerald-500/20 px-6 h-10 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700"
              >
                <i className="fas fa-file-excel"></i> Exportar Periodo
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {advances.length === 0 ? (
                <div className="py-20 text-center text-slate-600 italic">
                  Nenhum adiantamento registrado.
                </div>
              ) : (
                advances.map(adv => {
                  const emp = employees.find(e => e.id === adv.employeeId);
                  return (
                    <div key={adv.id} className="bg-black/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{emp?.name || 'Excluído'}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(adv.date + 'T00:00:00').toLocaleDateString()} • Salário: {formatCurrency(adv.salaryBase)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-400">{formatCurrency(adv.advanceAmount)}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase">40% Vale</p>
                        </div>
                        <button
                          onClick={() => onRemove(adv.id)}
                          className="text-slate-700 hover:text-red-500 p-2 transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdvancesScreen;
