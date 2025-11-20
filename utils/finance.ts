
import { AmortizationItem, AIMortgageParams } from '../types';

/**
 * Calculates the mortgage amortization schedule and summary.
 * Uses the standard formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
 */
export const calculateMortgage = (
    totalPrice: number,
    userDownPaymentRatio: number, // Passed from user input
    params: AIMortgageParams
) => {
    // Use user's ratio if provided, otherwise fallback to AI's suggestion (though UI enforces user selection now)
    const ratioToUse = userDownPaymentRatio || params.downPaymentRatio;
    const downPayment = totalPrice * ratioToUse;
    const loanAmount = totalPrice - downPayment;
    
    const annualRate = params.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = params.loanTermYears * 12;

    let monthlyPayment = 0;

    if (monthlyRate === 0) {
        monthlyPayment = loanAmount / totalMonths;
    } else {
        monthlyPayment =
            (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const schedule: AmortizationItem[] = [];
    let balance = loanAmount;
    let totalInterest = 0;
    let totalPaid = 0;
    
    // Wealth Calculation Setup
    let currentWealth = 0;
    const netIncome = params.netMonthlyIncome || 0;
    const housingFund = params.monthlyHousingFund || 0;
    const livingCost = params.monthlyLivingCost || 0;
    
    // Monthly Savings = (Net Cash + Housing Fund) - Mortgage Payment - Living Cost
    // Note: Assuming Housing Fund can be fully utilized for mortgage covering.
    const monthlyNetSavings = (netIncome + housingFund) - monthlyPayment - livingCost;

    for (let i = 1; i <= totalMonths; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        if (balance < 0) balance = 0; // Precision fix

        totalInterest += interestPayment;
        totalPaid += monthlyPayment;
        
        // Wealth Accumulation
        currentWealth += monthlyNetSavings;

        // Add data points for charts
        if (i % 12 === 0 || i === 1 || i === totalMonths) {
             schedule.push({
                month: i,
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                balance: Math.round(balance),
                totalPaid: Math.round(totalPaid),
                wealthAccumulation: Math.round(currentWealth)
            });
        }
    }

    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPaid),
        totalInterest: Math.round(totalInterest),
        loanAmount: Math.round(loanAmount),
        downPayment: Math.round(downPayment),
        schedule,
        params,
        monthlyNetSavings: Math.round(monthlyNetSavings)
    };
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        maximumFractionDigits: 0
    }).format(amount);
};
