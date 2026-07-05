import { Router } from 'express'
import clubRoutes from './clubRoutes'
import discussionRoutes from './discussionRoutes'

const router = Router()

router.use('/clubs', clubRoutes)
router.use('/discussions', discussionRoutes)

export default router