var cadence = require('cadence/redux')

function yes () { return true }

function Forward (cursor, inclusive) {
    var index = cursor.index
    index = index < 0 ? ~index : inclusive ? index : index + 1
    this._cursor = cursor
    this._index = index
    this.terminal = false
}

Forward.prototype.next = cadence(function (async, condition) {
    condition = condition || yes
    var filtered = [], loop = async(function () {
        if (this._index != null) {
            var index = this._index
            this._index = null
            return [ true, index ]
        }
        async(function () {
            this._cursor.next(async())
        }, function (more) {
            return [ more, this._cursor.offset ]
        })
    }, function (more, i) {
        if (!more) return [ loop, null ]
        var items = this._cursor._page.items, filtered = []
        for (var I = this._cursor.length; i < I; i++) {
            var item = items[i]
            if (condition(item)) {
                filtered.push(item)
            }
        }
        if (filtered.length === 0) {
            return [ loop() ]
        }
        if (this._cursor._page.right.key == null) {
            this.terminal = true
        }
        return [ loop, filtered ]
    })()
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
    index = index < 0 ? ~index - 1 : inclusive ? index : index - 1
    this._strata = strata
    this._cursor = cursor
    if (!(index === -1 && cursor._page.address === 1)) {
        this._index = index
    }
    this.terminal = false
}

Reverse.prototype.next = cadence(function (async, condition) {
    condition = condition || yes
    if (this._index == null && this._cursor.address == 1) {
        return [ null ]
    }
    var loop = async(function () {
        var address = this._cursor.address
        if (this._index != null) {
            var index = this._index
            this._index = null
            return [ index ]
        }
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
            this._cursor = cursor
            if (this._cursor.right === address) {
                return [ this._cursor.length - 1 ]
            } else {
                var index = this._cursor.index
                index = (index < 0 ? ~index : index) - 1
                return [ index ]
            }
        })
    }, function (i) {
        var cursor = this._cursor, item, filtered = []
        for (var I = this._cursor.ghosts - 1; i != I; i--) {
            if (condition(item = cursor.get(i))) {
                filtered.push(item)
            }
        }
        if (filtered.length == 0) {
            return [ loop() ]
        }
        if (this._cursor._page.address === 1) {
            this.terminal = true
        }
        return [ loop, filtered ]
    })()
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
