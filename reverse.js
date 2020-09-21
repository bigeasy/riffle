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
                const { found, index } = cursor.indexOf(left, cursor.page.ghosts)
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
                    end = found
                }
            } else if (left === Strata.MAX) {
                if (cursor.page.right != null) {
                    cursor.release()
                    return { done: false, value: [] }
                }
                end = cursor.page.items.length
            } else if (left === Strata.MIN) {
                end = cursor.page.item.ghosts
            } else {
                // Strata cannot get MIN wrong, the left-most page is always the
                // left-most page.
                const { found, index } = cursor.indexOf(left, cursor.page.ghosts)
                if (found == null) {
                    cursor.release()
                    return { done: false, value: [] }
                }
                end = found ? index - 1 : index + 1
                end = inclusive || ! found
                    ? Math.min(end + 1, cursor.page.items.length)
                    : end
            }
            const start = Math.max(cursor.page.ghosts, end - slice)
            const sliced = cursor.page.items.slice(start, end)
            left = cursor.page.id == '0.1' && start == cursor.page.ghosts
                ? null
                : cursor.page.items[start == cursor.page.ghosts ? 0 : start].key
            cursor.release()
            fork = true
            // TODO Homogenize expects the array to be reversed, but I'd rather
            // it went backwards with its index.
            return { done: false, value: sliced.reverse() }
        }
    }
}
