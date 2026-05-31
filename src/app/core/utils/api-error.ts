/**
 * Extracts a human-readable message from an HttpErrorResponse, handling both
 * backend error shapes:
 *   - business errors  → ErrorResult            { exception, messages[], statusCode }
 *   - MVC validation    → ValidationProblemDetails { title, errors{ field: [...] } }
 * Falls back to the JS error message, then the supplied fallback.
 */
export function extractApiError(err: any, fallback: string): string {
    const e = err?.error;

    if (typeof e === 'string' && e.trim()) {
        return e;
    }

    if (e && typeof e === 'object') {
        if (typeof e.exception === 'string' && e.exception.trim()) {
            return e.exception;
        }
        if (Array.isArray(e.messages) && e.messages.length) {
            return e.messages.filter(Boolean).join(' ');
        }
        if (e.errors && typeof e.errors === 'object') {
            const msgs = ([] as string[]).concat(
                ...Object.values(e.errors as Record<string, string[]>),
            );
            if (msgs.length) {
                return msgs.filter(Boolean).join(' ');
            }
        }
        if (typeof e.title === 'string' && e.title.trim()) {
            return e.title;
        }
    }

    if (typeof err?.message === 'string' && err.message.trim()) {
        return err.message;
    }

    return fallback;
}
