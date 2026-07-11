namespace PolyPack.Shared.Contracts.Models;

/// <summary>
/// Represents a generic stock item pulled from an ERP.
/// </summary>
public record ErpStockItem
{
    public required string Material { get; init; }
    public decimal QuantityKg { get; init; }
    public decimal MinLevelKg { get; init; } = 100;
    public string? LastUpdatedBy { get; init; }
}
