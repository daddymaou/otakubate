// ============================================
// OTAKU MODULE - MAIN EXPORTS
// ============================================

// Pages
export { default as OtakuHub } from './pages/OtakuHub'
export { default as ClubFeed } from './pages/ClubFeed'
export { default as DiscussionDetail } from './pages/DiscussionDetail'

// Components
export { default as DiscussionCard } from './components/DiscussionCard'
export { default as CreateDiscussion } from './components/CreateDiscussion'
export { default as ShareModal } from './components/ShareModal'
export { default as ClubSettings } from './components/ClubSettings'
export { default as MembersList } from './components/MembersList'

// Hooks
export { useClubs, useClub } from './hooks/useClubs'
export { useDiscussions, useDiscussion } from './hooks/useDiscussions'

// API
export * from './api/otakuApi'

// Types
export type { Club, Discussion, PaginatedResponse } from './api/otakuApi'