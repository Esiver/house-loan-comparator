// src/components/Scenario.tsx

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loan, Scenario as ScenarioType } from '../../types';
import { LoanForm } from '../LoanForm/LoanForm';

interface ScenarioProps {
  scenario: ScenarioType;
  onUpdate: (updatedScenario: ScenarioType) => void;
  onRemove: () => void;
}

export const Scenario: React.FC<ScenarioProps> = ({ scenario, onUpdate, onRemove }) => {
  
    const handleUpdateLoan = (updatedLoan: Loan) => {
    const updatedLoans = scenario.loans.map((loan) =>
      loan.id === updatedLoan.id ? updatedLoan : loan
    );
    onUpdate({ ...scenario, loans: updatedLoans });
  };

 const handleAddLoan = () => {
    const newLoan: Loan = {
      id: uuidv4(),
      name: 'New Mortgage',
      principal: 2000000,
      interestRate: 1.5,
      termInYears: 30,
      type: 'fixed',
      interestFrequency: 4,
      kurs: 99, // Add default kurs
    };
    onUpdate({ ...scenario, loans: [...scenario.loans, newLoan] });
  };

  const handleRemoveLoan = (loanId: string) => {
    const updatedLoans = scenario.loans.filter((loan) => loan.id !== loanId);
    onUpdate({ ...scenario, loans: updatedLoans });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...scenario, name: e.target.value });
  };

  return (
    <div className="scenario">
      <div className="scenario-header">
        <h2>hello</h2>
        <input 
          className="scenario-name-input"
          value={scenario.name}
          onChange={handleNameChange}
          placeholder="Enter Scenario Name (e.g. Bank Offer)"
        />
        <button onClick={onRemove} className="remove-btn">Remove Scenario</button>
      </div>
      <div className="loan-forms">
      {scenario.loans.map((loan) => (
        <LoanForm
          key={loan.id}
          loan={loan}
          onUpdate={handleUpdateLoan}
          onRemove={() => handleRemoveLoan(loan.id)}
        />
      ))}
      </div>
      <button onClick={handleAddLoan} className="add-btn">+ Add Loan to Scenario</button>
    </div>
  );
};