export interface StatutoryConfigDto {
    id: string;
    fiscalYear: string;
    effectiveFrom: string;
    isPlaceholder: boolean;
    generalTaxThreshold: number;
    womenSeniorExtraThreshold: number;
    taxSlabsJson: string;
    rebateIncomePct: number;
    rebateInvestmentPct: number;
    rebateCap: number;
    minimumTaxExisting: number;
    minimumTaxNew: number;
    pfEmployeeRate: number;
    pfEmployerRate: number;
    pfEligibilityMonths: number;
    gratuityDaysPerYear: number;
    gratuityDaysPerYearOver10: number;
    festivalBonusCount: number;
    festivalBonusMonths: number;
    deductionCapPct: number;
    overtimeMultiplier: number;
}

export type SetStatutoryConfigRequest = Omit<StatutoryConfigDto, 'id'>;

export interface EstimateDeductionsRequest {
    monthlyBasic: number;
    monthlyTaxableEarnings: number;
    annualEligibleInvestment?: number;
    existingTaxpayer?: boolean;
    fiscalYear?: string;
}

export interface StatutoryCalcResult {
    annualTaxableIncome: number;
    annualGrossTax: number;
    rebate: number;
    annualNetTax: number;
    monthlyTds: number;
    monthlyPfEmployee: number;
    monthlyPfEmployer: number;
    isPlaceholderConfig: boolean;
}
