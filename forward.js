const Strata = require('b-tree')

module.exports = function (strata, right, {
        slice = 32, inclusive = true, resumable = false
} = {}) {
    let previous = null
    return {
        [Symbol.asyncIterator]: function  () {
            return this
        },
        resumable: resumable,
        resume: function (resume) {
            right = resume
            inclusive = false
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
                        index: cursor.page.ghosts,
                        found: cursor.page.ghosts < cursor.page.items.length
                    }
                case Strata.MAX:
                    return {
                        index: Math.max(cursor.page.ghosts.length - 1, cursor.page.items.ghosts),
                        found: cursor.page.ghosts < cursor.page.items.length
                    }
                default:
                    return cursor.indexOf(right, cursor.page.ghosts)
                }
            } ()
            if (index == null) {
                cussor.release()
                return { done: false, value: [] }
            }
            let i = inclusive || ! found ? index : index + 1
            const start = Math.max(i, cursor.page.ghosts)
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
