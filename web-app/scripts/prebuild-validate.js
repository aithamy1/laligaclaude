const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

function fail(message) {
  console.error(`\n[prebuild-check] ${message}\n`)
  process.exit(1)
}

function checkNoGitDiffHeader(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const firstLine = content.split(/\r?\n/, 1)[0].trim()

  if (firstLine.startsWith('diff --git ')) {
    fail(
      `${path.relative(root, filePath)} parece contener un patch git pegado por error. ` +
      `Abre el archivo y elimina las líneas que empiecen por "diff --git", "index", "---", "+++" y "@@".`
    )
  }
}

function checkJson(filePath) {
  try {
    JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    fail(`${path.relative(root, filePath)} no es JSON válido: ${error.message}`)
  }
}

checkNoGitDiffHeader(path.join(root, 'app/page.tsx'))
checkJson(path.join(root, 'public/data/picks_complete.json'))

console.log('[prebuild-check] OK: app/page.tsx y picks_complete.json validados.')
