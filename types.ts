
// Define the structure of the user input
export interface UserInput {
    city: string;
    price: number;
    isFirstHome: boolean;
    annualSalary: number; // Pre-tax annual salary in CNY
    downPaymentRatio: number; // User selected ratio, e.g., 0.3
}

// Define the AI-generated assumption parameters
export interface AIMortgageParams {
    interestRate: number; // Percentage, e.g., 3.5
    downPaymentRatio: number; // Decimal, e.g., 0.30 (AI suggestion, can be overridden)
    loanTermYears: number;
    marketAnalysis: string;
    cityTrend: string;
    // New fields for Wealth Analysis
    netMonthlyIncome?: number; // Estimated after-tax cash income
    monthlyHousingFund?: number; // Total provident fund (personal + company)
    monthlyLivingCost?: number; // Estimated living expenses
}

// Define the calculated mortgage schedule item
export interface AmortizationItem {
    month: number;
    principal: number;
    interest: number;
    balance: number;
    totalPaid: number;
    wealthAccumulation?: number; // Net savings accumulated
}

// Define the full calculated result set
export interface CalculationResult {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    loanAmount: number;
    downPayment: number;
    schedule: AmortizationItem[];
    params: AIMortgageParams;
    // Wealth metrics
    monthlyNetSavings?: number; // Net Income + Housing Fund - Mortgage - Living Cost
}

export enum LoadingState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}
