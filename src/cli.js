#!/usr/bin/env node
const program = require('commander')
const stats = require("stats-lite")
const chalk = require('chalk')
const assert = require('assert')
const {
  fetchAllLifetimes,
  fetchAllForever
} = require('./fetch-lifetimes')
const ethers = require('ethers')

program
  .command('average')
  .option('-p, --percentile <number>', 'percentile to use (0 < whole number < 100)', 85)
  .option('-d, --depositThreshold <dai>', 'the minimum deposit', 0)
  .description('returns the average lifetime')
  .action(async ({ percentile, depositThreshold }) => {
    assert.ok(percentile > 0 && percentile < 100, "percentile is between 0 and 100")

    const depositThresholdWei = ethers.utils.parseEther(depositThreshold).toString()

    console.log(chalk.cyan(`Minimum first deposit size of ${depositThreshold} Dai`))

    let foreverLifetimes = await fetchAllForever({ depositThreshold: depositThresholdWei })
    let allLifetimes = await fetchAllLifetimes({ depositThreshold: depositThresholdWei })
    let lifetimes = allLifetimes.map(al => al.lifetime)

    const median = stats.median(lifetimes)
    const stdev = stats.stdev(lifetimes)

    const fraction = percentile / 100.0

    const percentileValue = stats.percentile(lifetimes, fraction)

    const secondsToDays = (seconds) => seconds / (3600 * 24.0)

    console.log(chalk.dim('---------------------------------------------'))
    console.log(chalk.green(`Number of non-zero lifetimes: ${lifetimes.length}`))
    console.log(chalk.green('Lifetime is duration between first deposit and first withdrawal'))
    console.log(chalk.yellow(`Median: ${secondsToDays(median)} days`))
    console.log(chalk.yellow(`Standard deviation: ${secondsToDays(stdev)} days`))
    console.log(chalk.yellow(`${fraction * 100} percentile: ${secondsToDays(percentileValue)} days`))
    console.log(chalk.dim('---------------------------------------------'))
    console.log(chalk.green(`Number of people who have never withdrawn: ${foreverLifetimes.length}`))
    console.log(chalk.dim('---------------------------------------------'))
  })

  async function run() {
  await program.parseAsync(process.argv)
}

run().catch(console.error)