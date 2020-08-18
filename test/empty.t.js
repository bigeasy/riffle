require('proof')(2, async okay => {
    const path = require('path')
    const fs = require('fs').promises

    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Destructible = require('destructible')

    const utilities = require('b-tree/utilities')

    const Riffle = require('..')

    const directory = path.resolve(__dirname, './tmp', 'empty')
    await fs.mkdir(directory, { recursive: true })

    await async function () {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const gathered = []
        for await (const items of new Riffle.Forward(strata, Strata.MIN)) {
            for (const item of items) {
                gathered.push(item)
            }
        }
        okay(gathered, [], 'empty forward')
        strata.close()
        await destructible.destructed
    } ()

    await async function () {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'reverse' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const gathered = []
        for await (const items of new Riffle.Reverse(strata, Strata.MAX)) {
            for (let i = items.length - 1; i != -1; i--) {
                gathered.push(items[i])
            }
        }
        okay(gathered, [], 'empty reverse')
        strata.close()
        await destructible.destructed
    } ()
})
