require('proof')(2, async okay => {
    const path = require('path')
    const fs = require('fs').promises
    const Strata = require('b-tree')
    const Cache = require('b-tree/cache')
    const Destructible = require('destructible')
    const directory = path.resolve(__dirname, './tmp')
    await fs.mkdir(directory, { recursive: true })
    const Riffle = require('..')
    const utilities = require('b-tree/utilities')

    await async function () {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'forward' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const forward = new Riffle.Forward(strata, Strata.MIN)
        const gathered = []
        while (await forward.next()) {
            const { items, index } = forward.get()
            for (let i = 0, I = items.length; i < I; i++) {
                gathered.push(items[i])
            }
        }
        okay(gathered, [], 'empty forward')
    } ()

    await async function () {
        await utilities.reset(directory)
        const destructible = new Destructible([ 'empty.t', 'reverse' ])
        const strata = new Strata(destructible, { directory, cache: new Cache })
        await strata.create()
        const reverse = new Riffle.Reverse(strata, Strata.MAX)
        const gathered = []
        while (await reverse.next()) {
            const { items, index } = reverse.get()
            for (let i = 0; i >= 0; i--) {
                gathered.push(items[i])
            }
        }
        okay(gathered, [], 'empty reverse')
    } ()
})
