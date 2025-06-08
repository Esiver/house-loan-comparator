// src/types/index.ts - Updated with enhanced bond price support

export type LoanType = 'fixed' | 'variable';

export interface Loan {
  id: string;
  name: string; // e.g., "Bank Loan", "Mortgage"
  principal: number;
  interestRate: number; // Annual interest rate in percent (e.g., 3.5)
  interestFrequency: number;
  kurs: number; // Bond issue price as percentage (e.g., 94.73 for below par)
  termInYears: number;
  type: LoanType;
}

export interface Scenario {
  id: string;
  name: string; // e.g., "Nordea Offer", "Jyske Bank Offer"
  loans: Loan[];
}

// Enhanced calculation results that include bond price considerations
export interface ScenarioCalculationResults {
  scenarioId: string;
  scenarioName: string;
  totalPrincipal: number; // Nominal amount to be repaid
  totalAmountReceived: number; // Actual cash received after kurs adjustment
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number; // Total of principal + interest + kurstab
  totalKurstab: number; // Total immediate loss from issue prices below par
  effectiveInterestRate: number; // True cost considering kurstab relative to amount received
}