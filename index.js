var cadence = require('cadence')

function yes () { return true }

function Forward (cursor) {
    this._cursor = cursor
}

Forward.prototype.next = cadence(function (step, condition) {
    condition = condition || yes
    step(null)
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
