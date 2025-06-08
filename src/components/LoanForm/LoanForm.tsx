// src/components/LoanForm.tsx

import React from 'react';
import { Loan } from '../../types/index';

interface LoanFormProps {
  loan: Loan;
  onUpdate: (updatedLoan: Loan) => void;
  onRemove: () => void;
}

export const LoanForm: React.FC<LoanFormProps> = ({ loan, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['principal', 'interestRate', 'termInYears', 'kurs'].includes(name);
    onUpdate({ ...loan, [name]: isNumberField ? Number(value) : value });
  };

  return (
    <div className="loan-form">
      <h4>{loan.name || 'New Loan'}</h4>
      <div className="form-grid">
        <label>
          Loan Name
          <input name="name" value={loan.name} onChange={handleChange} placeholder="e.g. Bank Loan" />
        </label>
        <label>
          Principal (DKK)
          <input name="principal" type="number" value={loan.principal} onChange={handleChange} />
        </label>
        <label>
          Issue Price (Kurs)
          <input name="kurs" type="number" step="0.01" value={loan.kurs} onChange={handleChange} />
        </label>
        <label>
          Interest Rate (%)
          <input name="interestRate" type="number" step="0.01" value={loan.interestRate} onChange={handleChange} />
        </label>
        <label>
          Term (Years)
          <input name="termInYears" type="number" value={loan.termInYears} onChange={handleChange} />
        </label>
        <label>
          Loan Type
          <select name="type" value={loan.type} onChange={handleChange}>
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
          </select>
        </label>
      </div>
      <button onClick={onRemove} className="remove-btn">Remove Loan</button>
    </div>
  );
};