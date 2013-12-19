var cadence = require('cadence')

function yes () { return true }

function Forward (cursor) {
    this._cursor = cursor
    this._index = cursor.offset
}

Forward.prototype.next = cadence(function (step, condition) {
    condition = condition || yes
    step(function () {
        if (this._index < this._cursor.length) return true
        else step(function () {
            this._cursor.next(step())
        }, function (more) {
            this._index = this._cursor.offset
            return more
        })
    }, function (more) {
        if (!more) {
            this.terminated = true
            step(null)
        } else {
            this._cursor.get(this._index++, step())
        }
    }, function (record, key) {
        if (condition(key)) {
            step(null, record, key)
        }
    })()
})

Forward.prototype.unlock = function () {
    this._cursor.unlock()
}

exports.forward = cadence(function (step, strata, key) {
    var condition = key == null ? strata.left : strata.key(key)
    step(function () {
        strata.iterator(condition, step())
    }, function (cursor) {
        return new Forward(cursor)
    })
})

function Reverse (strata, cursor) {
    this._strata = strata
    this._cursor = cursor
    this._index = Math.min(cursor.offset, cursor.length - 1)
}

Reverse.prototype.next = cadence(function (step, condition) {
    condition = condition || yes
    step(function () {
        if (this._index == this._cursor.ghosts - 1) {
            if (this._cursor.address == 1) step(null)
            else step(function () {
                var address = this._cursor.address
                step(function () {
                    this._cursor.get(0, step())
                }, function (key) {
                    this._cursor.unlock()
                    this._strata.iterator(this._strata.leftOf(key), step())
                }, function (cursor) {
                    this._cursor = cursor
                    if (this._cursor.right == address) {
                        this._index = this._cursor.length - 1
                    } else {
                        throw new Error
                    }
                })
            })
        }
    }, function () {
        this._cursor.get(this._index--, step())
    }, function (record, key) {
        if (condition(key, record)) {
            step(null, record, key)
        }
    })()
})

Reverse.prototype.unlock = function () {
    this._cursor.unlock()
}

exports.reverse = cadence(function (step, strata, key) {
    var condition = key == null ? strata.right : strata.key(key)
    step(function () {
        strata.iterator(condition, step())
    }, function (cursor) {
        return new Reverse(strata, cursor)
    })
})
