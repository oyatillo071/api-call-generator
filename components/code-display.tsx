"use client"

import { useTheme } from "next-themes"
import { Highlight, themes } from "prism-react-renderer"

interface CodeDisplayProps {
  code: string
  language: string
}

export default function CodeDisplay({ code, language }: CodeDisplayProps) {
  const { theme } = useTheme()

  return (
    <div className="rounded-md overflow-hidden">
      <Highlight code={code} language={language} theme={theme === "dark" ? themes.nightOwl : themes.github}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} p-4 overflow-auto text-sm`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="text-gray-500 mr-4">{i + 1}</span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
