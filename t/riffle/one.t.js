require('./proof')(10, prove)

function prove (async, assert) {
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
        }, function (items) {
            assert(items, [{ key: 'm', record: 'm', heft: 54 }], 'forward keyed single equal')
            iterator.next(async())
        }, function (items) {
            assert(items == null, 'forward keyed single equal done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'a', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (items) {
            assert(items, [{ key: 'm', record: 'm', heft: 54 }], 'forward keyed single less than')
            iterator.next(async())
        }, function (items) {
            assert(items == null, 'forward keyed single less than done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, 'z', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (items) {
            assert(items == null, 'forward keyed single greater than done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'm', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, [{ key: 'm', record: 'm', heft: 54 }], 'reverse keyed single equal')
            iterator.next(async())
        }, function (items) {
            assert(items == null, 'reverse keyed single equal done')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'z', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (record) {
            assert(record, [{ key: 'm', record: 'm', heft: 54 }], 'reverse keyed single greater than')
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
}
