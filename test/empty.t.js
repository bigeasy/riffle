require('proof')(2, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Cache = require('magazine')
    const Trampoline = require('reciprocate')
    const Destructible = require('destructible')
    const Turnstile = require('turnstile')

    const utilities = require('b-tree/utilities')

    const riffle = require('..')

    const directory = path.resolve(__dirname, './tmp', 'empty')

    {
        await utilities.reset(directory)
        const destructible = new Destructible($ => $(), [ 'empty.t', 'forward' ])
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const cache = new Cache
        destructible.rescue($ => $(), 'test', async () => {
            const strata = await Strata.open(destructible.durable($ => $(), 'strata'), { directory, cache, turnstile, create: true })
            const gathered = [], trampoline = new Trampoline
            const iterator = riffle(strata, Strata.MIN)
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
            destructible.destroy()
        })
        await destructible.rejected
    }

    {
        await utilities.reset(directory)
        const destructible = new Destructible($ => $(), [ 'empty.t', 'reverse' ])
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const cache = new Cache
        destructible.rescue($ => $(), 'test', async () => {
            const strata = await Strata.open(destructible.durable($ => $(), 'strata'), { directory, cache, turnstile, create: true })
            const gathered = [], trampoline = new Trampoline
            const iterator = riffle(strata, Strata.MAX, { reverse: true })
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
            okay(gathered, [], 'empty reverse')
            destructible.destroy()
        })
        await destructible.rejected
    }
})
