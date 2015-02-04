require('./proof')(4, prove)

function prove (async, assert) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    async(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        riffle.forward(strata, 'a', async())
    }, function (iterator) {
        var records = [], keys = [], sizes = []
        async(function () {
            var count = 0
            var loop = async(function () {
                if (count % 1) iterator.next(async())
                else iterator.next(function (record) { return count++ > 0 },
                async())
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
        assert(records, [ 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'keyed records')
        assert(keys, [ 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'keyed keys')
        assert(sizes, [ 54, 54, 54, 54, 54, 54, 54 ], 'keyed sizes')
    }, function () {
        riffle.forward(strata, async())
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
        assert(records, [ 'a', 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'left most')
    }, function () {
        strata.close(async())
    })
}
