require('./proof')(3, prove)

function prove (async, assert) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    async(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        riffle.forward(strata, 'b', async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(function (item) { return item.key != 'g' }, async())
            }, function (items) {
                if (items == null) {
                    return [ loop ]
                }
                items.forEach(function (item) {
                    records.push(item.record)
                })
            })()
        }, function () {
            assert(records, [ 'b', 'c', 'd', 'f', 'h', 'i' ], 'inclusive')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'b', false, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(function (item) { return item.key != 'g' }, async())
            }, function (items) {
                if (items == null) {
                    return [ loop ]
                }
                items.forEach(function (item) {
                    records.push(item.record)
                })
            })()
        }, function () {
            assert(records, [ 'c', 'd', 'f', 'h', 'i' ], 'exclusive')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (items) {
                if (items == null) {
                    return [ loop ]
                }
                items.forEach(function (item) {
                    records.push(item.record)
                })
            })()
        }, function () {
            assert(records, [ 'a', 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'left most')
            iterator.unlock(async())
        })
    }, function () {
        strata.close(async())
    })
}
