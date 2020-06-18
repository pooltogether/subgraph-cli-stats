const apolloFetch = require('apollo-fetch')

var fetch = apolloFetch.createApolloFetch({ uri: process.env.GRAPHQL_ENDPOINT_URI });

var allUsers = `
  query allUsersQuery($first: Int!, $skip: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, skip: $skip, where: { firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
    }
  }
`

var usersWhoHaveWithdrawn = `
  query usersWhoHaveWithdrawnQuery($first: Int!, $skip: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, skip: $skip, where: { lifetime_not: 0, firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
    }
  }
`

var usersWhoHaveNotWithdrawn = `
  query usersWhoHaveNotWithdrawnQuery($first: Int!, $skip: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, skip: $skip, where: { lifetime: 0, firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
    }
  }
`

async function fetchAllPages(query, variables = {}) {
  const pageSize = 1000
  let userLifetimes = []
  let page = 0
  let hasMore = true
  while (hasMore) {
    page += 1
    let userLifetimesPage = await fetch({
      query,
      variables: {
        first: pageSize,
        skip: pageSize * (page-1),
        ...variables
      }
    })
    if (userLifetimesPage.errors) {
      console.error(userLifetimesPage.errors)
    }
    userLifetimes = userLifetimes.concat(userLifetimesPage.data.userLifetimes)
    hasMore = userLifetimesPage.data.userLifetimes.length === pageSize
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