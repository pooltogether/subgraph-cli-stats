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

async function doIt() {
  let allPlayers = await fetchAllPlayers(allPlayersQuery)
  console.log('Total Player count: ', allPlayers.length)

  const leftPlayers = await fetchAllPlayers(leftPlayersQuery)
  console.log('Left player count: ', leftPlayers.length)

  console.log('Current player count: ', allPlayers.length - leftPlayers.length)
}

doIt().catch(e => {
  console.error(e)
})
