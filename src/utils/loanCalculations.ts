/**
 * Calculates the monthly payment for an annuity loan with quarterly interest compounding.
 * Assumes monthly payments and quarterly compounding (common in Denmark).
 *
 * @param principal - The total loan amount.
 * @param annualRate - The annual interest rate as a percentage (e.g., 5 for 5%).
 * @param termInYears - The loan term in years.
 * @returns The calculated monthly payment.
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

  // If zero interest
  if (r === 0) {
    return principal / n;
  }

  const monthlyPayment =
    principal *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  return monthlyPayment;
};
