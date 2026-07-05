interface Props {
  size?: number;
  color?: 'accent' | 'white' | 'dark';
  thickness?: 'thin' | 'normal' | 'thick';
}

export default function Spinner({ 
  size = 24, 
  color = 'accent',
  thickness = 'normal' 
}: Props) {
  const colorMap = {
    accent: { border: 'rgba(230, 57, 70, 0.2)', top: '#E63946' },
    white: { border: 'rgba(255, 255, 255, 0.2)', top: '#FFFFFF' },
    dark: { border: 'rgba(26, 26, 46, 0.2)', top: '#1A1A2E' }
  }

  const thicknessMap = {
    thin: 1.5,
    normal: 2.5,
    thick: 3.5
  }

  // FIX: Add fallback to 'accent' if color is undefined or invalid
  const safeColor = color && color in colorMap ? color : 'accent';
  const colors = colorMap[safeColor];
  const borderWidth = thicknessMap[thickness] || 2.5;

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-animation {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
      
      <div 
        className="spinner-animation"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${borderWidth}px solid ${colors.border}`,
          borderTopColor: colors.top,
          boxShadow: safeColor === 'accent' ? '0 0 8px rgba(230, 57, 70, 0.2)' : 'none',
          transition: 'all 0.2s ease'
        }}
      />
    </>
  )
}