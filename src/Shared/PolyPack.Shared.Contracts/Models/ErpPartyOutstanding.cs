namespace PolyPack.Shared.Contracts.Models;

/// <summary>
/// Represents generic party ledger outstanding balances pulled from an ERP.
/// </summary>
public record ErpPartyOutstanding
{
    public required string PartyName { get; init; }
    public decimal OutstandingAmount { get; init; }
    public decimal OverdueAmount { get; init; }
}
