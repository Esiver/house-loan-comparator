// src/utils/scenarioCalculations.ts

import { Scenario, ScenarioCalculationResults, Loan } from '../types';
import { calculateMonthlyPayment } from './loanCalculations';

export interface DetailedLoanResult {
  loan: Loan;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  kurstab: number;
  effectiveInterestRate: number;
}

export interface EnhancedScenarioResults extends ScenarioCalculationResults {
  loanDetails: DetailedLoanResult[];
  averageInterestRate: number;
  totalLoanTerm: number;
  kurstabPercentage: number;
  interestToIncomeRatio?: number; // Optional for future use
}

/**
 * Calculate detailed results for a single loan
 */
export const calculateLoanDetails = (loan: Loan): DetailedLoanResult => {
  const monthlyPayment = calculateMonthlyPayment(
    loan.principal,
    loan.interestRate,
    loan.termInYears
  );
  
  const totalPayment = monthlyPayment * loan.termInYears * 12;
  const totalInterest = totalPayment - loan.principal;
  const kurstab = loan.principal * (1 - (loan.kurs || 100) / 100);
  
  // Calculate effective interest rate including kurstab
  const effectiveInterestRate = loan.kurs < 100 
    ? ((totalInterest + kurstab) / loan.principal) / loan.termInYears * 100
    : loan.interestRate;

  return {
    loan,
    monthlyPayment,
    totalPayment,
    totalInterest,
    kurstab,
    effectiveInterestRate,
  };
};

/**
 * Calculate comprehensive scenario results with detailed breakdown
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
    };
  }

  // Calculate details for each loan
  const loanDetails = scenario.loans.map(calculateLoanDetails);

  // Aggregate totals
  const totals = loanDetails.reduce(
    (acc, detail) => ({
      totalPrincipal: acc.totalPrincipal + detail.loan.principal,
      monthlyPayment: acc.monthlyPayment + detail.monthlyPayment,
      totalKurstab: acc.totalKurstab + detail.kurstab,
      totalInterest: acc.totalInterest + detail.totalInterest,
    }),
    { totalPrincipal: 0, monthlyPayment: 0, totalKurstab: 0, totalInterest: 0 }
  );

  const totalCost = totals.totalPrincipal + totals.totalInterest + totals.totalKurstab;

  // Calculate weighted average interest rate
  const averageInterestRate = scenario.loans.reduce(
    (acc, loan) => acc + (loan.interestRate * loan.principal),
    0
  ) / totals.totalPrincipal;

  // Calculate weighted average loan term
  const totalLoanTerm = scenario.loans.reduce(
    (acc, loan) => acc + (loan.termInYears * loan.principal),
    0
  ) / totals.totalPrincipal;

  // Calculate kurstab as percentage of total principal
  const kurstabPercentage = (totals.totalKurstab / totals.totalPrincipal) * 100;

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    ...totals,
    totalCost,
    loanDetails,
    averageInterestRate,
    totalLoanTerm,
    kurstabPercentage,
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