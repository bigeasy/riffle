const mvcc = require('mvcc')
const Strata = require('b-tree')

module.exports = function (strata, key, {
    slice = 32, inclusive = true, reverse = false
} = {}) {
    if (reverse) {
        let left = key
        const iterator = {
            done: false,
            type: mvcc.REVERSE,
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
                        consume(sliced.reverse())
                    })
                }
            }
        }
        return iterator
    } else {
        let right = key
        const iterator = {
            done: false,
            type: mvcc.FOWARD,
            next (trampoline, consume, terminator = iterator) {
                if (right == null) {
                    terminator.done = true
                    return
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
}
