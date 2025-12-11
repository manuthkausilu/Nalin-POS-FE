import type { Sale, SaleDTO, SaleItem, SaleItemDTO } from "../types/Sale";

export const mapSaleItemDTOToSaleItem = (dto: SaleItemDTO): SaleItem => {
    return {
        saleItemId: dto.saleItemId || 0,
        saleId: dto.saleId || 0,
        productId: dto.productId,
        qty: dto.qty,
        price: dto.price,
        discount: dto.discount
    };
};

export const mapSaleDTOToSale = (dto: SaleDTO): Sale => {
    return {
        saleId: dto.saleId || 0,
        date: new Date(dto.saleDate || new Date()),
        saleDate: dto.saleDate || new Date().toISOString(),
        totalAmount: dto.totalAmount,
        totalDiscount: dto.totalDiscount,
        paymentMethod: dto.paymentMethod,
        userId: dto.userId,
        customerId: dto.customerId || 0,
        saleItems: dto.saleItems ? dto.saleItems.map(mapSaleItemDTOToSaleItem) : [],// Add null check here
        originalTotal: dto.originalTotal,
        itemDiscounts: dto.itemDiscounts,
        subtotal: dto.subtotal,
        orderDiscountPercentage: dto.orderDiscountPercentage,
        orderDiscount: dto.orderDiscount,
        paymentAmount: dto.paymentAmount,
        balance: dto.balance
    };
};
