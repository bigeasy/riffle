var cadence = require('cadence/redux')

function Forward (cursor, inclusive) {
    this._cursor = cursor
    this.last = !! this._cursor._page.right
    this._inclusive = inclusive
    this._index = null
}

Forward.prototype.get = function () {
    return this._items[this._index++]
}

Forward.prototype.next = cadence(function (async) {
    if (this._index === null) {
        var index = this._cursor.index
        this._index = index < 0 ? ~index : this._inclusive ? index : index + 1
        this._items = this._cursor._page.items
        return [ this._index < this._items.length ]
    }
    async(function () {
        this._cursor.next(async())
    }, function (more) {
        if (!more) {
            return [ false ]
        }
        this.last = this._cursor._page.right.address === null
        this._items = this._cursor._page.items
        this._index = this._cursor._page.ghosts
        return [ true ]
    })
})

Forward.prototype.unlock = function (callback) {
    this._cursor.unlock(callback)
}

exports.forward = cadence(function (async, strata, key, inclusive) {
    var condition = key == null ? strata.left : strata.key(key)
    inclusive = inclusive == null ? true : inclusive
    async(function () {
        strata.iterator(condition, async())
    }, function (cursor) {
        return new Forward(cursor, inclusive)
    })
})

function Reverse (strata, cursor, inclusive) {
    var index = cursor.index
    this._strata = strata
    this._cursor = cursor
    this._index = null
    this._inclusive = inclusive
    this.last = false
}

Reverse.prototype.get = function () {
    return this._items[this._index--]
}

Reverse.prototype.next = cadence(function (async) {
    if (this._index !== null && this._cursor.address == 1) {
        return [ false ]
    }
    if (this._index === null) {
        var index = this._cursor.index
        index = index < 0 ? ~index - 1 : this._inclusive ? index : index - 1
        if (index < this._cursor._page.ghosts && this._cursor._page.address === 1) {
            this._index = -1
            return [ false ]
        }
        this._items = this._cursor._page.items
        this._index = index
        return [ true ]
    }
    var address = this._cursor._page.address
    async(function () {
        var key = this._cursor.get(0).key
        async(function () {
            this._cursor.unlock(async())
        }, function () {
            exports._racer(key, async())
        }, function () {
            this._strata.iterator(this._strata.leftOf(key), async())
        })
    }, function (cursor) {
        this.last = cursor._page.address === 1
        this._cursor = cursor
        this._items = cursor._page.items
        if (this._cursor.right === address) {
            this._index = this._cursor.length - 1
        } else {
            var index = this._cursor.index
            this._index = (index < 0 ? ~index : index) - 1
        }
        return [ true ]
    })
})

Reverse.prototype.unlock = function (callback) {
    this._cursor.unlock(callback)
}

exports.reverse = cadence(function (async, strata, key, inclusive) {
    inclusive = inclusive == null ? true : inclusive
    var condition = key == null ? strata.right : strata.key(key)
    async(function () {
        strata.iterator(condition, async())
    }, function (cursor) {
        return new Reverse(strata, cursor, inclusive)
    })
})

exports._racer = function (key, callback) { callback() }
