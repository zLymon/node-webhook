const crypto = require('crypto')

const sign = (body, secret) => {
  return `sha1=${crypto
    .createHmac('sha1', secret)
    .update(body)
    .digest('hex')}`
}

module.exports = {
  sign
}
