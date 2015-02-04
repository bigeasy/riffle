var cadence = require('cadence/redux')

function yes () { return true }

function Forward (cursor) {
    this._cursor = cursor
    this._index = cursor.offset
}

Forward.prototype.next = cadence(function (async, condition) {
    condition = condition || yes
    var loop = async(function () {
        if (this._index < this._cursor.length) return true
        else async(function () {
            this._cursor.next(async())
        }, function (more) {
            this._index = this._cursor.offset
            return more
        })
    }, function (more) {
        if (!more) return [ loop ]
        var item = this._cursor.get(this._index++)
        if (condition(item.key, item.record)) {
            return [ loop, item.record, item.key, item.heft ]
        }
    })()
})

Forward.prototype.unlock = function (callback) {
    this._cursor.unlock(callback)
}

exports.forward = cadence(function (async, strata, key) {
    var condition = key == null ? strata.left : strata.key(key)
    async(function () {
        strata.iterator(condition, async())
    }, function (cursor) {
        return new Forward(cursor)
    })
})

function Reverse (strata, cursor) {
    this._strata = strata
    this._cursor = cursor
    this._index = cursor.index < 0 ? ~cursor.index - 1 : cursor.index
}

Reverse.prototype.next = cadence(function (async, condition) {
    condition = condition || yes
    var loop = async(function () {
        if (this._index == this._cursor.ghosts - 1) {
            if (this._cursor.address == 1) return [ loop ]
            else async(function () {
                var address = this._cursor.address
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
                    if (this._cursor.right == address) {
                        this._index = this._cursor.length - 1
                    } else {
                        this._index = this._cursor.offset - 1
                    }
                })
            })
        }
    }, function () {
        var item = this._cursor.get(this._index--)
        if (condition(item.key, item.record)) {
            return [ loop, item.record, item.key, item.heft ]
        }
    })()
})

Reverse.prototype.unlock = function (callback) {
    this._cursor.unlock(callback)
}

exports.reverse = cadence(function (async, strata, key) {
    var condition = key == null ? strata.right : strata.key(key)
    async(function () {
        strata.iterator(condition, async())
    }, function (cursor) {
        return new Reverse(strata, cursor)
    })
})

exports._racer = function (key, callback) { callback() }
