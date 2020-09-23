const Strata = require('b-tree')

module.exports = function (strata, left, {
    slice = 32, inclusive = true
} = {}) {
    let fork = false
    return {
        [Symbol.asyncIterator]: function () {
            return this
        },
        next: async function () {
            if (left == null) {
                return { done: true, value: null }
            }
            const cursor = await strata.search(left, fork)
            if (cursor.page.deleted) {
                return []
            }
            let end = 0
            if (fork) {
                const { found, index } = cursor.indexOf(left)
                if (index == null) {
                    if (
                        cursor.page.right == null ||
                        strata.compare(cursor.page.right, left) != 0
                    ) {
                        cursor.release()
                        return { done: false, value: [] }
                    }
                    end = cursor.page.items.length
                } else {
                    end = index
                }
            } else if (left === Strata.MAX) {
                if (cursor.page.right != null) {
                    cursor.release()
                    return { done: false, value: [] }
                }
                end = cursor.page.items.length
            } else if (left === Strata.MIN) {
                end = 0
            } else {
                // Strata cannot get MIN wrong, the left-most page is always the
                // left-most page.
                const { found, index } = cursor.indexOf(left)
                if (found == null) {
                    cursor.release()
                    return { done: false, value: [] }
                }
                end = inclusive && found ? index + 1 : index
            }
            const start = Math.max(end - slice, 0)
            const sliced = cursor.page.items.slice(start, end)
            left = start == 0
                ? cursor.page.id == '0.1'
                    ? null
                    : cursor.page.key
                : cursor.page.items[start].key
            cursor.release()
            fork = true
            // TODO Homogenize expects the array to be reversed, but I'd rather
            // it went backwards with its index.
            return { done: false, value: sliced.reverse() }
        }
    }
}
