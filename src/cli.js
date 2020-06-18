#!/usr/bin/env node
const program = require('commander')
const stats = require("stats-lite")
const chalk = require('chalk')
const assert = require('assert')
const {
  fetchUsersWhoHaveWithdrawn,
  fetchUsersWhoHaveNotWithdrawn,
  fetchAllUsers
} = require('./fetch-lifetimes')
const ethers = require('ethers')

const secondsToDays = (seconds) => seconds / (3600 * 24.0)

program
  .command('average')
  // .option('-p, --percentile <number>', 'percentile to use (0 < whole number < 100)', 85)
  .option('-d, --depositThreshold <dai>', 'the minimum deposit', '0')
  .description('returns the average lifetime')
  .action(async ({ percentile, depositThreshold }) => {
    assert.ok(percentile > 0 && percentile <= 100, "percentile is between 0 and 100")

    const depositThresholdWei = ethers.utils.parseEther(depositThreshold).toString()

    console.log(chalk.cyan(`Minimum first deposit size of ${depositThreshold} Dai`))

    let allUsers = await fetchAllUsers({ depositThreshold: depositThresholdWei })
    let usersWhoHaveNotWithdrawn = await fetchUsersWhoHaveNotWithdrawn({ depositThreshold: depositThresholdWei })
    let usersWhoHaveWithdrawn = await fetchUsersWhoHaveWithdrawn({ depositThreshold: depositThresholdWei })
    let lifetimes = usersWhoHaveWithdrawn.map(al => al.lifetime)

    const median = stats.median(lifetimes)
    const stdev = stats.stdev(lifetimes)

    const percentiles = []
    for (let i = 10; i < 100; i += 10) {
      const fraction = i / 100.0
      const percentileValue = stats.percentile(lifetimes, fraction)
      percentiles.push(`${fraction * 100} percentile: ${secondsToDays(percentileValue)} days`)
    }

    console.log(chalk.dim('---------------------------------------------'))
    console.log(chalk.green(`Number of users: ${allUsers.length}`))
    console.log(chalk.green(`Number of users who have withdrawn: ${usersWhoHaveWithdrawn.length}`))
    console.log(chalk.green(`Number of users who have not withdrawn: ${usersWhoHaveNotWithdrawn.length}`))
    console.log(chalk.green('Lifetime is duration between first deposit and first withdrawal'))
    console.log(chalk.yellow(`Median: ${secondsToDays(median)} days`))
    console.log(chalk.yellow(`Standard deviation: ${secondsToDays(stdev)} days`))
    console.log(chalk.yellow(percentiles.join('\n')))
    console.log(chalk.dim('---------------------------------------------'))
  })

  async function run() {
  await program.parseAsync(process.argv)
}

run().catch(console.error)