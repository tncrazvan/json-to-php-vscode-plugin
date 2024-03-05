import { spawn } from 'child_process'
import { workspace, commands, window } from 'vscode'
import which from 'which'

const config = {
  phpExecutablePath: '',
  /**
   * @type {Array<string>}
   */
  phpExecutableArgs: [],
  maxRestartCount: 3,
}

/**
 *
 * @param {import('vscode').ExtensionContext} context
 */
export async function activate(context) {
  try {
    console.log('Activating json-to-php...')
    const configLocal = workspace.getConfiguration('json-to-php')

    const whichPHP = await which('php')
    config.phpExecutablePath = configLocal.get('phpExecutablePath', whichPHP)

    config.phpExecutableArgs = configLocal.get('phpExecutableArgs', [
      '-dxdebug.remote_autostart=0',
      '-dxdebug.remote_enable=0',
      '-dxdebug_profiler_enable=0',
    ])

    config.maxRestartCount = configLocal.get('maxRestartCount', 5)

    // spawn('')
    console.log('Done.')

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand(
      'json-to-php.helloWorld',
      function run() {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage(
          'Hello World from Json to Php!',
          JSON.stringify(config),
        )
      },
    )

    context.subscriptions.push(disposable)
  } catch (err) {
    console.error(err)
  }
}

export async function deactivate() {
  // Extensions should now implement a deactivate function in
  // their extension main file and correctly return the stop
  // promise from the deactivate call.
}
