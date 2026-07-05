import crypto from 'crypto'

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export const generateToken = () => crypto.randomBytes(32).toString('hex')

export const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const getPagination = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  limit: Math.min(limit, 50),
})
