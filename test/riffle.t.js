require('proof')(7, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Racer = require('b-tree/racer')
    const Cache = require('b-tree/cache')
    const Destructible = require('destructible')

    const utilities = require('b-tree/utilities')

    const riffle = require('..')

    const directory = path.resolve(__dirname, './tmp/riffle')

    await utilities.reset(directory)
    await utilities.serialize(directory, {
      '0.0': [ [ '0.1', null ], [ '1.1', 'd' ], [ '1.3', 'g' ] ],
      '0.1': [ [ 'right', 'd' ], [ 'insert', 0, 'a' ], [ 'insert', 1, 'b' ], [ 'insert', 2, 'c' ] ],
      '1.1': [ [ 'right', 'g' ], [ 'insert', 0, 'd' ], [ 'insert', 1, 'e' ], [ 'insert', 2, 'f' ] ],
      '1.3': [ [ 'insert', 0, 'g' ], [ 'insert', 1, 'h' ], [ 'insert', 2, 'i' ], [ 'delete', 0 ] ]
    })

    const expected = [ 'a', 'b', 'c', 'd', 'e', 'f', 'h', 'i' ]

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = []
        for await (const items of riffle.forward(strata, Strata.MIN, { slice: 2 })) {
            for (const item of items) {
                gathered.push(item.key)
            }
        }
        okay(gathered, expected, 'forward')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'reverse' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = []
        for await (const items of riffle.reverse(strata, Strata.MAX, { slice: 2 })) {
            for (let i = items.length - 1; i != -1; i--) {
                gathered.push(items[i].key)
            }
        }
        okay(gathered, expected.slice().reverse(), 'reverse')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'exclusive' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = []
        for await (const items of riffle.forward(strata, 'b', { slice: 2, inclusive: false })) {
            for (const item of items) {
                gathered.push(item.key)
            }
        }
        okay(gathered, expected.slice(2), 'forward exclusive')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'exclusive' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = []
        for await (const items of riffle.reverse(strata, 'h', { slice: 2, inclusive: false })) {
            for (let i = items.length - 1; i != -1; i--) {
                gathered.push(items[i].key)
            }
        }
        okay(gathered, expected.slice().reverse().slice(2), 'reverse exclusive')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'missed' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const forward = riffle.forward(strata, 'Z', { inclusive: false })
        const gathered = []
        for await (const items of riffle.forward(strata, 'Z', 2, false)) {
            for (const item of items) {
                gathered.push(item.key)
            }
        }
        okay(gathered, expected, 'forward missed')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'missed' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = []
        for await (const items of riffle.reverse(strata, 'j', { slice: 2, inclusive: false })) {
            for (let i = items.length - 1; i != -1; i--) {
                gathered.push(items[i].key)
            }
        }
        okay(gathered, expected.slice().reverse(), 'reverse missed')
        strata.destructible.destroy().rejected
    } ()

    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'iterator' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const forward = riffle.forward(strata, Strata.MIN)
        const gathered = []
        for await (const got of forward) {
            for (const item of got) {
                gathered.push(item.key)
            }
        }
        okay(gathered, expected, 'forward iterator')
        strata.destructible.destroy().rejected
    } ()


    await async function () {
        const destructible = new Destructible([ 'riffle.t', 'break' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const forward = riffle.forward(strata, Strata.MIN)
        for await (const got of forward) {
            break
        }
        strata.destructible.destroy().rejected
    } ()

    // TODO Start of a test of a deleted page.
    {
        const destructible = new Destructible([ 'riffle.t', 'deleted' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        const racer = new Racer(strata, function ({ key }) {
            console.log(key)
        })
        await racer.open()
        const forward = riffle.forward(racer, 'd', { slice: 2 })
        for await (const items of forward) {
        }
        strata.destructible.destroy().rejected
    }
})
