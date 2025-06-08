// src/components/ComparisonSummary.tsx

import React from 'react';
import { ScenarioCalculationResults } from '../../types';
import './style.css'

interface ComparisonSummaryProps {
  results: ScenarioCalculationResults[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
     <div className="summary-container">
      <h2>Comparison Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Total Principal</th>
            <th>Total Monthly Payment</th>
            <th>Exchange Loss (Kurstab)</th>
            <th>Total Interest Paid</th>
            <th>Total Cost (Principal + Interest + Loss)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.scenarioId}>
              <td>{result.scenarioName}</td>
              <td>{formatCurrency(result.totalPrincipal)}</td>
              <td>{formatCurrency(result.monthlyPayment)}</td>
              <td>{formatCurrency(result.totalKurstab)}</td>
              <td>{formatCurrency(result.totalInterest)}</td>
              <td><strong>{formatCurrency(result.totalCost)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};