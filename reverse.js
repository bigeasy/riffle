const Strata = require('b-tree')

module.exports = function (strata, left, { slice = 32, inclusive = true } = {}) {
    const iterator = {
        done: false,
        next (trampoline, consume, terminator = iterator) {
            if (left == null) {
                terminator.done = true
            } else {
                strata.search(trampoline, left, ! inclusive, cursor => {
                    const { index, found } = cursor
                    const end = left === Strata.MAX
                        ? cursor.page.items.length
                        : left === Strata.MIN
                            ? 0
                            : index + 1
                    const start = Math.max(end - slice, 0)
                    const sliced = cursor.page.items.slice(start, end)
                    left = start == 0
                        ? cursor.page.id == '0.1'
                            ? null
                            : cursor.page.key
                        : cursor.page.items[start].key
                    inclusive = false
                    if (sliced.length == 0) {
                        trampoline.push(() => iterator.next(trampoline, consume, terminator))
                    } else {
                        consume(sliced.reverse())
                    }
                })
            }
        }
    }
    return iterator
}
