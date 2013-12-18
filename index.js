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
