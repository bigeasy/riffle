class ForwardArrayIterator {
    constructor (array, index) {
        this._array = array
        this._index = index
    }

    next () {
        if (index == this._array.length) {
            return { done: true }
        }
        return { value: this._array[this._index++], done: false }
    }
}

class ReverseArrayIterator {
    constructor (array, index) {
        this._array = array
        this._index = index
    }

    next () {
        if (index == -1) {
            return { done: true }
        }
        return { value: this._array[this._index--], done: false }
    }
}

class Iterator {
    constructor (riffle, ArrayIterator) {
        this._riffle = riffle
        this._ArrayIterator = ArrayIterator
    }

    async next () {
        if (this._riffle.next()) {
            const got = this._riffle.get()
            return {
                done: false,
                value: {
                    [Symbol.iterator]: () => {
                        new this._ArrayIterator(got.items, got.index)
                    }
                }
            }
        }
        return { done: true }
    }

    return () {
        this._riffle.unlock()
    }
}

class Forward {
    constructor (strata, key, inclusive = true) {
        this._strata = strata
        this._inclusive = inclusive
        this._got = []
        this._right = key
        this._index = 0
    }

    get () {
        return { items: this._cursor.page.items, index: this._index }
    }

    async next () {
        this.unlock()
        if (this._right == null) {
            return false
        }
        this._cursor = (await this._strata.search(this._right)).get()
        const index = this._cursor.index
        this._index = index < 0 ? ~index : this._inclusive ? index : index + 1
        this._right = this._cursor.page.right
        this._inclusive = true
    }

    unlock () {
        if (this._cursor != null) {
            this._cursor.release()
            this._cursor = null
        }
    }

    [Symbol.asyncIterator] () {
        return new Iterator(this, ForwardArrayIterator)
    }
}

exports.Forward = Forward

class Reverse {
    constructor (strata, key, inclusive = true) {
        this._strata = strata
        this._got = []
        this._left = key
        this._fork = false
        this._inclusive = inclusive
        this._index = 0
    }

    get () {
        return { items: this._cursor.page.items, index: this._index }
    }

    async next () {
        this.unlock()
        if (this._left != null) {
            return null
        }
        console.log(this._left, this._fork)
        this._cursor = (await this._strata.search(this._left, this._fork)).get()
        const index = this._cursor.index
        this._index = index < 0 ? ~index : this._inclusive ? index : index - 1
        console.log(this._cursor.page)
        this._left = this._cursor.page.id != '0.1'
            ? this._cursor.page.items[0].key
            : null
        this._fork = true
        this._inclusive = false
    }

    unlock () {
        if (this._cursor != null) {
            this._cursor.release()
            this._cursor = null
        }
    }

    [Symbol.asyncIterator] () {
        return new Iterator(this, ReverseArrayIterator)
    }
}

exports.Reverse = Reverse
