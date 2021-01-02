require('proof')(2, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const FileSystem = require('b-tree/filesystem')
    const Magazine = require('magazine')
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
        const pages = new Magazine
        const handles = new FileSystem.HandleCache(new Magazine)
        const storage = new FileSystem(directory, handles)
        destructible.rescue($ => $(), 'test', async () => {
            const strata = await Strata.open(destructible.durable($ => $(), 'strata'), { pages, storage, turnstile, create: true })
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
        await destructible.promise
        await handles.shrink(0)
    }

    {
        await utilities.reset(directory)
        const destructible = new Destructible($ => $(), [ 'empty.t', 'reverse' ])
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const pages = new Magazine
        const handles = new FileSystem.HandleCache(new Magazine)
        const storage = new FileSystem(directory, handles)
        destructible.rescue($ => $(), 'test', async () => {
            const strata = await Strata.open(destructible.durable($ => $(), 'strata'), { pages, storage, turnstile, create: true })
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
        await destructible.promise
        await handles.shrink(0)
    }
})
