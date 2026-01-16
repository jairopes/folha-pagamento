
import React, { useState, useMemo } from 'react';
import { Employee } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  onAdd: (employee: Employee) => void;
  onUpdate: (employee: Employee) => void;
  onRemove: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onAdd, onUpdate, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    admissionDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    address: '',
    cep: '',
    phone: '',
    city: '',
    state: '',
    rg: '',
    cpf: '',
    ctps: '',
    pis: '',
    fatherName: '',
    motherName: '',
    baseSalary: '',
    baseAccumulation: ''
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cpf.includes(searchTerm)
    );
  }, [employees, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para navegar com ENTER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      // Se for um botão ou textarea, permite o comportamento padrão
      if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault(); // Impede o submit do formulário
      
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

  const startEdit = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setFormData({
      name: employee.name,
      company: employee.company || '',
      role: employee.role,
      admissionDate: employee.admissionDate,
      exitDate: employee.exitDate || '',
      address: employee.address,
      cep: employee.cep,
      phone: employee.phone,
      city: employee.city,
      state: employee.state,
      rg: employee.rg,
      cpf: employee.cpf,
      ctps: employee.ctps,
      pis: employee.pis,
      fatherName: employee.fatherName,
      motherName: employee.motherName,
      baseSalary: employee.baseSalary.toString(),
      baseAccumulation: employee.baseFunctionAccumulation.toString()
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingEmployeeId(null);
    setFormData({
      name: '',
      company: '',
      role: '',
      admissionDate: new Date().toISOString().split('T')[0],
      exitDate: '',
      address: '',
      cep: '',
      phone: '',
      city: '',
      state: '',
      rg: '',
      cpf: '',
      ctps: '',
      pis: '',
      fatherName: '',
      motherName: '',
      baseSalary: '',
      baseAccumulation: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const employeeData: Employee = {
      id: editingEmployeeId || Date.now().toString(),
      name: formData.name,
      company: formData.company,
      role: formData.role || 'Funcionário',
      registrationDate: editingEmployeeId ? (employees.find(e => e.id === editingEmployeeId)?.registrationDate || new Date().toISOString()) : new Date().toISOString(),
      admissionDate: formData.admissionDate,
      exitDate: formData.exitDate || undefined,
      address: formData.address,
      cep: formData.cep,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      rg: formData.rg,
      cpf: formData.cpf,
      ctps: formData.ctps,
      pis: formData.pis,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      baseSalary: parseFloat(formData.baseSalary) || 0,
      baseFunctionAccumulation: parseFloat(formData.baseAccumulation) || 0
    };

    if (editingEmployeeId) {
      onUpdate(employeeData);
      alert('Cadastro atualizado com sucesso!');
    } else {
      onAdd(employeeData);
      alert('Novo funcionário cadastrado!');
    }
    
    cancelForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Quadro de Funcionários</h2>
          <p className="text-slate-400">Gestão centralizada de prontuários e documentos.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <i className="fas fa-user-plus"></i> Novo Funcionário
          </button>
        )}
      </div>

      {!isAdding && (
        <div className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fas fa-search text-slate-500 group-focus-within:text-emerald-500 transition-colors"></i>
          </div>
          <input
            type="text"
            placeholder="Pesquisar funcionário por nome, cargo, empresa ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-xl"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>
      )}

      {isAdding && (
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          <div className={`${editingEmployeeId ? 'bg-blue-500/10' : 'bg-emerald-500/10'} border-b border-white/10 p-6 flex justify-between items-center`}>
            <h3 className={`text-xl font-bold ${editingEmployeeId ? 'text-blue-400' : 'text-emerald-400'} flex items-center gap-2`}>
              <i className={editingEmployeeId ? 'fas fa-user-edit' : 'fas fa-id-card'}></i> 
              {editingEmployeeId ? 'Editando Prontuário' : 'Ficha de Cadastro Completa'}
            </h3>
            <button type="button" onClick={cancelForm} className="text-slate-500 hover:text-white text-xl">
               <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-8 space-y-10">
            {/* Seção: Identificação e Datas */}
            <section className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 ${editingEmployeeId ? 'border-blue-500' : 'border-emerald-500'} pl-3`}>Identificação e Contrato</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                  <input
                    autoFocus
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo do colaborador"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Empresa</label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none h-[52px]"
                    required
                  >
                    <option value="">Selecione a Empresa</option>
                    <option value="CAMPLUVAS">CAMPLUVAS</option>
                    <option value="LOCATEX">LOCATEX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Função / Cargo</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Ex: Auxiliar Administrativo"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Data de Admissão</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Data de Saída (Opcional)</label>
                  <input
                    type="date"
                    name="exitDate"
                    value={formData.exitDate}
                    onChange={handleInputChange}
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Seção: Filiação */}
            <section className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 ${editingEmployeeId ? 'border-blue-500' : 'border-emerald-500'} pl-3`}>Filiação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Pai</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Nome completo do pai"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Mãe</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="Nome completo da mãe"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Seção: Documentação */}
            <section className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 ${editingEmployeeId ? 'border-blue-500' : 'border-emerald-500'} pl-3`}>Documentação</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nº RG</label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    placeholder="00.000.000-0"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nº CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nº CTPS</label>
                  <input
                    type="text"
                    name="ctps"
                    value={formData.ctps}
                    onChange={handleInputChange}
                    placeholder="Série / Número"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nº PIS</label>
                  <input
                    type="text"
                    name="pis"
                    value={formData.pis}
                    onChange={handleInputChange}
                    placeholder="000.00000.00-0"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Seção: Endereço */}
            <section className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 ${editingEmployeeId ? 'border-blue-500' : 'border-emerald-500'} pl-3`}>Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Endereço (Rua, Nº, Bairro)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ex: Av. Principal, 123 - Centro"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="UF"
                    maxLength={2}
                    className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  />
                </div>
              </div>
            </section>

            {/* Seção: Financeiro */}
            <section className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest text-slate-500 border-l-2 ${editingEmployeeId ? 'border-blue-500' : 'border-emerald-500'} pl-3`}>Configuração Financeira</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Salário Base (Mensal)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="baseSalary"
                      value={formData.baseSalary}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Acúmulo de Função Base</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="baseAccumulation"
                      value={formData.baseAccumulation}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-black text-white border border-slate-700 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-slate-950/50 p-8 flex gap-4 border-t border-slate-800">
            <button
              type="submit"
              className={`flex-1 ${editingEmployeeId ? 'bg-blue-500 hover:bg-blue-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-slate-950 px-8 py-4 rounded-xl font-bold transition-all text-lg shadow-xl`}
            >
              {editingEmployeeId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-8 py-4 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Grid de Cards dos Funcionários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <i className="fas fa-search-minus text-5xl text-slate-700 mb-4 block"></i>
            <p className="text-slate-500 text-lg">Nenhum funcionário encontrado para "{searchTerm}".</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all group flex flex-col h-full shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <i className="fas fa-user-tie text-2xl"></i>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(employee)}
                    className="text-slate-400 hover:text-blue-400 p-2 transition-colors bg-black/30 rounded-lg"
                    title="Editar Prontuário"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => onRemove(employee.id)}
                    className="text-slate-400 hover:text-red-500 p-2 transition-colors bg-black/30 rounded-lg"
                    title="Remover Registro"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xl font-bold group-hover:text-emerald-400 transition-colors leading-tight truncate" title={employee.name}>{employee.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-black rounded uppercase tracking-tighter border border-slate-700">{employee.company || 'N/A'}</span>
                  <p className="text-emerald-500/70 text-sm font-semibold uppercase tracking-wider">{employee.role}</p>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div className="bg-black/30 p-3 rounded-xl border border-slate-800/50">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Dados do Prontuário</p>
                   <div className="space-y-1.5">
                      <p className="text-xs text-slate-300 flex justify-between">
                        <span className="text-slate-500">Admissão:</span>
                        <span className="font-bold">{new Date(employee.admissionDate + 'T00:00:00').toLocaleDateString()}</span>
                      </p>
                      <p className="text-xs text-slate-300 flex justify-between">
                        <span className="text-slate-500">CPF:</span>
                        <span className="font-bold">{employee.cpf || 'Não inf.'}</span>
                      </p>
                      <p className="text-xs text-slate-300 flex justify-between">
                        <span className="text-slate-500">CTPS:</span>
                        <span className="font-bold truncate ml-2 text-right">{employee.ctps || 'N/A'}</span>
                      </p>
                   </div>
                </div>

                <div className="bg-black/30 p-3 rounded-xl border border-slate-800/50">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Remuneração Base</p>
                   <div className="space-y-1.5">
                      <p className="text-xs text-slate-300 flex justify-between">
                        <span className="text-slate-500">Salário:</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(employee.baseSalary)}</span>
                      </p>
                   </div>
                </div>

                {/* Resumo de Endereço/Contato */}
                <div className="text-[10px] text-slate-600 space-y-1">
                   <p className="truncate"><i className="fas fa-map-marker-alt w-3"></i> {employee.city}/{employee.state} - {employee.address}</p>
                   <p><i className="fas fa-phone w-3"></i> {employee.phone || 'Sem fone'}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span>Ref: ID-{employee.id.slice(-5)}</span>
                <span className={`px-2 py-1 rounded ${employee.exitDate ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                   {employee.exitDate ? 'Desligado' : 'Ativo'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
