
import OpenAI from "openai";
import { AIMortgageParams, UserInput } from "../types";

const getClient = () => {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is missing");
        throw new Error("API Key is missing via process.env.DEEPSEEK_API_KEY");
    }
    return new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
};

export const fetchMortgageAssumptions = async (input: UserInput): Promise<AIMortgageParams> => {
    const client = getClient();

    const prompt = `
    Role: 中国房地产金融专家.
    Task: 为用户在 "${input.city}" 购买总价 ${input.price} 元的房产提供按揭贷款估算，并分析家庭收支。
    User Profile: ${input.isFirstHome ? "首套房" : "二套房"} 买家。
    Financial Profile: 税前年薪 ${input.annualSalary || 0} 元。
    User Selected Down Payment: ${(input.downPaymentRatio * 100).toFixed(0)}%.

    CRITICAL REQUIREMENTS:
    1. **利率 (interestRate)**: 根据 "${input.city}" 当前实际商业贷款利率（例如 3.0%-3.3%）。
    2. **收支估算**: 估算税后月入(netMonthlyIncome)、公积金(monthlyHousingFund)、生活支出(monthlyLivingCost)。
    
    Output JSON ONLY. No markdown code blocks.
    Schema:
    {
      "interestRate": number,
      "downPaymentRatio": number,
      "loanTermYears": number,
      "netMonthlyIncome": number,
      "monthlyHousingFund": number,
      "monthlyLivingCost": number,
      "marketAnalysis": string,
      "cityTrend": string
    }
    `;

    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (content) {
            const data = JSON.parse(content);
            return {
                interestRate: data.interestRate,
                downPaymentRatio: data.downPaymentRatio,
                loanTermYears: data.loanTermYears,
                marketAnalysis: data.marketAnalysis,
                cityTrend: data.cityTrend,
                netMonthlyIncome: data.netMonthlyIncome || 0,
                monthlyHousingFund: data.monthlyHousingFund || 0,
                monthlyLivingCost: data.monthlyLivingCost || 0
            };
        }
        throw new Error("No response content from DeepSeek");

    } catch (error) {
        console.error("Error fetching AI assumptions:", error);
        return {
            interestRate: 3.1,
            downPaymentRatio: input.downPaymentRatio,
            loanTermYears: 30,
            marketAnalysis: `AI 服务暂时不可用: ${error instanceof Error ? error.message : String(error)}`,
            cityTrend: "数据获取失败",
            netMonthlyIncome: input.annualSalary ? input.annualSalary / 12 * 0.75 : 0,
            monthlyHousingFund: input.annualSalary ? input.annualSalary / 12 * 0.24 : 0,
            monthlyLivingCost: 3000
        };
    }
};
