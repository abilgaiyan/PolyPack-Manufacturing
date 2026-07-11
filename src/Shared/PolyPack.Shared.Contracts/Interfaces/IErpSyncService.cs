using PolyPack.Shared.Contracts.Models;

namespace PolyPack.Shared.Contracts.Interfaces;

/// <summary>
/// Generic interface for ERP synchronization (Tally, QuickBooks, Salesforce, etc.).
/// </summary>
public interface IErpSyncService
{
    /// <summary>
    /// Gets the name of the ERP integration provider (e.g., "Tally", "QuickBooks", "Salesforce").
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Pulls pending sales orders from the ERP.
    /// </summary>
    Task<IEnumerable<ErpSalesOrder>> PullSalesOrdersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Pulls current raw material stock levels from the ERP.
    /// </summary>
    Task<IEnumerable<ErpStockItem>> PullStockItemsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Pulls pending purchase orders from the ERP.
    /// </summary>
    Task<IEnumerable<ErpPurchaseOrder>> PullPurchaseOrdersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Pulls customer outstanding and overdue balances from the ERP.
    /// </summary>
    Task<IEnumerable<ErpPartyOutstanding>> PullPartyOutstandingsAsync(CancellationToken cancellationToken = default);
}
