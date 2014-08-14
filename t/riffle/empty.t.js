require('./proof')(4, function (step, ok, Strata, tmp) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 })
    var riffle = require('../..')
    step(function () {
        strata.create(step())
    }, function () {
        riffle.forward(strata, 'a', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'forward keyed empty')
            iterator.unlock(step())
        })
    }, function () {
        riffle.forward(strata, step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'forward left most empty')
            iterator.unlock(step())
        })
    }, function () {
        riffle.reverse(strata, 'a', step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'reverse keyed empty')
            iterator.unlock(step())
        })
    }, function () {
        riffle.reverse(strata, step())
    }, function (iterator) {
        step(function () {
            iterator.next(step())
        }, function (record) {
            ok(record == null, 'reverse left most empty')
            iterator.unlock(step())
        })
    }, function () {
        strata.close(step())
    })
})
