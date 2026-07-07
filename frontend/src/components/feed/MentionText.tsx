import { Link } from 'react-router-dom'

interface MentionTextProps {
  content: string
}

export default function MentionText({ content }: MentionTextProps) {
  // Regex to match @username mentions
  const mentionRegex = /@(\w+)/g
  
  const parts = []
  let lastIndex = 0
  let match
  
  // Reset regex index
  mentionRegex.lastIndex = 0
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]
    const fullMatch = match[0]
    const matchIndex = match.index
    
    // Push text before the mention
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, matchIndex)
      })
    }
    
    // Push the mention as a link
    parts.push({
      type: 'mention',
      username: username,
      content: fullMatch
    })
    
    lastIndex = matchIndex + fullMatch.length
  }
  
  // Push remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    })
  }
  
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <Link
              key={index}
              to={`/profile/${part.username}`}
              className="inline-block hover:underline transition-colors"
              style={{ color: '#E63946', fontWeight: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              @{part.username}
            </Link>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </span>
  )
}