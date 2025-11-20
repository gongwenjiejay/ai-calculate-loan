
import { GoogleGenAI, Type } from "@google/genai";
import { AIMortgageParams, UserInput } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is missing");
        throw new Error("API Key is missing via process.env.API_KEY");
    }
    return new GoogleGenAI({ apiKey });
};

export const fetchMortgageAssumptions = async (input: UserInput): Promise<AIMortgageParams> => {
    const ai = getClient();

    // Constructed to force the AI to consider specific city tiers and LPR policies
    const prompt = `
    Role: 中国房地产金融专家 (Chinese Real Estate Financial Expert).
    Task: 为用户在 "${input.city}" 购买总价 ${input.price} 元的房产提供按揭贷款估算，并分析家庭收支。
    User Profile: ${input.isFirstHome ? "首套房" : "二套房"} 买家。
    Financial Profile: 税前年薪 ${input.annualSalary || 0} 元。
    User Selected Down Payment: ${(input.downPaymentRatio * 100).toFixed(0)}% (Use this for calculation context).

    CRITICAL REQUIREMENTS (必须严格区分城市政策):
    1. **利率 (interestRate)**: 
       - **一线城市 (北上广深)**: 利率通常较高。
       - **二线/新一线/三线城市**: 目前政策较宽松（例如 3.0% - 3.3% 左右）。
       - 请根据 "${input.city}" 的具体情况给出最接近真实的**商业贷款执行年利率**。
    
    2. **收支估算 (Income & Expense Analysis)**:
       - 如果年薪 > 0，请根据 "${input.city}" 的社保公积金政策估算：
         - **netMonthlyIncome**: 税后月入账现金（扣除五险一金和个税）。
         - **monthlyHousingFund**: 每月公积金总额（个人+公司双边）。
         - **monthlyLivingCost**: 该城市维持中等体面生活（含吃喝水电交通、如有孩子考虑基本抚养，如无则考虑休闲）的预估月支出。
       - 如果年薪为0，相关字段返回 0。

    3. **分析 (marketAnalysis)**:
       - 简述利率来源。
       - 简述生活成本估算逻辑（例如："按上海中等消费标准，扣除房贷前的基本生活支出..."）。

    Output JSON Schema:
    {
      "interestRate": number (e.g. 3.45),
      "downPaymentRatio": number (Use ${input.downPaymentRatio}),
      "loanTermYears": number (usually 30),
      "netMonthlyIncome": number (estimated monthly net cash),
      "monthlyHousingFund": number (estimated total housing fund),
      "monthlyLivingCost": number (estimated monthly living expense),
      "marketAnalysis": string (short explanation),
      "cityTrend": string (one sentence trend)
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        interestRate: {
                            type: Type.NUMBER,
                            description: "Annual commercial loan interest rate (%).",
                        },
                        downPaymentRatio: {
                            type: Type.NUMBER,
                            description: "Down payment ratio.",
                        },
                        loanTermYears: {
                            type: Type.INTEGER,
                            description: "Loan term in years.",
                        },
                        netMonthlyIncome: {
                            type: Type.NUMBER,
                            description: "Estimated monthly net income after tax.",
                        },
                        monthlyHousingFund: {
                            type: Type.NUMBER,
                            description: "Total monthly housing fund.",
                        },
                        monthlyLivingCost: {
                            type: Type.NUMBER,
                            description: "Estimated monthly living costs.",
                        },
                        marketAnalysis: {
                            type: Type.STRING,
                            description: "Explanation of rate and cost basis.",
                        },
                        cityTrend: {
                            type: Type.STRING,
                            description: "Market trend.",
                        },
                    },
                    required: ["interestRate", "downPaymentRatio", "loanTermYears", "marketAnalysis", "cityTrend"],
                },
            },
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return {
                interestRate: data.interestRate,
                downPaymentRatio: data.downPaymentRatio, // Should match input or AI correction
                loanTermYears: data.loanTermYears,
                marketAnalysis: data.marketAnalysis,
                cityTrend: data.cityTrend,
                netMonthlyIncome: data.netMonthlyIncome || 0,
                monthlyHousingFund: data.monthlyHousingFund || 0,
                monthlyLivingCost: data.monthlyLivingCost || 0
            };
        }
        throw new Error("No response text from Gemini");

    } catch (error) {
        console.error("Error fetching AI assumptions:", error);
        return {
            interestRate: 3.6,
            downPaymentRatio: input.downPaymentRatio,
            loanTermYears: 30,
            marketAnalysis: "AI 服务暂时不可用。已应用通用估算值。",
            cityTrend: "数据获取失败",
            netMonthlyIncome: input.annualSalary ? input.annualSalary / 12 * 0.75 : 0,
            monthlyHousingFund: input.annualSalary ? input.annualSalary / 12 * 0.24 : 0,
            monthlyLivingCost: 3000
        };
    }
};
