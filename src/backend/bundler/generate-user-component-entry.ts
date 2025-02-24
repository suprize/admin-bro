import { posix as path } from 'path'

/**
 * Generates entry file for all UsersComponents.
 * Entry consists of 3 parts:
 * 1. setup AdminBro.UserComponents map.
 * 2. List of all environmental variables passed to AdminBro in configuration option.
 * 3. Import of UserComponents defined by AdminBro.require(src)
 *
 * @param {AdminBro}    admin
 * @param {String}      entryPath  path to folder where entry file is located
 * @return {String}     content of an entry file
 *
 * @private
 */
const generateUserComponentEntry = (admin, entryPath: string): string => {
  const { env = {} } = admin.options
  const { UserComponents } = admin.constructor

  const absoluteEntryPath = path.resolve(entryPath)

  const setupPart = 'AdminBro.UserComponents = {}\n'

  const envPart = Object.keys(env).map(envKey => (
    `AdminBro.env.${envKey} = ${JSON.stringify(env[envKey])}\n`
  )).join('')
  const componentsPart = Object.keys(UserComponents).map(componentId => (
    [
      `import ${componentId} from '${path.relative(absoluteEntryPath, UserComponents[componentId])}'`,
      `AdminBro.UserComponents.${componentId} = ${componentId}`,
    ].join('\n')
  )).join('\n')
  return setupPart + envPart + componentsPart
}

export default generateUserComponentEntry
