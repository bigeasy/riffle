require('./proof')(5, function (step, equal, ok, Strata, tmp) {
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
            mutator.unlock()
        })
    }, function () {
        riffle.forward(strata, 'm', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            equal(record, 'm', 'forward keyed single equal')
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'forward keyed single equal done')
            iterator.unlock()
        })
    }, function () {
        riffle.forward(strata, 'a', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            equal(record, 'm', 'forward keyed single less than')
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'forward keyed single less than done')
            iterator.unlock()
        })
    }, function () {
        riffle.forward(strata, 'z', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'forward keyed single greater than done')
            iterator.unlock()
        })
    }, function () {
        strata.close(step())
    })
})
