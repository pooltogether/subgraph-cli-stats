const apolloFetch = require('apollo-fetch')

var fetch = apolloFetch.createApolloFetch({ uri: process.env.GRAPHQL_ENDPOINT_URI });

var allUsers = `
  query allUsersQuery($first: Int!, $lastDepositedAt: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, orderBy: firstDepositAt, orderDirection: asc, where: { firstDepositAt_gt: $lastDepositedAt, firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
      firstDepositAt
    }
  }
`

var usersWhoHaveWithdrawn = `
  query usersWhoHaveWithdrawnQuery($first: Int!, $lastDepositedAt: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, orderBy: firstDepositAt, orderDirection: asc, where: { firstDepositAt_gt: $lastDepositedAt, firstDepositAmount_gt: $depositThreshold, lifetime_not: 0 }) {
      id
      lifetime
      firstDepositAt
    }
  }
`

var usersWhoHaveNotWithdrawn = `
  query usersWhoHaveNotWithdrawnQuery($first: Int!, $lastDepositedAt: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, orderBy: firstDepositAt, orderDirection: asc, where: { firstDepositAt_gt: $lastDepositedAt, firstDepositAmount_gt: $depositThreshold, lifetime: 0 }) {
      id
      lifetime
      firstDepositAt
    }
  }
`

async function fetchAllPages(query, variables = {}) {
  const first = 1000
  let userLifetimes = []
  let lastDepositedAt = 0
  let hasMore = true
  while (hasMore) {
    let userLifetimesPage = await fetch({
      query,
      variables: {
        first,
        lastDepositedAt,
        ...variables
      }
    })
    if (userLifetimesPage.errors) {
      console.error(userLifetimesPage.errors)
    }
    userLifetimes = userLifetimes.concat(userLifetimesPage.data.userLifetimes)
    hasMore = userLifetimesPage.data.userLifetimes.length === first
    lastDepositedAt = parseInt(userLifetimesPage.data.userLifetimes[userLifetimesPage.data.userLifetimes.length - 1].firstDepositAt)
  }
  return userLifetimes
}

async function fetchAllUsers(variables = {}) {
  return await fetchAllPages(allUsers, variables);
}

async function fetchUsersWhoHaveWithdrawn(variables = {}) {
  return await fetchAllPages(usersWhoHaveWithdrawn, variables);
}

async function fetchUsersWhoHaveNotWithdrawn(variables = {}) {
  return await fetchAllPages(usersWhoHaveNotWithdrawn, variables);
}

module.exports = {
  fetchAllUsers,
  fetchUsersWhoHaveWithdrawn,
  fetchUsersWhoHaveNotWithdrawn
}