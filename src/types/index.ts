// src/types/index.ts

export type LoanType = 'fixed' | 'variable';

export interface Loan {
  id: string;
  name: string; // e.g., "Bank Loan", "Mortgage"
  principal: number;
  interestRate: number; // Annual interest rate in percent (e.g., 3.5)
  interestFrequency: number;
  kurs: number;
  termInYears: number;
  type: LoanType;
}

export interface Scenario {
  id: string;
  name: string; // e.g., "Nordea Offer", "Jyske Bank Offer"
  loans: Loan[];
}

// This type will hold the calculated results for a scenario
export interface ScenarioCalculationResults {
  scenarioId: string;
  scenarioName: string;
  totalPrincipal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalKurstab:number;
}