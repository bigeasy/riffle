require('./proof')(10, function (step, assert) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 })
    var riffle = require('../..')
    step(function () {
        strata.create(step())
    }, function () {
        strata.mutator('m', step())
    }, function (mutator) {
        step(function () {
            mutator.insert('m', 'm', ~mutator.index, step())
        }, function () {
            mutator.unlock(step())
        })
    }, function () {
        riffle.forward(strata, 'm', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record, 'm', 'forward keyed single equal')
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'forward keyed single equal done')
            iterator.unlock(step())
        })
    }, function () {
        riffle.forward(strata, 'a', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record, 'm', 'forward keyed single less than')
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'forward keyed single less than done')
            iterator.unlock(step())
        })
    }, function () {
        riffle.forward(strata, 'z', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'forward keyed single greater than done')
            iterator.unlock(step())
        })
    }, function () {
        riffle.reverse(strata, 'm', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record, 'm', 'reverse keyed single equal')
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'reverse keyed single equal done')
            iterator.unlock(step())
        })
    }, function () {
        riffle.reverse(strata, 'z', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record, 'm', 'reverse keyed single greater than')
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'reverse keyed single greater than done')
            iterator.unlock(step())
        })
    }, function () {
        riffle.reverse(strata, 'a', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            assert(record == null, 'reverse keyed single less than done')
            iterator.unlock(step())
        })
    }, function () {
        strata.close(step())
    })
})
