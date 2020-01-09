const apolloFetch = require('apollo-fetch')

var fetch = apolloFetch.createApolloFetch({ uri: process.env.GRAPHQL_ENDPOINT_URI });

var allPlayersQuery = `
  query allPlayers($first: Int!, $skip: Int!) {
    players (first: $first, skip: $skip) {
      id
      balance
      sponsorshipBalance
    }
  }
`

var leftPlayersQuery = `
  query leftPlayers($first: Int!, $skip: Int!) {
    players (first: $first, skip: $skip, where: { balance: 0 }) {
      id
      balance
      sponsorshipBalance
    }
  }
`

var currentPlayersQuery = `
  query currentPlayers($first: Int!, $skip: Int!) {
    players (first: $first, skip: $skip, where: { balance_gt: 0 }, orderBy: balance) {
      id
      balance
      sponsorshipBalance
    }
  }
`

async function fetchAllPlayers(query) {
  const pageSize = 1000
  let players = []
  let page = 0
  let hasMore = true
  while (hasMore) {
    page += 1
    const variables = { first: pageSize, skip: pageSize * (page-1) }
    let playersPage = await fetch({
      query,
      variables
    })
    players = players.concat(playersPage.data.players)
    hasMore = playersPage.data.players.length === pageSize
  }
  return players
}

async function allPlayers() {
  return await fetchAllPlayers(allPlayersQuery);
}

async function leftPlayers() {
  return await fetchAllPlayers(leftPlayersQuery)
}

async function currentPlayers() {
  return await fetchAllPlayers(currentPlayersQuery)
}

module.exports = {
  allPlayers, leftPlayers, currentPlayers
}