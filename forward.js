module.exports = function (strata, right, { slice = 32, inclusive = true, strict = false } = {}) {
    let previous = null
    return {
        [Symbol.asyncIterator]: function  () {
            return this
        },
        next: async function () {
            if (right == null) {
                return { done: true, value: null }
            }
            let cursor = await strata.search(right)
            if (cursor.page.deleted) {
                cussor.release()
                return { done: false, value: [] }
            }
            const { index, found } = cursor.indexOf(right, cursor.page.ghosts)
            if (index == null) {
                cussor.release()
                return { done: false, value: [] }
            }
            let i = inclusive || ! found ? index : index + 1
            if (previous != null) {
                // TODO Could add upper bound and reduce the binary search.
                const { index: j, found } = cursor.indexOf(previous, 0)
                if (j == null) {
                    const left = await strata.search(previous)
                    if (left.page.deleted || cursor.page.deleted) {
                        cursor.release()
                        left.release()
                        return { done: false, value: [] }
                    }
                    // A whole page could have been inserted between the
                    // previous and next key in a page transition, in which case
                    // we use the left page even though the index might be at
                    // the very end, the slice would produce an empty array.
                    //
                    // The right page could have been deleted in the time it
                    // took use to find the left page, in which case we continue
                    // as with the right key change. It might return a zero
                    // length set too, but that's as good as us redoing the
                    // decent in this function.
                    //
                    // Or we may find new records where added at the end of the
                    // previous page, so use the previous page.
                    //
                    // TODO What about ghosts? Not clear on ghosts.
                    const { index: k, found } = left.indexOf(previous, left.page.ghosts)
                    if (
                        strata.compare(left.right, right) != 0 ||
                        found
                            ? k != left.page.items.length - 1
                            : k != left.page.items.length
                    ) {
                        cursor.release()
                        cursor = left
                        // May create a zero length slice if found at end of
                        // page and a whole page has been inserted. Should be a
                        // fun unit test.
                        i = found ? k + 1 : k
                    }
                } else if (found) {
                    if (j != i - 1) {
                        i = j
                    }
                } else {
                    i = j
                }
            }
            // TODO What does strict Riffle mean for ghosts?
            const start = Math.max(i, cursor.page.ghosts)
            const sliced = cursor.page.items.slice(start, start + slice)
            right = start + sliced.length == cursor.page.items.length
                ? cursor.page.right
                : cursor.page.items[start + sliced.length].key
            // Zero slice if we've rewound because a whole page has been added
            // between strict `next`.
            if (strict && sliced.length != 0) {
                previous = sliced[sliced.length - 1].key
            }
            cursor.release()
            inclusive = true
            return { done: false, value: sliced }
        }
    }
}
