require('./proof')(10, function (async, assert) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 })
    var riffle = require('../..')
    async(function () {
        strata.create(async())
    }, function () {
        strata.mutator('m', async())
    }, function (mutator) {
        async(function () {
            mutator.insert('m', 'm', ~mutator.index, async())
        }, function () {
            mutator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'm', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, 'm', 'forward keyed single equal')
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'forward keyed single equal done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'a', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, 'm', 'forward keyed single less than')
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'forward keyed single less than done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'z', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'forward keyed single greater than done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'm', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, 'm', 'reverse keyed single equal')
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'reverse keyed single equal done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'z', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, 'm', 'reverse keyed single greater than')
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'reverse keyed single greater than done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'a', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record == null, 'reverse keyed single less than done')
            iterator.unlock(async())
        })
    }, function () {
        strata.close(async())
    })
})
