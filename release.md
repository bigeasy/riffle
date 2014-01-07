### Reverse Off By One

When the exact key is not found, the index info a leaf page of a Strata cursor
is the index where they key should be inserted. When we are starting our reverse
iterator, we return the insert index calculated by the Strata cursor, which is
going to point at a record greater than the sought record when the key is not
found. This is incorrect. We want to start with the record for the key if it
exists in the tree, or else the record of the first key that is less than the
key sought.

The logic has been updated so that if the index is an insert index, we subtract
one from it to find the first key less than the sought index.

### Issue by Issue

 * Implement forward on an empty tree. #22.
 * Reverse when key does not exist is off by one. #21.
