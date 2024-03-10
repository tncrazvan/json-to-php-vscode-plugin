import which from 'which'
import { spawn } from 'child_process'
import { commands, window, workspace } from 'vscode'

const decoder = new TextDecoder('UTF-8')

function inWorkspace() {
  if (!workspace.workspaceFolders) {
    console.error(
      'Json to Php must be run in a workspace. Select a workspace and reload the window.',
    )
    return false
  }
  console.log(`Workspace detected `)
  return true
}

/**
 *
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate({ subscriptions }) {
  try {
    const config = workspace.getConfiguration('json-to-php')

    console.log('Activating json-to-php.')

    try {
      const defaultWhichPhp = await which('php')
      const currentWhichPhp = config.get('php')
      console.log('currentWhichPhp', currentWhichPhp)
      if (!currentWhichPhp) {
        config.update('php', defaultWhichPhp)
      }
    } catch (err) {
      console.error(err)
    }

    subscriptions.push(askForPhp())
    subscriptions.push(askForJtp())
    subscriptions.push(translateCurrentFile())
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

function askForPhp() {
  return commands.registerCommand(
    'json-to-php.set-php-path',
    async function run() {
      if (!inWorkspace()) {
        return
      }
      const whichPhp = await findPhp()
      if (!whichPhp) {
        console.log('Php not found.')
        return
      }

      const config = workspace.getConfiguration('json-to-php')

      await config.update('php', whichPhp.fsPath)

      console.log('Php found at', whichPhp.fsPath)
    },
  )
}

function askForJtp() {
  return commands.registerCommand(
    'json-to-php.set-jtp-path',
    async function run() {
      if (!inWorkspace()) {
        return
      }
      const whichJtp = await findJtp()
      if (!whichJtp) {
        console.log('Jtp not found.')
        return
      }

      const config = workspace.getConfiguration('json-to-php')

      await config.update('jtp', whichJtp.fsPath)

      console.log('Jtp found at', whichJtp.fsPath)
    },
  )
}

function translateCurrentFile() {
  return commands.registerCommand(
    'json-to-php.convert-current-file',
    async function run() {
      const config = workspace.getConfiguration('json-to-php')

      /**
       * @type {undefined|string}
       */
      const whichPhp = config.get('php')
      if (!whichPhp) {
        console.log('Php not found.')
        return
      }
      /**
       * @type {undefined|string}
       */
      const whichJtp = config.get('jtp')
      if (!whichJtp) {
        console.log('Jtp not found.')
        return
      }

      if (!whichPhp) {
        console.log('Php not found.')
        return
      }
      if (!whichJtp) {
        console.log('Jtp not found.')
        return
      }

      const fileName = window.activeTextEditor?.document.fileName ?? ''
      console.log(`Spawning ${whichPhp} ${whichJtp} ${fileName}...`)
      const process = spawn(whichPhp, [whichJtp, fileName])

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
