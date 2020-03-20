const apolloFetch = require('apollo-fetch')

var fetch = apolloFetch.createApolloFetch({ uri: process.env.GRAPHQL_ENDPOINT_URI });

var lifetimesQuery = `
  query userLifetimesQuery($first: Int!, $skip: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, skip: $skip, where: { lifetime_not: 0, firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
    }
  }
`

var foreverQuery = `
  query foreverQuery($first: Int!, $skip: Int!, $depositThreshold: String!) {
    userLifetimes (first: $first, skip: $skip, where: { lifetime: 0, firstDepositAmount_gt: $depositThreshold }) {
      id
      lifetime
    }
  }
`

async function fetchLifetimes(query, variables = {}) {
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

async function fetchAllLifetimes(variables = {}) {
  return await fetchLifetimes(lifetimesQuery, variables);
}

async function fetchAllForever(variables = {}) {
  return await fetchLifetimes(foreverQuery, variables);
}

module.exports = {
  fetchAllLifetimes, fetchAllForever
}