import { useEffect, useRef } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  position?: 'top' | 'bottom'
}

export default function EmojiPicker({ onEmojiSelect, onClose, position = 'bottom' }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div 
      ref={pickerRef}
      className={`absolute ${position === 'bottom' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 z-50 animate-scale-in`}
      style={{ 
        transformOrigin: position === 'bottom' ? 'bottom left' : 'top left'
      }}
    >
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => {
          onEmojiSelect(emoji.native)
          onClose()
        }}
        theme="light"
        previewPosition="none"
        searchPosition="sticky"
        navPosition="sticky"
        skinTonePosition="none"
        emojiSize={24}
        emojiButtonSize={36}
        perLine={8}
        maxFrequentRows={1}
        categories={[
          'frequent',
          'people',
          'nature',
          'foods',
          'activity',
          'places',
          'objects',
          'symbols',
          'flags'
        ]}
        categoryIcons={{
          frequent: '🕐',
          people: '😊',
          nature: '🌿',
          foods: '🍕',
          activity: '⚽',
          places: '🏠',
          objects: '💡',
          symbols: '❤️',
          flags: '🏴'
        }}
        custom={[]}
      />
    </div>
  )
}