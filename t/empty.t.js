require('./proof')(4, prove)

function prove (async, assert) {
    var strata = createStrata({ directory: tmp, leafSize: 3, branchSize: 3 })
    var riffle = require('..')
    async(function () {
        strata.create(async())
    }, function () {
        riffle.forward(strata, 'a', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (more) {
            assert(!more, 'forward keyed empty')
            iterator.unlock(async())
        })
    }, function () {
        riffle.forward(strata, async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (more) {
            assert(!more, 'forward left most empty')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, 'a', async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (more) {
            assert(!more, 'reverse keyed empty')
            iterator.unlock(async())
        })
    }, function () {
        riffle.reverse(strata, async())
    }, function (iterator) {
        async(function () {
            iterator.next(async())
        }, function (more) {
            assert(!more, 'reverse left most empty')
            iterator.unlock(async())
        })
    }, function () {
        strata.close(async())
    })
}