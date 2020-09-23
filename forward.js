const Strata = require('b-tree')

module.exports = function (strata, right, {
        slice = 32, inclusive = true
} = {}) {
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
            const { index, found } = function () {
                switch (right) {
                case Strata.MIN:
                    return {
                        index: 0,
                        found: cursor.page.items.length != 0
                    }
                case Strata.MAX:
                    return {
                        index: Math.max(cursor.page.items.length - 1, 0),
                        found: cursor.page.items.length != 0
                    }
                default:
                    return cursor.indexOf(right)
                }
            } ()
            if (index == null) {
                cussor.release()
                return { done: false, value: [] }
            }
            const start = inclusive || ! found ? index : index + 1
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
