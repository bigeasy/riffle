require('./proof')(4, prove)

function prove (async, assert) {
    var strata = createStrata({ directory: tmp, leafSize: 3, branchSize: 3 }),
        riffle = require('../..')
    async(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, async())
    }, function () {
        strata.open(async())
    }, function () {
        riffle.forward(strata, 'b', async())
    }, function (iterator) {
        var records = [], lasts = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (more) {
                if (more) {
                    lasts.push(iterator.last)
                    var item
                    while (item = iterator.get()) {
                        records.push(item.record)
                    }
                } else {
                    return [ loop.break ]
                }
            })()
        }, function () {
            assert(lasts, [ false, false, false, true ], 'last')
            assert(records, [ 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'inclusive')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'b', false, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (more) {
                if (more) {
                    var item
                    while (item = iterator.get()) {
                        records.push(item.record)
                    }
                } else {
                    return [ loop.break ]
                }
            })()
        }, function () {
            assert(records, [ 'c', 'd', 'f', 'g', 'h', 'i' ], 'exclusive')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, async())
    }, function (iterator) {
        var records = []
        async(function () {
            var loop = async(function () {
                iterator.next(async())
            }, function (more) {
                if (more) {
                    var item
                    while (item = iterator.get()) {
                        records.push(item.record)
                    }
                } else {
                    return [ loop.break ]
                }
            })()
        }, function () {
            assert(records, [ 'a', 'b', 'c', 'd', 'f', 'g', 'h', 'i' ], 'left most')
            iterator.unlock(async())
        })
    }, function () {
        strata.close(async())
    })
}
