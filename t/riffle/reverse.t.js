require('./proof')(4, function (step, serialize, deepEqual, Strata, tmp, cadence) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    step(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        riffle.reverse(strata, 'z', step())
    }, function (iterator) {
        var records = []
        step(function () {
            var count = 0
            step(function () {
                if (count % 1) iterator.next(step())
                else iterator.next(function (record) { return count++ > 0 }, step())
            }, function (record) {
                if (record) records.push(record)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'keyed past end')
    }, function () {
        riffle.reverse(strata, step())
    }, function (iterator) {
        var records = []
        step(function () {
            step(function () {
                iterator.next(step())
            }, function (record) {
                if (record) records.push(record)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'right most')
    }, function () {
        riffle.reverse(strata, 'e', step())
    }, function (iterator) {
        var records = []
        step(function () {
            step(function () {
                iterator.next(step())
            }, function (record) {
                if (record) records.push(record)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'd', 'c', 'b', 'a' ], 'keyed missing')
    }, function () {
        riffle._racer = cadence(function (step, key) {
            if (key == 'h') step(function () {
                strata.mutator('h', step())
            }, function (cursor) {
                step(function () {
                    cursor.remove(cursor.index, step())
                }, function () {
                    cursor.unlock()
                    strata.balance(step())
                })
            })
        })
        riffle.reverse(strata, step())
    }, function (iterator) {
        var records = []
        step(function () {
            step(function () {
                iterator.next(step())
            }, function (record) {
                if (record) records.push(record)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'balanced')
    }, function () {
        strata.close(step())
    })
})