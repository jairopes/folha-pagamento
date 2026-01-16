
export interface Employee {
  id: string;
  name: string;
  company: string; // Nova propriedade
  role: string;
  registrationDate: string; // Data de criação no sistema
  
  // Novos campos solicitados
  admissionDate: string;
  exitDate?: string;
  address: string;
  cep: string;
  phone: string;
  city: string;
  state: string;
  rg: string;
  cpf: string;
  ctps: string;
  pis: string;
  fatherName: string;
  motherName: string;
  
  // Campos existentes
  baseSalary: number;
  baseFunctionAccumulation: number;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  date: string;
  salaryBase: number;
  advanceAmount: number;
  status: 'pendente' | 'pago';
  observations?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  closingDate: string;
  
  // Earnings (Proventos)
  monthlySalary: number;
  functionAccumulation: number;
  otherEarnings: number;
  bonuses: number;
  basicBasket: number;
  mealVoucher: number;
  ot100: number; // Hours
  ot70: number;  // Hours
  ot50: number;  // Hours
  transportVoucher: boolean;

  // Deductions (Descontos)
  advances: number;
  absences: number; // Number of days/hours
  loans: number;
  otherDeductions: number;
  pharmacyAgreement: number;
  supermarketAgreement: number;
  dentalAgreement: number;
  medicalAgreement: number;
  otherAgreements: number;

  observations: string;
  createdAt: string;
}

export type TabType = 'dashboard' | 'payroll' | 'advances' | 'employees' | 'history';
