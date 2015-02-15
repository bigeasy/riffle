require('./proof')(4, prove)

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
            assert(records, [ 'i', 'h', 'f', 'd', 'c', 'b', 'a' ], 'keyed records past end')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, async())
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
            assert(records, [ 'i', 'h', 'g', 'f', 'd', 'c', 'b', 'a' ], 'right most')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'e', async())
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
            assert(records, [ 'd', 'c', 'b', 'a' ], 'keyed missing')
            iterator.unlock(async())
        })
    }, function (records) {
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
            }, function (items) {
                if (items == null) {
                    return [ loop ]
                }
                items.forEach(function (item) {
                    records.push(item.record)
                })
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
