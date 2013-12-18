var cadence = require('cadence')

function yes () { return true }

function Forward (cursor) {
    this._cursor = cursor
    this._index = cursor.index
}

Forward.prototype.next = cadence(function (step, condition) {
    condition = condition || yes
    var next = step(function (more) {
        if (this._index < this._cursor.length) return true
        else step(function () {
            this._cursor.next(step())
            this._index = 0
        })
    }, function (more) {
        if (!more) {
            this.terminated = true
            step(null)
        } else {
            this._cursor.get(this._index++, step())
        }
    }, function (record) {
        if (condition(record)) {
            step(null, record)
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
