const fs = require('fs')

class Logger {
  constructor (path) {
    this.path = path
    this.logQueue = []
  }

  record (record) {
    console.log(`=== ${record} === \n`)
    this.logQueue.push(`=== ${record} === \n`)
  }

  write () {
    this.logQueue.push('\n\n\n\n')
    const logQueueCopy = Object.assign([], this.logQueue)
    const logStr = logQueueCopy.join('')

    fs.appendFile(this.path, logStr, 'utf-8', err => {
      if (err) {
        console.error(err)
      }
    })
  }

  error (lastLog) {
    this.record(`error:: ${lastLog}`)
    this.write()
    this.logQueue = []
  }
}

module.exports = Logger
