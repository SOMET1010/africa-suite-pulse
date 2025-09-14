// BCEAO currency denominations for visual cash counting
// West African CFA Franc (XOF) - Used across WAEMU countries

export interface CurrencyDenomination {
  value: number;
  type: 'banknote' | 'coin';
  color: string;
  imagePath: string;
  description: string;
}

export const BCEAO_DENOMINATIONS: CurrencyDenomination[] = [
  // Banknotes (largest to smallest)
  {
    value: 10000,
    type: 'banknote',
    color: '#8B4513', // Brown
    imagePath: '/assets/currency/bceao/banknotes/bceao-10000.webp',
    description: '10 000 F CFA',
  },
  {
    value: 5000,
    type: 'banknote', 
    color: '#4B0082', // Indigo
    imagePath: '/assets/currency/bceao/banknotes/bceao-5000.webp',
    description: '5 000 F CFA',
  },
  {
    value: 2000,
    type: 'banknote',
    color: '#2E8B57', // Sea green
    imagePath: '/assets/currency/bceao/banknotes/bceao-2000.webp',
    description: '2 000 F CFA',
  },
  {
    value: 1000,
    type: 'banknote',
    color: '#FF6347', // Tomato
    imagePath: '/assets/currency/bceao/banknotes/bceao-1000.webp',
    description: '1 000 F CFA',
  },
  // Coins (largest to smallest)
  {
    value: 500,
    type: 'coin',
    color: '#FFD700', // Gold
    imagePath: '/assets/currency/bceao/coins/bceao-500.webp',
    description: '500 F CFA',
  },
  {
    value: 250,
    type: 'coin',
    color: '#C0C0C0', // Silver
    imagePath: '/assets/currency/bceao/coins/bceao-250.webp',
    description: '250 F CFA',
  },
  {
    value: 200,
    type: 'coin',
    color: '#CD7F32', // Bronze
    imagePath: '/assets/currency/bceao/coins/bceao-200.webp',
    description: '200 F CFA',
  },
  {
    value: 100,
    type: 'coin',
    color: '#B87333', // Bronze
    imagePath: '/assets/currency/bceao/coins/bceao-100.webp',
    description: '100 F CFA',
  },
  {
    value: 50,
    type: 'coin',
    color: '#DAA520', // Goldenrod
    imagePath: '/assets/currency/bceao/coins/bceao-50.webp',
    description: '50 F CFA',
  },
  {
    value: 25,
    type: 'coin',
    color: '#A0522D', // Sienna
    imagePath: '/assets/currency/bceao/coins/bceao-25.webp',
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