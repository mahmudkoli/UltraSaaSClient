export type PromotionType = 'PercentageOff' | 'FixedAmountOff' | 'BuyXGetYFree';
export type PromotionScope = 'Cart' | 'Product' | 'Category';

export interface PromotionDto {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: PromotionType;
    scope: PromotionScope;
    value: number;
    buyQty: number;
    getQty: number;
    productId?: string;
    categoryId?: string;
    minPurchaseAmount: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    isCurrentlyValid: boolean;
}

export interface PreviewCartLine {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface PromotionDiscountPreview {
    code: string;
    eligible: boolean;
    rejectionReason?: string;
    cartSubTotal: number;
    discountAmount: number;
    cartTotalAfterDiscount: number;
}

export interface LoyaltyTransactionDto {
    id: string;
    customerId: string;
    type: 'Earned' | 'Redeemed' | 'Adjustment' | 'Expired';
    points: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    occurredOn: string;
}
