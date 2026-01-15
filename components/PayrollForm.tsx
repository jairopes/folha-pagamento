
import React, { useState } from 'react';
import { Employee, PayrollRecord } from '../types';

interface PayrollFormProps {
  employees: Employee[];
  onSubmit: (record: PayrollRecord) => void;
  onGoToEmployees: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ employees, onSubmit, onGoToEmployees }) => {
  // We use string for numeric values in internal state to preserve trailing zeros (e.g. 2000.10)
  const [formData, setFormData] = useState<any>({
    closingDate: new Date().toISOString().split('T')[0],
    transportVoucher: false,
    monthlySalary: '',
    functionAccumulation: '',
    otherEarnings: '',
    bonuses: '',
    basicBasket: '',
    mealVoucher: '',
    ot100: '',
    ot70: '',
    ot50: '',
    advances: '',
    absences: '',
    loans: '',
    otherDeductions: '',
    pharmacyAgreement: '',
    supermarketAgreement: '',
    dentalAgreement: '',
    medicalAgreement: '',
    otherAgreements: '',
    observations: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let val: any = value;
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
    
    // Automatic pre-fill logic
    if (name === 'employeeId') {
      const selectedEmployee = employees.find(emp => emp.id === value);
      if (selectedEmployee) {
        setFormData((prev: any) => ({ 
          ...prev, 
          [name]: val,
          monthlySalary: selectedEmployee.baseSalary.toFixed(2),
          functionAccumulation: selectedEmployee.baseFunctionAccumulation.toFixed(2)
        }));
        return;
      }
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  // Função para navegar com ENTER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      // Se for textarea ou botão, comportamento padrão
      if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault(); 
      
      const form = e.currentTarget as HTMLFormElement;
      // Busca todos os inputs e selects do form
      const focusableElements = Array.from(
        form.querySelectorAll('input, select, textarea, button:not([type="button"]):not([type="reset"])')
      ) as HTMLElement[];
      
      const index = focusableElements.indexOf(target);
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert("Selecione um funcionário");
      return;
    }
    
    // Convert string values back to numbers for the final record
    const record: PayrollRecord = {
      id: Date.now().toString(),
      employeeId: formData.employeeId,
      closingDate: formData.closingDate,
      monthlySalary: parseFloat(formData.monthlySalary) || 0,
      functionAccumulation: parseFloat(formData.functionAccumulation) || 0,
      otherEarnings: parseFloat(formData.otherEarnings) || 0,
      bonuses: parseFloat(formData.bonuses) || 0,
      basicBasket: parseFloat(formData.basicBasket) || 0,
      mealVoucher: parseFloat(formData.mealVoucher) || 0,
      ot100: parseFloat(formData.ot100) || 0,
      ot70: parseFloat(formData.ot70) || 0,
      ot50: parseFloat(formData.ot50) || 0,
      transportVoucher: formData.transportVoucher,
      advances: parseFloat(formData.advances) || 0,
      absences: parseFloat(formData.absences) || 0,
      loans: parseFloat(formData.loans) || 0,
      otherDeductions: parseFloat(formData.otherDeductions) || 0,
      pharmacyAgreement: parseFloat(formData.pharmacyAgreement) || 0,
      supermarketAgreement: parseFloat(formData.supermarketAgreement) || 0,
      dentalAgreement: parseFloat(formData.dentalAgreement) || 0,
      medicalAgreement: parseFloat(formData.medicalAgreement) || 0,
      otherAgreements: parseFloat(formData.otherAgreements) || 0,
      observations: formData.observations,
      createdAt: new Date().toISOString()
    };
    
    onSubmit(record);
  };

  if (employees.length === 0) {
    return (
      <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-4">
        <i className="fas fa-exclamation-triangle text-4xl text-amber-500"></i>
        <h2 className="text-2xl font-bold">Nenhum Funcionário</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Para realizar o fechamento da folha, você precisa primeiro cadastrar funcionários no sistema informando seus salários base.
        </p>
        <button
          onClick={onGoToEmployees}
          className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
        >
          Ir para Cadastro de Funcionários
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Lançamento de Folha</h2>
          <p className="text-slate-400">Navegue entre os campos usando TAB ou ENTER.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2">
            <i className="fas fa-info-circle"></i> Informações Gerais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Funcionário</label>
              <select
                name="employeeId"
                value={formData.employeeId || ''}
                onChange={handleInputChange}
                className="w-full h-[52px] bg-black text-white border border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                required
              >
                <option value="">Selecione um colaborador...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Data de Fechamento</label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleInputChange}
                className="w-full h-[52px] bg-black text-white border border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Earnings / Proventos */}
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <i className="fas fa-plus-circle"></i> Proventos (Rendimentos)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <FormField 
                  label="Salário Mensal" 
                  name="monthlySalary" 
                  value={formData.monthlySalary} 
                  onChange={handleInputChange} 
                  prefix="R$" 
                />
                <p className="text-[10px] text-slate-500 mt-1 italic group-hover:text-emerald-500/70">Preenchido auto pelo cadastro.</p>
              </div>
              <div className="group">
                <FormField 
                  label="Acúmulo de Função" 
                  name="functionAccumulation" 
                  value={formData.functionAccumulation} 
                  onChange={handleInputChange} 
                  prefix="R$" 
                />
                <p className="text-[10px] text-slate-500 mt-1 italic group-hover:text-emerald-500/70">Preenchido auto pelo cadastro.</p>
              </div>
              <FormField label="Outros Rendimentos" name="otherEarnings" value={formData.otherEarnings} onChange={handleInputChange} prefix="R$" />
              <FormField label="Prêmios" name="bonuses" value={formData.bonuses} onChange={handleInputChange} prefix="R$" />
              <FormField label="Cesta Básica" name="basicBasket" value={formData.basicBasket} onChange={handleInputChange} prefix="R$" />
              <FormField label="Vale Refeição" name="mealVoucher" value={formData.mealVoucher} onChange={handleInputChange} prefix="R$" />
              
              <div className="sm:col-span-2 grid grid-cols-3 gap-2 py-2">
                <FormField label="HE 100%" name="ot100" value={formData.ot100} onChange={handleInputChange} type="number" />
                <FormField label="HE 70%" name="ot70" value={formData.ot70} onChange={handleInputChange} type="number" />
                <FormField label="HE 50%" name="ot50" value={formData.ot50} onChange={handleInputChange} type="number" />
              </div>

              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  id="vt"
                  name="transportVoucher"
                  checked={formData.transportVoucher}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-emerald-500"
                />
                <label htmlFor="vt" className="text-sm font-medium text-slate-300">Vale Transporte (Sim)</label>
              </div>
            </div>
          </section>

          {/* Deductions / Descontos */}
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <i className="fas fa-minus-circle"></i> Descontos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Adiantamentos" name="advances" value={formData.advances} onChange={handleInputChange} prefix="R$" />
              <FormField label="Faltas (Dias/Horas)" name="absences" value={formData.absences} onChange={handleInputChange} type="number" />
              <FormField label="Empréstimos" name="loans" value={formData.loans} onChange={handleInputChange} prefix="R$" />
              <FormField label="Outros Descontos" name="otherDeductions" value={formData.otherDeductions} onChange={handleInputChange} prefix="R$" />
              
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <FormField label="Convênio Farmácia" name="pharmacyAgreement" value={formData.pharmacyAgreement} onChange={handleInputChange} prefix="R$" />
                <FormField label="Convênio Supermercado" name="supermarketAgreement" value={formData.supermarketAgreement} onChange={handleInputChange} prefix="R$" />
                <FormField label="Convênio Odontológico" name="dentalAgreement" value={formData.dentalAgreement} onChange={handleInputChange} prefix="R$" />
                <FormField label="Convênio Médico" name="medicalAgreement" value={formData.medicalAgreement} onChange={handleInputChange} prefix="R$" />
                <FormField label="Outros Convênios" name="otherAgreements" value={formData.otherAgreements} onChange={handleInputChange} prefix="R$" />
              </div>
            </div>
          </section>
        </div>

        {/* Observations */}
        <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-slate-400 flex items-center gap-2">
            <i className="fas fa-comment-dots"></i> Observações
          </h3>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-black text-white border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            placeholder="Informações adicionais relevantes sobre este fechamento..."
          ></textarea>
        </section>

        <div className="sticky bottom-4 z-10 flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-emerald-500 text-slate-950 text-lg font-bold py-4 rounded-2xl shadow-xl hover:bg-emerald-400 hover:scale-[1.01] transition-all active:scale-95"
          >
            Finalizar Lançamento
          </button>
          <button
            type="reset"
            onClick={() => {
              setFormData({
                closingDate: new Date().toISOString().split('T')[0],
                transportVoucher: false,
                monthlySalary: '',
                functionAccumulation: '',
                otherEarnings: '',
                bonuses: '',
                basicBasket: '',
                mealVoucher: '',
                ot100: '',
                ot70: '',
                ot50: '',
                advances: '',
                absences: '',
                loans: '',
                otherDeductions: '',
                pharmacyAgreement: '',
                supermarketAgreement: '',
                dentalAgreement: '',
                medicalAgreement: '',
                otherAgreements: '',
                observations: ''
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all"
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  prefix?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, value, onChange, type = "number", prefix }) => (
  <div className="flex flex-col">
    <label className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none z-10">
          {prefix}
        </span>
      )}
      <input
        type={type}
        name={name}
        step="0.01"
        value={value}
        onChange={onChange}
        placeholder="0.00"
        className={`w-full h-[52px] bg-black text-white border border-slate-700 rounded-xl px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${prefix ? 'pl-10' : ''}`}
      />
    </div>
  </div>
);

export default PayrollForm;
