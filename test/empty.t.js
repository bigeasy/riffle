require('proof')(2, async okay => {
    const path = require('path')

    const Strata = require('b-tree')
    const Operation = require('operation')
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
        const destructible = new Destructible($ => $(), 'empty.forward')
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const pages = new Magazine
        const handles = new Operation.Cache(new Magazine)
        const storage = new FileSystem.Writer(destructible.durable($ => $(), 'storage'), await FileSystem.open({ directory, handles, create: true }))
        destructible.rescue($ => $(), 'test', async () => {
            const strata = new Strata(destructible.durable($ => $(), 'strata'), { pages, storage, turnstile })
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
        const destructible = new Destructible($ => $(), 'empty.reverse')
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const pages = new Magazine
        const handles = new Operation.Cache(new Magazine)
        const storage = new FileSystem.Writer(destructible.durable($ => $(), 'storage'), await FileSystem.open({ directory, handles, create: true }))
        destructible.rescue($ => $(), 'test', async () => {
            const strata = new Strata(destructible.durable($ => $(), 'strata'), { pages, storage, turnstile })
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
