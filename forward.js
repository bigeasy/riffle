const Strata = require('b-tree')

module.exports = function (strata, right, { slice = 32, inclusive = true } = {}) {
    let previous = null
    const iterator = {
        done: false,
        next (trampoline, consume, terminator = iterator) {
            if (right == null) {
                terminator.done = true
                return []
            }
            strata.search(trampoline, right, cursor => {
                const { index, found } = cursor
                const start = inclusive || ! found ? index : index + 1
                const sliced = cursor.page.items.slice(start, start + slice)
                right = start + sliced.length == cursor.page.items.length
                    ? cursor.page.right
                    : cursor.page.items[start + sliced.length].key
                inclusive = true
                consume(sliced)
            })
        }
    }
    return iterator
}
