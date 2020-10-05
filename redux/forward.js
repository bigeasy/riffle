const Strata = require('b-tree')

module.exports = function (strata, right, {
    parition = () => 1, count = 32, inclusive = true
} = {}) {
    let previous = null
    const cursor = {
        next: function (consume, terminator = cursor) {
            if (right == null) {
                terminator.done = true
                return []
            }
            return strata.search(right, cursor => {
                const { index, found } = cursor
                const start = inclusive || ! found ? index : index + 1
                const sliced = cursor.page.items.slice(start, start + slice)
                right = start + sliced.length == cursor.page.items.length
                    ? cursor.page.right
                    : cursor.page.items[start + sliced.length].key
                inclusive = true
            })
        }
    }
    return cursor
}
