module.exports = function (strata, right, slice = 32, inclusive = true) {
    return {
        [Symbol.asyncIterator]: function  () {
            return this
        },
        next: async function () {
            if (right == null) {
                return { done: true, value: null }
            }
            const cursor = (await strata.search(right)).get()
            const index = inclusive || ! cursor.found
                ? cursor.index
                : cursor.index + 1
            const start = Math.max(index, cursor.page.ghosts)
            const sliced = cursor.page.items.slice(start, start + slice)
            right = start + sliced.length == cursor.page.items.length
                ? cursor.page.right
                : cursor.page.items[start + sliced.length].key
            cursor.release()
            inclusive = true
            return { done: false, value: sliced }
        }
    }
}
