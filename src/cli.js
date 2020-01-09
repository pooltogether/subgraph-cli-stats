#!/usr/bin/env node
const program = require('commander')
const {
  allPlayers,
  leftPlayers,
  currentPlayers
} = require('./count-players')
const { formatCsv } = require('./formatCsv')

program
  .command('count')
  .description('returns the total count of all players and departed players')
  .action(async () => {
    let allPlayersResult = await allPlayers()
    console.log('Total Player count: ', allPlayersResult.length)

    const leftPlayersResult = await leftPlayers()
    console.log('Left player count: ', leftPlayersResult.length)

    console.log('Current player count: ', allPlayersResult.length - leftPlayersResult.length)
  })

program
  .command('csv')
  .option('-t, --type <type>', 'selects the type of output.  "current" players or "departed" players. Defaults to current.', 'current')
  .description('output a csv of all players')
  .action(async function (cmd, type) {
    type = type.toString()
    switch (type) {
      case 'current':
        console.log(formatCsv(await currentPlayers()))
        break;
      case 'departed':
        console.log(formatCsv(await leftPlayers()))
        break;
      default:
        throw `Unknown type: ${type}`
    }
  })

async function run() {
  await program.parseAsync(process.argv)
}

run().catch(console.error)