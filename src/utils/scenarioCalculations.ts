// src/utils/scenarioCalculations.ts - Enhanced calculation that properly accounts for bond prices (kurs)

import { Scenario, ScenarioCalculationResults, Loan } from '../types';
import { calculateMonthlyPayment, calculateIRREffectiveRate } from './loanCalculations';

export interface DetailedLoanResult {
  loan: Loan;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  kurstab: number;
  effectiveInterestRate: number;
  amountReceived: number; // New: actual amount received after kurs
  effectiveLoanAmount: number; // New: for comparison purposes
}

export interface EnhancedScenarioResults extends ScenarioCalculationResults {
  loanDetails: DetailedLoanResult[];
  averageInterestRate: number;
  totalLoanTerm: number;
  kurstabPercentage: number;
  totalAmountReceived: number; // New: total cash received
  effectiveInterestRate: number; // New: overall effective rate
  interestToIncomeRatio?: number;
}

/**
 * Enhanced loan calculation that properly accounts for bond issue prices (kurs)
 */
export const calculateLoanDetails = (loan: Loan): DetailedLoanResult => {
  // Monthly payment is based on the nominal principal (what you pay back)
  const monthlyPayment = calculateMonthlyPayment(
    loan.principal,
    loan.interestRate,
    loan.termInYears
  );
  
  const totalPayment = monthlyPayment * loan.termInYears * 12;
  const totalInterest = totalPayment - loan.principal;
  
  // Amount actually received (principal × kurs/100)
  const amountReceived = loan.principal * (loan.kurs || 100) / 100;
  
  // Kurstab is the immediate loss from issue price below par
  const kurstab = loan.principal - amountReceived;
  
  // Effective interest rate considering both interest and kurstab
  // This shows the true cost of borrowing relative to amount received
    const effectiveInterestRate = loan.kurs < 100 ? calculateIRREffectiveRate(
  loan.principal,
  loan.kurs,
  monthlyPayment,
  loan.termInYears
) ?? loan.interestRate : loan.interestRate;


  console.log('effectiveInterestRate: ', effectiveInterestRate, `${totalInterest} + ${kurstab} / ${amountReceived} / ${loan.termInYears} * 100`)

  return {
    loan,
    monthlyPayment,
    totalPayment,
    totalInterest,
    kurstab,
    effectiveInterestRate,
    amountReceived,
    effectiveLoanAmount: amountReceived, // For weighted calculations
  };
};

/**
 * Enhanced scenario calculation with proper bond price consideration
 */
export const calculateScenarioResults = (scenario: Scenario): EnhancedScenarioResults => {
  if (!scenario.loans || scenario.loans.length === 0) {
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      totalPrincipal: 0,
      monthlyPayment: 0,
      totalKurstab: 0,
      totalInterest: 0,
      totalCost: 0,
      loanDetails: [],
      averageInterestRate: 0,
      totalLoanTerm: 0,
      kurstabPercentage: 0,
      totalAmountReceived: 0,
      effectiveInterestRate: 0,
    };
  }

  const loanDetails = scenario.loans.map(calculateLoanDetails);

  // Aggregate totals
  const totals = loanDetails.reduce(
    (acc, detail) => ({
      totalPrincipal: acc.totalPrincipal + detail.loan.principal,
      monthlyPayment: acc.monthlyPayment + detail.monthlyPayment,
      totalKurstab: acc.totalKurstab + detail.kurstab,
      totalInterest: acc.totalInterest + detail.totalInterest,
      totalAmountReceived: acc.totalAmountReceived + detail.amountReceived,
    }),
    { 
      totalPrincipal: 0, 
      monthlyPayment: 0, 
      totalKurstab: 0, 
      totalInterest: 0,
      totalAmountReceived: 0 
    }
  );

  const totalCost = totals.totalPrincipal + totals.totalInterest + totals.totalKurstab;

  // Weighted average interest rate based on principal amounts
  const averageInterestRate = scenario.loans.reduce(
    (acc, loan) => acc + (loan.interestRate * loan.principal),
    0
  ) / totals.totalPrincipal;

  // Weighted average loan term
  const totalLoanTerm = scenario.loans.reduce(
    (acc, loan) => acc + (loan.termInYears * loan.principal),
    0
  ) / totals.totalPrincipal;

  // Kurstab as percentage of total principal
  const kurstabPercentage = (totals.totalKurstab / totals.totalPrincipal) * 100;

  // Overall effective interest rate considering kurstab
//   const effectiveInterestRate = totals.totalAmountReceived > 0 
//     ? ((totals.totalInterest + totals.totalKurstab) / totals.totalAmountReceived) / (totalLoanTerm) * 100
//     : averageInterestRate;


    const totalWeightedEffectiveRate = loanDetails.reduce(
  (acc, detail) => acc + (detail.effectiveInterestRate * detail.effectiveLoanAmount),
  0
);

const effectiveInterestRate = totals.totalAmountReceived > 0
  ? totalWeightedEffectiveRate / totals.totalAmountReceived
  : averageInterestRate;

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    ...totals,
    totalCost,
    loanDetails,
    averageInterestRate,
    totalLoanTerm,
    kurstabPercentage,
    effectiveInterestRate,
  };
};

/**
 * Calculate and compare multiple scenarios
 */
export const calculateMultipleScenarios = (scenarios: Scenario[]): EnhancedScenarioResults[] => {
  return scenarios.map(calculateScenarioResults);
};

/**
 * Find the best scenario based on total cost
 */
export const findBestScenario = (results: EnhancedScenarioResults[]): EnhancedScenarioResults | null => {
  if (results.length === 0) return null;
  
  return results.reduce((best, current) => 
    current.totalCost < best.totalCost ? current : best
  );
};

/**
 * Calculate savings compared to the most expensive scenario
 */
export const calculateSavings = (results: EnhancedScenarioResults[]) => {
  if (results.length < 2) return [];

  const sortedResults = [...results].sort((a, b) => a.totalCost - b.totalCost);
  const mostExpensive = sortedResults[sortedResults.length - 1];

  return results.map(result => ({
    ...result,
    savingsVsMostExpensive: mostExpensive.totalCost - result.totalCost,
    savingsPercentage: ((mostExpensive.totalCost - result.totalCost) / mostExpensive.totalCost) * 100,
  }));
};

/**
 * Helper function to explain the bond price impact
 */
export const explainBondPriceImpact = (loan: Loan) => {
  const kurs = loan.kurs || 100;
  const principal = loan.principal;
  const amountReceived = principal * kurs / 100;
  const kurstab = principal - amountReceived;
  
  return {
    nominal: principal,
    received: amountReceived,
    loss: kurstab,
    lossPercentage: (kurstab / principal) * 100,
    explanation: kurs < 100 
      ? `Issue price below par: You receive ${kurs}% of nominal value (${amountReceived.toLocaleString('da-DK')} DKK) but must repay the full nominal amount (${principal.toLocaleString('da-DK')} DKK). Immediate loss: ${kurstab.toLocaleString('da-DK')} DKK.`
      : kurs > 100 
      ? `Issue price above par: You receive ${kurs}% of nominal value (${amountReceived.toLocaleString('da-DK')} DKK) but only repay the nominal amount (${principal.toLocaleString('da-DK')} DKK). Immediate gain: ${Math.abs(kurstab).toLocaleString('da-DK')} DKK.`
      : 'Issue price at par: You receive exactly the nominal amount with no immediate gain or loss.'
  };
};