import { spawn } from 'child_process'
import { commands, window } from 'vscode'

const decoder = new TextDecoder('UTF-8')

/**
 *
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate({ subscriptions, globalState }) {
  try {
    console.log('Activating json-to-php.')

    subscriptions.push(askForPhp({ globalState }))
    subscriptions.push(askForJtp({ globalState }))
    subscriptions.push(translateCurrentFile({ globalState }))
  } catch (err) {
    console.error(err)
  }
}

export async function deactivate() {
  // Extensions should now implement a deactivate function in
  // their extension main file and correctly return the stop
  // promise from the deactivate call.
}

async function findPhp() {
  const items = await window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
  })

  if (!items?.length) {
    return false
  }

  return items[0]
}

async function findJtp() {
  const items = await window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    filters: {
      Phar: ['phar'],
    },
  })

  if (!items?.length) {
    return false
  }

  return items[0]
}

/**
 * @param {{globalState:import('vscode').Memento}} payload
 * @returns
 */
function askForPhp({ globalState }) {
  return commands.registerCommand(
    'json-to-php.set-php-binary',
    async function run() {
      const whichPhp = await findPhp()
      if (!whichPhp) {
        console.log('Php not found.')
        return
      }
      await globalState.update('php', whichPhp)
      console.log('Php found at', whichPhp)
    },
  )
}

/**
 * @param {{globalState:import('vscode').Memento}} payload
 * @returns
 */
function askForJtp({ globalState }) {
  return commands.registerCommand(
    'json-to-php.set-jtp-phar',
    async function run() {
      const whichJtp = await findJtp()
      if (!whichJtp) {
        console.log('Jtp not found.')
        return
      }
      await globalState.update('jtp', whichJtp)
      console.log('Jtp found at', whichJtp)
    },
  )
}

/**
 * @param {{globalState:import('vscode').Memento}} payload
 * @returns
 */
function translateCurrentFile({ globalState }) {
  return commands.registerCommand(
    'json-to-php.transpile',
    async function run() {
      /**
       * @type {undefined|import('vscode').Uri}
       */
      const whichPhp = globalState.get('php')
      if (!whichPhp) {
        console.log('Php not found.')
        return
      }
      /**
       * @type {undefined|import('vscode').Uri}
       */
      const whichJtp = globalState.get('jtp')
      if (!whichJtp) {
        console.log('Jtp not found.')
        return
      }

      const php = whichPhp.fsPath
      if (!php) {
        console.log('Php not found.')
        return
      }
      const jtp = whichJtp.fsPath
      if (!jtp) {
        console.log('Jtp not found.')
        return
      }

      const fileName = window.activeTextEditor?.document.fileName ?? ''
      console.log(`Spawning ${php} ${jtp} ${fileName}...`)
      const process = spawn(php, [jtp, fileName])

      process.stdout.on('data', function stdout(data) {
        console.log(decoder.decode(Buffer.from(data)))
      })

      process.stderr.on('data', function stderr(data) {
        console.error(decoder.decode(Buffer.from(data)))
      })

      process.on('close', function done(code) {
        console.log(`Done ${code}.`)
      })
    },
  )
}
