require('proof')(13, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Trampoline = require('reciprocate')
    const Destructible = require('destructible')

    const mvcc = require('mvcc')

    const utilities = require('b-tree/utilities')

    const riffle = require('..')

    const directory = path.resolve(__dirname, './tmp/riffle')

    await utilities.reset(directory)
    await utilities.serialize(directory, {
      '0.0': [ [ '0.1', null ], [ '1.1', 'd' ], [ '1.3', 'g' ] ],
      '0.1': [ [ 'right', 'd' ], [ 'insert', 0, 'a' ], [ 'insert', 1, 'b' ], [ 'insert', 2, 'c' ] ],
      '1.1': [ [ 'right', 'g' ], [ 'insert', 0, 'd' ], [ 'insert', 1, 'e' ], [ 'insert', 2, 'f' ] ],
      '1.3': [ [ 'insert', 0, 'g' ], [ 'insert', 1, 'h' ], [ 'insert', 2, 'j' ], [ 'delete', 0 ] ]
    })

    const expected = [ 'a', 'b', 'c', 'd', 'e', 'f', 'h', 'j' ]

    {
        const destructible = new Destructible([ 'riffle.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, Strata.MIN, { slice: 2 })
        okay(iterator.type != null, 'reverse type not null')
        okay(iterator.type, mvcc.FORWARD, 'type if forward')
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected, 'forward')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'reverse' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, Strata.MAX, { slice: 2, reverse: true })
        okay(iterator.type != null, 'reverse type not null')
        okay(iterator.type, mvcc.REVERSE, 'type if reverse')
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected.slice().reverse(), 'reverse')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'exclusive' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, 'b', { slice: 2, inclusive: false })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected.slice(2), 'forward exclusive')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'exclusive' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, 'h', { slice: 2, inclusive: false, reverse: true })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected.slice().reverse().slice(2), 'reverse exclusive')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'missed' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, 'Z', { inclusive: false })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected, 'forward missed')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'missed' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, 'i', { slice: 2, inclusive: false, reverse: true })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected.slice().reverse().slice(1), 'reverse missed')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'missed' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, 'l', { slice: 2, inclusive: false, reverse: true })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected.slice().reverse(), 'reverse beyond end')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'forward', 'iterator' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, Strata.MIN)
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, expected, 'forward iterator')
        strata.destructible.destroy().rejected
    }

    {
        const destructible = new Destructible([ 'riffle.t', 'reverse', 'min' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.open()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle(strata, Strata.MIN, { reverse: true })
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item.key)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, [], 'reverse min')
        strata.destructible.destroy().rejected
    }
})
