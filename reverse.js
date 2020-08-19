module.exports = function (strata, left, slice = 32, inclusive = true) {
    let fork = false
    return {
        [Symbol.asyncIterator]: function () {
            return this
        },
        next: async function () {
            if (left == null) {
                return { done: true, value: null }
            }
            const cursor = (await strata.search(left, fork)).get()
            const end = inclusive || ! cursor.found
                ? Math.min(cursor.index + 1, cursor.page.items.length)
                : cursor.index
            const start = Math.max(cursor.page.ghosts, end - slice)
            const sliced = cursor.page.items.slice(start, end)
            left = cursor.page.id == '0.1' && start == cursor.page.ghosts
                ? null
                : cursor.page.items[start == cursor.page.ghosts ? 0 : start].key
            cursor.release()
            fork = true
            inclusive = true
            return { done: false, value: sliced }
        }
    }
}
