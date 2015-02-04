require('./proof')(6, prove)

function prove (async, assert) {
    var cadence = require('cadence'),
        strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    async(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        riffle.reverse(strata, 'z', async())
    }, function (iterator) {
        var records = [], keys = [], sizes = []
        async(function () {
            var count = 0
            var loop = async(function () {
                if (count % 1) iterator.next(async())
                else iterator.next(function (record) { return count++ > 0 }, async())
            }, function (record, key, size) {
                if (record && key) {
                    records.push(record)
                    keys.push(key)
                    sizes.push(size)
                } else {
                    return [ loop, records ]
                }
            })()
        }, function () {
            iterator.unlock(async())
        }, function () {
            return [ records, keys, sizes ]
        })
    }, function (records, keys, sizes) {
        assert(records, [ 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'keyed records past end')
        assert(keys, [ 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'keyed keys past end')
        assert(sizes, [ 54, 54, 54, 54, 54, 54, 54 ], 'keyed sizes past end')
    }, function () {
        riffle.reverse(strata, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (record) {
                if (record) records.push(record)
                else return [ loop, records ]
            })()
        }, function () {
            iterator.unlock(async())
        }, function () {
            return [ records ]
        })
    }, function (records) {
        assert(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'right most')
    }, function () {
        riffle.reverse(strata, 'e', async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (record) {
                if (record) records.push(record)
                else return [ loop, records ]
            })()
        }, function () {
            iterator.unlock(async())
        }, function () {
            return [ records ]
        })
    }, function (records) {
        assert(records, [ 'd', 'c', 'b', 'a' ], 'keyed missing')
    }, function () {
        riffle._racer = cadence(function (async, key) {
            if (key == 'h') async(function () {
                strata.mutator('h', async())
            }, function (cursor) {
                async(function () {
                    cursor.remove(cursor.index, async())
                }, function () {
                    cursor.unlock(async())
                    strata.balance(async())
                })
            })
        })
        riffle.reverse(strata, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (record) {
                if (record) records.push(record)
                else return [ loop, records ]
            })()
        }, function () {
            iterator.unlock(async())
        }, function () {
            return [ records ]
        })
    }, function (records) {
        assert(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'balanced')
    }, function () {
        strata.close(async())
    })
}
