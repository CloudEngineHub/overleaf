// This file is shared between the frontend and server code of web, so that
// filename validation is the same in both implementations.
// The logic in all copies must be kept in sync:
//   app/src/Features/Project/SafePath.js
//   frontend/js/ide/directives/SafePath.js
//   frontend/js/features/file-tree/util/safe-path.js
// eslint-disable-next-line prefer-regex-literals
const BADCHAR_RX = new RegExp(
  `\
[\
\\/\
\\\\\
\\*\
\\u0000-\\u001F\
\\u007F\
\\u0080-\\u009F\
\\uD800-\\uDFFF\
]\
`,
  'g'
)
// eslint-disable-next-line prefer-regex-literals
const BADFILE_RX = new RegExp(
  `\
(^\\.$)\
|(^\\.\\.$)\
|(^\\s+)\
|(\\s+$)\
`,
  'g'
)

// Put a block on filenames which match javascript property names, as they
// can cause exceptions where the code puts filenames into a hash. This is a
// temporary workaround until the code in other places is made safe against
// property names.
//
// The list of property names is taken from
//   ['prototype'].concat(Object.getOwnPropertyNames(Object.prototype))
// eslint-disable-next-line prefer-regex-literals
const BLOCKEDFILE_RX = new RegExp(`\
^(\
prototype\
|constructor\
|toString\
|toLocaleString\
|valueOf\
|hasOwnProperty\
|isPrototypeOf\
|propertyIsEnumerable\
|__defineGetter__\
|__lookupGetter__\
|__defineSetter__\
|__lookupSetter__\
|__proto__\
)$\
`)

const MAX_PATH = 1024 // Maximum path length, in characters. This is fairly arbitrary.

export function clean(filename: string): string {
  filename = filename.replace(BADCHAR_RX, '_')
  // for BADFILE_RX replace any matches with an equal number of underscores
  filename = filename.replace(BADFILE_RX, match =>
    new Array(match.length + 1).join('_')
  )
  // replace blocked filenames 'prototype' with '@prototype'
  filename = filename.replace(BLOCKEDFILE_RX, '@$1')
  return filename
}

export function isCleanFilename(filename: string): boolean {
  return (
    isAllowedLength(filename) &&
    !filename.match(BADCHAR_RX) &&
    !filename.match(BADFILE_RX)
  )
}

export function isBlockedFilename(filename: string): boolean {
  return BLOCKEDFILE_RX.test(filename)
}

// returns whether a full path is 'clean' - e.g. is a full or relative path
// that points to a file, and each element passes the rules in 'isCleanFilename'
export function isCleanPath(path: string): boolean {
  const elements = path.split('/')

  const lastElementIsEmpty = elements[elements.length - 1].length === 0
  if (lastElementIsEmpty) {
    return false
  }

  for (const element of Array.from(elements)) {
    if (element.length > 0 && !isCleanFilename(element)) {
      return false
    }
  }

  // check for a top-level reserved name
  if (BLOCKEDFILE_RX.test(path.replace(/^\/?/, ''))) {
    return false
  } // remove leading slash if present

  return true
}

export function isAllowedLength(pathname: string): boolean {
  return pathname.length > 0 && pathname.length <= MAX_PATH
}
