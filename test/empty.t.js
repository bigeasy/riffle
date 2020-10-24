require('proof')(2, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Trampoline = require('reciprocate')
    const Destructible = require('destructible')

    const utilities = require('b-tree/utilities')

    const riffle = require('..')

    const directory = path.resolve(__dirname, './tmp', 'empty')

    {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle.forward(strata, Strata.MIN)
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, [], 'empty forward')
        strata.destructible.destroy().rejected
    }

    {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const gathered = [], trampoline = new Trampoline
        const iterator = riffle.reverse(strata, Strata.MAX)
        while (!iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, [], 'empty forward')
        strata.destructible.destroy().rejected
    }
})
