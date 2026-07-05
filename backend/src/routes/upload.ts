import { Router } from 'express'
import { protect, AuthRequest } from '../middleware/auth'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const router = Router()

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('☁️ Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME)

// Configure multer
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.') as any, false)
    }
  }
})

router.post('/image', protect, upload.single('image'), async (req: AuthRequest, res: any) => {
  try {
    console.log('📸 Upload request received')
    console.log('👤 User ID:', req.user?._id)
    console.log('📁 File:', req.file ? {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file received')
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }

    // Upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `otakubate/${req.user._id}`,
          transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error)
            reject(error)
          } else {
            console.log('✅ Cloudinary upload successful')
            resolve(result)
          }
        }
      )
      stream.end(req.file.buffer)
    })

    console.log('✅ Upload successful, URL:', (result as any).secure_url)
    res.json({ success: true, url: (result as any).secure_url })
  } catch (error: any) {
    console.error('❌ Upload error:', error.message)
    res.status(500).json({ success: false, message: error.message || 'Upload failed' })
  }
})

// Error handler for multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max 10MB.' })
    }
    return res.status(400).json({ success: false, message: error.message })
  }
  next(error)
})

export default router