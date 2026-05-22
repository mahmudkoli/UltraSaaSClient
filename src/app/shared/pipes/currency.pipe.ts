import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/currency/currency.service';

/**
 * Phase v1-O — formats a number with the active tenant's currency symbol.
 * Usage in templates:
 *   {{ row.amount | tenantCurrency }}            → "৳ 1,234.50" (BDT tenant)
 *                                                 → "$ 1,234.50" (USD tenant)
 *   {{ row.amount | tenantCurrency:'USD' }}      → render in a specific currency
 *   {{ row.amount | tenantCurrency:undefined:0 } → no decimal places
 *
 * The pipe is impure because the descriptor loads asynchronously after login;
 * the perf hit is negligible (numbers rarely change in a tight loop) but the
 * correctness win — the first render after login shows the right symbol —
 * matters.
 */
@Pipe({ name: 'tenantCurrency', standalone: true, pure: false })
export class TenantCurrencyPipe implements PipeTransform {
    private _svc = inject(CurrencyService);

    transform(value: number | null | undefined, code?: string, fractionDigits = 2): string {
        if (value == null) return '';
        return code
            ? this._svc.formatIn(code, value, { fractionDigits })
            : this._svc.format(value, { fractionDigits });
    }
}
