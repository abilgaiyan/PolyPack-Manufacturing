namespace PolyPack.Shared.Contracts.Models;

/// <summary>
/// Represents a generic purchase order pulled from an ERP.
/// </summary>
public record ErpPurchaseOrder
{
    public required string PurchaseOrderId { get; init; }
    public required string Supplier { get; init; }
    public required string Material { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "kg";
    public string? ExpectedDate { get; init; }
}
