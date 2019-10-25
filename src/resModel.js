/**
 * @param {String} message
 * @param {Number} code
 */
class ResModel {
  constructor ({ message, code }) {
    this.message = message
    this.code = code
  }
}

const resultString = (message, code) =>
  JSON.stringify(new ResModel({ message, code }))

module.exports = {
  ResModel,
  resultString
}
