const http = require('http')
const { spawn } = require('child_process')
const { PORT, SECRET } = require('./src/config')
const { sign } = require('./src/utils')
const { resultString } = require('./src/resModel')
const { format } = require('date-fns')
const Logger = require('./logger')

const server = http.createServer((req, res) => {
  const time = format(new Date(), 'yyyy-MM-dd')
  const loggerPath = `/var/log/webhook-log/${time}.log`
  const logger = new Logger(loggerPath)

  logger.record(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
  logger.record(`${req.method} ${req.url}`)

  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'POST' && req.url === '/webhook') {
    logger.record('hit webhook')

    const buffers = []

    req.on('data', buffer => {
      buffers.push(buffer)
    })

    req.on('end', () => {
      const body = Buffer.concat(buffers)
      const event = req.headers['x-github-event']
      const signature = req.headers['x-hub-signature']

      logger.record(`Event name: ${event}`)

      if (signature !== sign(body, SECRET)) {
        logger.error('The secret is error, stop the process, Goodbye.')
        return res.end(resultString('Not Allowed', 1))
      }

      if (event !== 'push') {
        logger.error('This isn\'t push event, stop the process, Goodbye.')

        return res.end(resultString('Not Match', 1))
      }

      if (event === 'push') {
        logger.record('hit push task')
        const payload = JSON.parse(body)
        logger.record(`repository name: ${payload.repository.name}; commit id: ${payload.head_commit.id}`)
        
        // The command parameter should not bring with space because the space will be recognize a part of parameter
        const projectDir = '/project'
        const childTask = spawn('sh', ['./pull.sh', `-r${payload.repository.name}`, `-t${payload.head_commit.id}`, `-p${projectDir}`])
        const childBuffers = []

        childTask.stdout.on('data', buffer => {
          childBuffers.push(buffer)
        })

        childTask.stdout.on('end', () => {
          const childLog = Buffer.concat(childBuffers)

          logger.record(childLog.toString())
          logger.record('finish pull project automation')
        })

        logger.write()
        logger.clear()
      }

      res.end(resultString('success', 0))
    })
  } else {
    logger.error('The request don\'t match webhook handler, Goodbye.')

    res.end(resultString('Not found', 1))
  }
})

server.listen(PORT, () => {
  console.log(`webhook listen on http://localhost:${PORT}`)
})
