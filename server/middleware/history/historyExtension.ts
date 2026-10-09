import nunjucks, { Extension } from 'nunjucks'
import { serialiseHistory } from './historyMiddleware'

export const historyExtension: Extension & {
  run: (context: unknown, getBody: () => string, getHistory: () => string) => nunjucks.runtime.SafeString
} = {
  tags: ['addHistory'],

  parse(parser, nodes, lexer) {
    const sumNode = parser.nextToken()
    parser.advanceAfterBlockEnd(sumNode.value)

    const bodyNode = parser.parseUntilBlocks('history', 'endAddHistory')
    let historyBody = null
    if (parser.skipSymbol('history')) {
      parser.skip(lexer.TOKEN_BLOCK_END)
      historyBody = parser.parseUntilBlocks('endAddHistory')
    }
    parser.advanceAfterBlockEnd()
    return new nodes.CallExtension(this, 'run', undefined, [bodyNode, historyBody])
  },

  run(_, getBody, getHistory) {
    const body = getBody()
    try {
      const history = encodeURIComponent(serialiseHistory(JSON.parse(getHistory().trim())))
      let lastIndex = 0
      const newBody: string[] = []
      const matches = body.matchAll(/href="(.[^"]+)"/g)
      matches.forEach(match => {
        newBody.push(body.substring(lastIndex, match.index))
        lastIndex = match.index
        if (
          match[1]?.startsWith('http') ||
          match[1]?.startsWith('mailto:') ||
          match[1]?.startsWith('#') ||
          match[1]?.includes('?history=') ||
          match[1]?.includes('&history=')
        ) {
          newBody.push(match[0])
        } else if (match[1]?.includes('#')) {
          const [url, hashtag] = match[1].split('#')
          newBody.push(`href="${url?.includes('?') ? `${url}&` : `${url}?`}history=${history}#${hashtag}"`)
        } else {
          newBody.push(`href="${match[1]?.includes('?') ? `${match[1]}&` : `${match[1]}?`}history=${history}"`)
        }
      })
      newBody.push(body.substring(lastIndex))
      return new nunjucks.runtime.SafeString(newBody.join(''))
    } catch {
      return new nunjucks.runtime.SafeString(body)
    }
  },
}
