namespace PolyPack.Shared.Contracts.Models;

/// <summary>
/// Represents a generic sales order pulled from an ERP.
/// </summary>
public record ErpSalesOrder
{
    public required string OrderId { get; init; }
    public required string Client { get; init; }
    public required string Material { get; init; }
    public string? Thickness { get; init; }
    public string? Size { get; init; }
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = "pcs";
    public string? DueDate { get; init; }
    public string Status { get; init; } = "Pending";
    public string? TallyVoucher { get; init; }
}
