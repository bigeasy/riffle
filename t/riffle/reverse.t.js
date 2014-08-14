require('./proof')(6, function (step, serialize, deepEqual, Strata, tmp) {
    var cadence = require('cadence'),
        strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    step(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        riffle.reverse(strata, 'z', step())
    }, function (iterator) {
        var records = [], keys = [], sizes = []
        step(function () {
            var count = 0
            step(function () {
                if (count % 1) iterator.next(step())
                else iterator.next(function (record) { return count++ > 0 }, step())
            }, function (record, key, size) {
                if (record && key) {
                    records.push(record)
                    keys.push(key)
                    sizes.push(size)
                } else {
                    step(null, records)
                }
            })()
        }, function () {
            iterator.unlock(step())
        }, function () {
            return [ records, keys, sizes ]
        })
    }, function (records, keys, sizes) {
        deepEqual(records, [ 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'keyed records past end')
        deepEqual(keys, [ 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'keyed keys past end')
        deepEqual(sizes, [ 54, 54, 54, 54, 54, 54, 54 ], 'keyed sizes past end')
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
            iterator.unlock(step())
        }, function () {
            return [ records ]
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
            iterator.unlock(step())
        }, function () {
            return [ records ]
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
                    cursor.unlock(step())
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
            iterator.unlock(step())
        }, function () {
            return [ records ]
        })
    }, function (records) {
        deepEqual(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'balanced')
    }, function () {
        strata.close(step())
    })
})
