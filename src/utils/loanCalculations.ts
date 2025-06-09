// Updated loanCalculations.ts with IRR-based effective rate calculation

/**
 * Calculates the monthly payment for an annuity loan with quarterly interest compounding.
 * Assumes monthly payments and quarterly compounding (common in Denmark).
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termInYears: number
): number => {
  if (principal <= 0 || annualRate < 0 || termInYears <= 0) {
    return 0;
  }

  const compoundingPerYear = 4; // Quarterly
  const paymentsPerYear = 12;   // Monthly
  const n = termInYears * paymentsPerYear;

  const r = (1 + annualRate / 100 / compoundingPerYear) ** (compoundingPerYear / paymentsPerYear) - 1;

  if (r === 0) {
    return principal / n;
  }

  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/**
 * Calculates effective interest rate (IRR-based) to reflect true cost of borrowing.
 */
export const calculateIRREffectiveRate = (
  principal: number,
  kurs: number,
  monthlyPayment: number,
  termInYears: number
): number | null => {
  if (kurs <= 0 || principal <= 0 || monthlyPayment <= 0 || termInYears <= 0) return null;

  const amountReceived = principal * kurs / 100;
  const months = termInYears * 12;

  const cashFlows = [-amountReceived, ...Array(months).fill(monthlyPayment)];

  // Newton-Raphson or financial IRR calc:
  const irr = (flows: number[]): number | null => {
    let guess = 0.01;
    for (let i = 0; i < 100; i++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < flows.length; t++) {
        npv += flows[t] / Math.pow(1 + guess, t);
        if (t > 0) dnpv -= t * flows[t] / Math.pow(1 + guess, t + 1);
      }
      const newGuess = guess - npv / dnpv;
      if (Math.abs(newGuess - guess) < 1e-7) return newGuess;
      guess = newGuess;
    }
    return null;
  };

  const monthlyIRR = irr(cashFlows);
  if (monthlyIRR === null || monthlyIRR <= 0) return null;

  const annualIRR = (1 + monthlyIRR) ** 12 - 1;
  return annualIRR * 100;
};
