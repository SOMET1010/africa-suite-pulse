/**
 * Focus utilities for continuous service flow
 */

export function focusQuickAdd() {
  const el = document.getElementById('quick-add-input');
  if (el) {
    (el as HTMLInputElement).focus();
  }
}

export function focusSearchInput() {
  const el = document.querySelector('[data-search-input]');
  if (el) {
    (el as HTMLInputElement).focus();
  }
}