// src/components/App.tsx

import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Scenario as ScenarioType } from './types/index';
import { calculateMultipleScenarios, EnhancedScenarioResults } from './utils/scenarioCalculations';
import { Scenario } from './components/Scenario/Scenario';
import { EnhancedComparisonSummary } from './components/EnhancedComparisonSummary/EnhancedComparisonSummary';
import './styles/App.css';

// Initial state with a sample scenario to guide the user
const initialScenarios: ScenarioType[] = [
  {
    id: uuidv4(),
    name: 'Jyske Bank Offer',
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
        kurs: 94.7331,
        interestFrequency: 4
      },
    ],
  },
  {
    id: uuidv4(),
    name: 'Alternative Bank Offer',
    loans: [
      {
        id: uuidv4(),
        name: 'Bank Loan (Banklån)',
        principal: 600000,
        interestRate: 3.25,
        termInYears: 20,
        type: 'fixed',
        interestFrequency: 4,
        kurs: 100
      },
      {
        id: uuidv4(),
        name: 'Mortgage (Realkreditlån)',
        principal: 3196000,
        interestRate: 2.95,
        termInYears: 30,
        type: 'fixed',
        kurs: 96.2,
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
      { 
        id: uuidv4(), 
        name: `Scenario ${scenarios.length + 1}`, 
        loans: [] 
      },
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

  // Enhanced calculation results using the new business logic
  const enhancedResults: EnhancedScenarioResults[] = useMemo(() => {
    return calculateMultipleScenarios(scenarios);
  }, [scenarios]);

  return (
    <div className="App">
      <header>
        <h1>🏠 Danish Housing Loan Comparator</h1>
        <p>Create different scenarios with combined loans to find your best mortgage option.</p>
      </header>

      <main>
        <EnhancedComparisonSummary results={enhancedResults} />
        
        <div className="scenarios-section">
          <h2>📋 Your Loan Scenarios</h2>
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
        </div>
      </main>
    </div>
  );
};

export default App;