class Forward {
    constructor (strata, key, slice = 32, inclusive = true) {
        this._strata = strata
        this._right = key
        this._slice = slice
        this._inclusive = inclusive
    }

    [Symbol.asyncIterator] () {
        return this
    }

    async next () {
        if (this._right == null) {
            return { done: true, value: null }
        }
        const cursor = (await this._strata.search(this._right)).get()
        const index = this._inclusive || ! cursor.found
            ? cursor.index
            : cursor.index + 1
        const start = Math.max(index, cursor.page.ghosts)
        const slice = cursor.page.items.slice(start, start + this._slice)
        this._right = start + slice.length == cursor.page.items.length
            ? cursor.page.right
            : cursor.page.items[start + slice.length].key
        cursor.release()
        this._inclusive = true
        return { done: false, value: slice }
    }
}

exports.Forward = Forward

class Reverse {
    constructor (strata, key, slice = 32, inclusive = true) {
        this._strata = strata
        this._left = key
        this._slice = slice
        this._inclusive = inclusive
        this._fork = false
    }

    [Symbol.asyncIterator] () {
        return this
    }

    async next () {
        if (this._left == null) {
            return { done: true, value: null }
        }
        const cursor = (await this._strata.search(this._left, this._fork)).get()
        const end = this._inclusive || ! cursor.found
            ? Math.min(cursor.index + 1, cursor.page.items.length)
            : cursor.index
        const start = Math.max(cursor.page.ghosts, end - this._slice)
        const slice = cursor.page.items.slice(start, end)
        this._left = cursor.page.id == '0.1' && start == cursor.page.ghosts
            ? null
            : cursor.page.items[start == cursor.page.ghosts ? 0 : start].key
        cursor.release()
        this._fork = true
        this._inclusive = true
        return { done: false, value: slice }
    }
}

exports.Reverse = Reverse
