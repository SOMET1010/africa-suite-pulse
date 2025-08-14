// BCEAO currency denominations for visual cash counting
// West African CFA Franc (XOF) - Used across WAEMU countries

export interface CurrencyDenomination {
  value: number;
  type: 'banknote' | 'coin';
  color: string;
  image?: string;
  description: string;
}

export const BCEAO_DENOMINATIONS: CurrencyDenomination[] = [
  // Banknotes (largest to smallest)
  {
    value: 10000,
    type: 'banknote',
    color: '#8B4513', // Brown
    description: '10 000 F CFA',
  },
  {
    value: 5000,
    type: 'banknote', 
    color: '#4B0082', // Indigo
    description: '5 000 F CFA',
  },
  {
    value: 2000,
    type: 'banknote',
    color: '#2E8B57', // Sea green
    description: '2 000 F CFA',
  },
  {
    value: 1000,
    type: 'banknote',
    color: '#FF6347', // Tomato
    description: '1 000 F CFA',
  },
  // Coins (largest to smallest)
  {
    value: 500,
    type: 'coin',
    color: '#FFD700', // Gold
    description: '500 F CFA',
  },
  {
    value: 250,
    type: 'coin',
    color: '#C0C0C0', // Silver
    description: '250 F CFA',
  },
  {
    value: 200,
    type: 'coin',
    color: '#CD7F32', // Bronze
    description: '200 F CFA',
  },
  {
    value: 100,
    type: 'coin',
    color: '#B87333', // Bronze
    description: '100 F CFA',
  },
  {
    value: 50,
    type: 'coin',
    color: '#DAA520', // Goldenrod
    description: '50 F CFA',
  },
  {
    value: 25,
    type: 'coin',
    color: '#A0522D', // Sienna
    description: '25 F CFA',
  },
];

// Calculate optimal change using greedy algorithm
export function calculateOptimalChange(changeAmount: number): Array<{ denomination: CurrencyDenomination; count: number }> {
  const result: Array<{ denomination: CurrencyDenomination; count: number }> = [];
  let remaining = Math.round(changeAmount);

  for (const denomination of BCEAO_DENOMINATIONS) {
    if (remaining >= denomination.value) {
      const count = Math.floor(remaining / denomination.value);
      result.push({ denomination, count });
      remaining -= count * denomination.value;
    }
  }

  return result;
}

// Format currency value for display
export function formatCurrencyValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} 000 F`;
  }
  return `${value} F`;
}

// Get denomination by value
export function getDenominationByValue(value: number): CurrencyDenomination | undefined {
  return BCEAO_DENOMINATIONS.find(d => d.value === value);
}