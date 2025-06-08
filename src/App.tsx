// src/components/App.tsx

import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Scenario as ScenarioType, ScenarioCalculationResults } from './types/index';
import { calculateMonthlyPayment } from './utils/loanCalculations';
import { Scenario } from './components/Scenario/Scenario';
import { ComparisonSummary } from './components/ComparisonSummary/ComparisonSummary';
import './styles/App.css';

// Initial state with a sample scenario to guide the user
const initialScenarios: ScenarioType[] = [
  {
    id: uuidv4(),
    name: 'Jyske Bank',
    loans: [
      {
        id: uuidv4(),
        name: 'Bank Loan (Banklån)',
        principal: 600000,
        interestRate: 3.36,
        termInYears: 20,
        type: 'fixed',
        interestFrequency: 4,
        kurs: 100
      },
      {
        id: uuidv4(),
        name: 'Mortgage (Realkreditlån)',
        principal: 3196000,
        interestRate: 3.1,
        termInYears: 30,
        type: 'fixed',
        kurs:94.7331,
        interestFrequency: 4
      },
    ],
  },
];

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioType[]>(initialScenarios);

  const handleAddScenario = () => {
    setScenarios([
      ...scenarios,
      { id: uuidv4(), name: `New Scenario ${scenarios.length + 1}`, loans: [] },
    ]);
  };

  const handleUpdateScenario = (updatedScenario: ScenarioType) => {
    setScenarios(
      scenarios.map((s) => (s.id === updatedScenario.id ? updatedScenario : s))
    );
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setScenarios(scenarios.filter((s) => s.id !== scenarioId));
  };

  // useMemo will re-calculate only when the scenarios state changes.
  const summaryResults: ScenarioCalculationResults[] = useMemo(() => {
    return scenarios.map((scenario) => {
      let totalPrincipal = 0;
      let monthlyPayment = 0;
      let totalPaidOverTime = 0;
      
      let totalKurstab = 0;

      scenario.loans.forEach((loan) => {
        const loanMonthlyPayment = calculateMonthlyPayment(
          loan.principal,
          loan.interestRate,
          loan.termInYears
        );
        const kurstab = loan.principal * (1 - (loan.kurs || 100) / 100)
        totalPrincipal += loan.principal;
        monthlyPayment += loanMonthlyPayment;
        totalPaidOverTime += loanMonthlyPayment * loan.termInYears * 12;
        totalKurstab += kurstab;
      });

      const totalInterest = totalPaidOverTime - totalPrincipal;
      const totalCost = totalPrincipal + totalInterest + totalKurstab;

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        totalPrincipal,
        monthlyPayment,
        totalKurstab,
        totalInterest,
        totalCost,
      };
    });
  }, [scenarios]);


  return (
    <div className="App">
      <header>
        <h1>Danish Housing Loan Comparator</h1>
        <p>Create different scenarios with combined loans to compare your options.</p>
      </header>

      <main>
        <ComparisonSummary results={summaryResults} />
        
        <div className="scenarios-list">
          {scenarios.map((scenario) => (
            <Scenario
              key={scenario.id}
              scenario={scenario}
              onUpdate={handleUpdateScenario}
              onRemove={() => handleRemoveScenario(scenario.id)}
            />
          ))}
        </div>
        <button onClick={handleAddScenario} className="add-btn add-scenario-btn">
          + Add Comparison Scenario
        </button>
      </main>
    </div>
  );
};

export default App;