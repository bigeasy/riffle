### Return underlying record size.

Strata now exposes the underlying record size for the sake of Locket which need
it to implement `approximateSize`, an approximate storage size of a range
records.

### Issue by Issue

 * Test keys returned by iterator. #28.
