require('./proof')(4, function (step, serialize, deepEqual, Strata, tmp) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    step(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        riffle.forward(strata, 'a', step())
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
            iterator.unlock()
        }, function () {
            return [ records, keys, sizes ]
        })
    }, function (records, keys, sizes) {
        deepEqual(records, [ 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'keyed records')
        deepEqual(keys, [ 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'keyed keys')
        deepEqual(sizes, [ 54, 54, 54, 54, 54, 54, 54 ], 'keyed sizes')
    }, function () {
        riffle.forward(strata, step())
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
            return [ records ]
        })
    }, function (records) {
        deepEqual(records, [ 'a', 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'left most')
    }, function () {
        strata.close(step())
    })
})
