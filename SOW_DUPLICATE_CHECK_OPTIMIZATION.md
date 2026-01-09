# Statement of Work: Duplicate Check Optimization

## Issues Identified

### Issue 1: Performance/Timeout Problem
**Problem:** When searching for UPC on accounts with 10K+ products, duplicate check times out or takes too long because:
- Makes 10,000+ sequential API calls (one per inventory item)
- No timeout mechanism, causing requests to hang indefinitely
- Checks all pages even after finding duplicates

**Impact:** Client cannot get duplicate error notifications for large inventories.

### Issue 2: Stale Duplicate Detection
**Problem:** When a product is removed from eBay, the duplicate check still shows it as a duplicate because:
- Inventory list may return deleted items (stale data)
- Code doesn't verify if item actually exists before marking as duplicate
- No validation that item has active/published offers

**Impact:** False positive duplicate errors for products that no longer exist.

---

## Proposed Solutions

### Solution 1: Performance Optimization
1. **Check list data first** - Use UPC from inventory list response before making individual API calls
2. **Add timeout mechanism** - 12-second timeout with graceful handling
3. **Limit pages checked** - Check first 20 pages (500 items) instead of all pages
4. **Parallel processing** - Process 5 items concurrently instead of sequentially
5. **Early exit** - Stop after finding first duplicate or 10 duplicates

### Solution 2: Verify Item Existence
1. **Validate item exists** - Check if individual item fetch returns 404 (item deleted)
2. **Check for published offers** - Verify item has active/published offers before marking as duplicate
3. **Handle deleted items** - Skip items that no longer exist in inventory

---

## Implementation Tasks

| Task | Description | Hours |
|------|-------------|-------|
| 1. Optimize duplicate check logic | Implement list data check first, parallel processing, timeout, page limits | 3 |
| 2. Add item existence validation | Verify item exists and has published offers before marking as duplicate | 2 |
| 3. Error handling & edge cases | Handle timeouts, deleted items, API errors gracefully | 1 |
| 4. Testing | Test with small inventory (50 items), large inventory (10K+), deleted items | 2 |
| 5. Code review & documentation | Review implementation, add comments, update if needed | 1 |

**Total Estimated Hours: 9 hours**

---

## Acceptance Criteria

- [ ] Duplicate check completes within 12 seconds for 10K+ product inventories
- [ ] Duplicate check correctly identifies duplicates without false positives
- [ ] Deleted/removed products are not shown as duplicates
- [ ] Timeout handling works gracefully with user feedback
- [ ] No performance degradation for small inventories (< 100 items)

---

## Notes

- Timeout can be adjusted based on testing results
- Page limit (20 pages) can be increased if needed
- Parallel processing batch size (5 items) can be tuned based on API rate limits

