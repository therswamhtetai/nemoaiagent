export interface Message {
    id: string
    content: string
    role: "user" | "assistant"
    created_at: string
    thread_id?: string
}

export interface Thread {
    id: string
    title: string
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    user_id: string
    title: string
    description: string | null
    status: "todo" | "in_progress" | "completed"
    priority: "low" | "medium" | "high" | "urgent"
    due_date: string | null
    created_at: string
    updated_at: string
}

export interface Idea {
    id: string
    user_id: string
    title: string
    description: string | null
    type: "product" | "feature" | "business" | "content" | "design"
    status: "draft" | "in_review" | "approved" | "rejected"
    tags: string[] | null
    created_at: string
    updated_at: string
}

export interface Contact {
    id: string
    user_id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    role: string | null
    notes: string | null
    created_at: string
    updated_at?: string
}

export interface Competitor {
    id: string
    name: string
    platform: string
    url: string
    created_at: string
    updated_at: string
}

export interface SocialStat {
    id: string
    competitor_id: string
    scraped_at: string
    follower_count: number
    viral_score: number
    is_running_ads: boolean
    summary_analysis: string | null
    recent_posts: any | null
    content_strategy: any | null
    top_post: any | null
}

export interface PromptCard {
    id: string
    icon: string
    text: string
    sort_order: number // Assuming this based on usage
}

export interface User {
    id: string
    username: string
    password?: string // strictly for type matching if needed, usually don't store on client
    full_name: string | null
    email: string | null
    language_code: string | null
    created_at?: string
}
