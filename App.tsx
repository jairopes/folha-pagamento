
import React, { useState, useEffect } from 'react';
import { Employee, PayrollRecord, SalaryAdvance, TabType } from './types';
import Dashboard from './components/Dashboard';
import PayrollForm from './components/PayrollForm';
import EmployeeList from './components/EmployeeList';
import HistoryList from './components/HistoryList';
import AdvancesScreen from './components/AdvancesScreen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do LocalStorage ao iniciar
  useEffect(() => {
    const loadLocalData = () => {
      setLoading(true);
      try {
        const localEmps = localStorage.getItem('fp_employees');
        const localPayroll = localStorage.getItem('fp_payroll');
        const localAdvances = localStorage.getItem('fp_advances');

        if (localEmps) setEmployees(JSON.parse(localEmps));
        if (localPayroll) setPayrollRecords(JSON.parse(localPayroll));
        if (localAdvances) setAdvances(JSON.parse(localAdvances));
      } catch (error) {
        console.error("Erro ao carregar dados locais:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocalData();
  }, []);

  // Salvar dados sempre que houver mudanças
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('fp_employees', JSON.stringify(employees));
      localStorage.setItem('fp_payroll', JSON.stringify(payrollRecords));
      localStorage.setItem('fp_advances', JSON.stringify(advances));
    }
  }, [employees, payrollRecords, advances, loading]);

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const removeEmployee = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este funcionário? Isso excluirá permanentemente todos os seus registros vinculados.")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      setPayrollRecords(prev => prev.filter(r => r.employeeId !== id));
      setAdvances(prev => prev.filter(a => a.employeeId !== id));
    }
  };

  const addPayrollRecord = (record: PayrollRecord) => {
    setPayrollRecords(prev => [record, ...prev]);
    setActiveTab('history');
  };

  const removePayrollRecord = (id: string) => {
    if (window.confirm("Remover este lançamento permanentemente?")) {
      setPayrollRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const addAdvance = (advance: SalaryAdvance) => {
    setAdvances(prev => [advance, ...prev]);
  };

  const removeAdvance = (id: string) => {
    setAdvances(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xl">
            FP
          </div>
          <h1 className="text-xl font-bold tracking-tight">FolhaPrática</h1>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-chart-line w-5"></i> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'payroll' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-file-invoice-dollar w-5"></i> Nova Folha
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'advances' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-hand-holding-usd w-5"></i> Adiantamentos
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'employees' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-users w-5"></i> Funcionários
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <i className="fas fa-history w-5"></i> Histórico
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status Armazenamento</p>
            <div className="flex items-center gap-2 text-emerald-400">
              <i className="fas fa-database text-xs"></i>
              <span className="text-sm">Local Ativo</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-emerald-500 gap-4">
              <i className="fas fa-circle-notch animate-spin text-4xl"></i>
              <p className="font-bold tracking-widest uppercase text-xs">Carregando dados...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard records={payrollRecords} employees={employees} />
              )}
              {activeTab === 'payroll' && (
                <PayrollForm 
                  employees={employees} 
                  onSubmit={addPayrollRecord} 
                  onGoToEmployees={() => setActiveTab('employees')}
                />
              )}
              {activeTab === 'advances' && (
                <AdvancesScreen 
                  employees={employees} 
                  advances={advances}
                  onAdd={addAdvance}
                  onRemove={removeAdvance}
                  onGoToEmployees={() => setActiveTab('employees')}
                />
              )}
              {activeTab === 'employees' && (
                <EmployeeList 
                  employees={employees} 
                  onAdd={addEmployee} 
                  onUpdate={updateEmployee}
                  onRemove={removeEmployee} 
                />
              )}
              {activeTab === 'history' && (
                <HistoryList records={payrollRecords} employees={employees} onRemove={removePayrollRecord} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
