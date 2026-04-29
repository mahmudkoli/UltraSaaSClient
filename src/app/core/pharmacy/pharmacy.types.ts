export interface ProductPharmacyDto {
    id: string;
    productId: string;
    genericName?: string;
    activeIngredient?: string;
    strength?: string;
    dosageForm?: string;
    requiresBatch: boolean;
    requiresPrescription: boolean;
    controlledSubstance: boolean;
    manufacturer?: string;
}

export interface BatchDto {
    id: string;
    productId: string;
    outletId: string;
    batchNumber: string;
    expiryDate?: string;
    manufactureDate?: string;
    receivedQuantity: number;
    remainingQuantity: number;
    costPrice: number;
    status: 'Active' | 'Exhausted' | 'Expired' | 'Recalled';
    isAvailable: boolean;
    daysToExpiry: number;
    notes?: string;
}

export interface PrescriptionDto {
    id: string;
    prescriptionNumber: string;
    prescriptionDate: string;
    validUntil?: string;
    doctorName: string;
    doctorLicense?: string;
    doctorPhone?: string;
    hospital?: string;
    patientName: string;
    patientPhone?: string;
    patientAge?: number;
    diagnosis?: string;
    medicationsJson: string;
    status: 'Active' | 'Dispensed' | 'Cancelled' | 'Expired';
    isValid: boolean;
    dispensedSaleId?: string;
    dispensedOn?: string;
    notes?: string;
}
