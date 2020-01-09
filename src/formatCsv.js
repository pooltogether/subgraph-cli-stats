const ethers = require('ethers')

function formatCsv(users) {
  const header = 'id,balance\n'
  const rows = users.map(user => `${user.id},${ethers.utils.formatEther(user.balance)}`).join('\n')
  return header + rows
}

module.exports = {
  formatCsv
}