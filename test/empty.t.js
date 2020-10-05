require('proof')(2, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Destructible = require('destructible')

    const utilities = require('b-tree/utilities')

    const riffle = require('..')

    const directory = path.resolve(__dirname, './tmp', 'empty')

    {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const gathered = [], promises = []
        const iterator = riffle.forward(strata, Strata.MIN)
        while (!iterator.done) {
            iterator.next(promises, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (promises.length != 0) {
                await promises.shift()
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
        const gathered = [], promises = []
        const iterator = riffle.reverse(strata, Strata.MAX)
        while (!iterator.done) {
            iterator.next(promises, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (promises.length != 0) {
                await promises.shift()
            }
        }
        okay(gathered, [], 'empty forward')
        strata.destructible.destroy().rejected
    }
})
