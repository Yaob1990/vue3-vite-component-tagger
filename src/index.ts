import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import path from 'node:path'
import type { Plugin } from 'vite'

const VALID_EXTENSIONS = new Set(['.vue'])

interface DyadTaggerOptions {
  idAttribute?: string
  nameAttribute?: string
}

export default function dyadTagger(options: DyadTaggerOptions = {}): Plugin {
  const { idAttribute = 'data-soeasy-id', nameAttribute = 'data-soeasy-name' } =
    options
  return {
    name: 'vite-plugin-vue-dyad-tagger',
    apply: 'serve',
    enforce: 'pre',

    async transform(code: string, id: string) {
      try {
        if (
          !VALID_EXTENSIONS.has(path.extname(id)) ||
          id.includes('node_modules')
        )
          return null

        const { descriptor } = parse(code, { filename: id })

        if (!descriptor.template) {
          return null
        }

        const templateContent = descriptor.template.content
        const templateStart = descriptor.template.loc.start.offset

        // 改进的正则表达式，更好地处理带有 Vue 指令的标签
        // 匹配开始标签，包括带有 v-if, v-else, v-for 等指令的标签
        const tagRegex =
          /<([a-zA-Z][a-zA-Z0-9-]*(?:\.[a-zA-Z][a-zA-Z0-9-]*)*)(\s+[^>]*?)?(\s*\/)?>/g

        const ms = new MagicString(code)
        let match
        let processedTags = 0

        while ((match = tagRegex.exec(templateContent)) !== null) {
          const [, tagName, attributes = ''] = match
          const tagStartInTemplate = match.index

          // 跳过已经有指定 id 属性的标签
          if (attributes.includes(idAttribute)) {
            continue
          }

          // 跳过 template 标签（Vue 的控制流标签）
          if (tagName === 'template') {
            continue
          }

          // 计算在整个文件中的位置
          const tagPositionInFile = templateStart + tagStartInTemplate

          // 计算行号和列号
          const lines = code.substring(0, tagPositionInFile).split('\n')
          const line = lines.length
          const column = lines[lines.length - 1].length + 1

          const elementId = `${id}:${line}:${column}`

          // 找到插入位置
          // 需要在标签名后面，但在其他属性之前插入
          let insertPosition =
            templateStart + tagStartInTemplate + 1 + tagName.length

          // 如果标签名后面没有空格，我们需要添加一个空格
          const charAfterTagName = code[insertPosition]
          const needsSpace =
            charAfterTagName !== ' ' &&
            charAfterTagName !== '\n' &&
            charAfterTagName !== '\t'

          // 添加可配置的属性
          const attributesToAdd = needsSpace
            ? ` ${idAttribute}="${elementId}" ${nameAttribute}="${tagName}"`
            : ` ${idAttribute}="${elementId}" ${nameAttribute}="${tagName}"`

          ms.appendLeft(insertPosition, attributesToAdd)
          processedTags++
        }

        if (processedTags === 0) {
          return null
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: true }),
        }
      } catch (error) {
        console.warn(
          `[vue-dyad-tagger] Warning: Failed to transform ${id}:`,
          error
        )
        return null
      }
    },
  }
}
