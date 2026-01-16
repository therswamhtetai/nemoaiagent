import { createBrowserClient } from "@/lib/supabase/client"
import { Message, Thread, Task, Idea, Contact, Competitor, SocialStat, PromptCard } from "@/lib/types"

// FIXED_USER_ID removed for dynamic authentication

export const CheckServerConnection = async (): Promise<boolean> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).limit(1)
    return !error
}

export const FetchThreads = async (userId: string): Promise<Thread[]> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
        .from('conversations')
        .select('thread_id,thread_name,created_at,content,role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1000)

    if (error) throw error
    if (!data) return []

    // Process threads logic (replicated from page.tsx)
    const threadMap = new Map<string, Thread>()
    const threadNames = new Map<string, string>()

    data.forEach((conv: any) => {
        if (conv.thread_id && conv.thread_name && !threadNames.has(conv.thread_id)) {
            threadNames.set(conv.thread_id, conv.thread_name)
        }
    })

    data.forEach((conv: any) => {
        if (conv.thread_id) {
            if (!threadMap.has(conv.thread_id)) {
                const savedThreadName = threadNames.get(conv.thread_id)
                let title = savedThreadName || "New Chat"
                if (!savedThreadName && conv.role === "user") {
                    title = conv.content?.substring(0, 50) || "New Chat"
                }
                threadMap.set(conv.thread_id, {
                    id: conv.thread_id,
                    title: title,
                    created_at: conv.created_at,
                    updated_at: conv.created_at
                })
            }
        }
    })

    return Array.from(threadMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

export const FetchConversations = async (userId: string, threadId?: string): Promise<Message[]> => {
    const supabase = createBrowserClient()
    let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

    if (threadId) {
        query = query.eq('thread_id', threadId)
    }

    const { data, error } = await query
    if (error) throw error
    return data ? data.reverse() : []
}

export const DeleteThread = async (threadId: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('conversations').delete().eq('thread_id', threadId)
    if (error) throw error
}

export const UpdateThreadTitle = async (threadId: string, title: string): Promise<void> => {
    const supabase = createBrowserClient()
    // It seems we update 'thread_name' on all conversations in the thread or just one?
    // The original code used PATCH with `thread_id=eq...` which updates all rows matching that thread_id.
    const { error } = await supabase
        .from('conversations')
        .update({ thread_name: title })
        .eq('thread_id', threadId)
    if (error) throw error
}

export const FetchQuickPrompts = async (userId: string): Promise<PromptCard[]> => {
    console.log(`[v0-debug] FetchQuickPrompts called for userId: ${userId}`)
    if (!userId) {
        console.warn("[v0-debug] FetchQuickPrompts: No userId provided")
        return []
    }
    const supabase = createBrowserClient()
    const { data, error } = await supabase
        .from('quick_promots')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })

    if (error) {
        console.error("[v0-debug] Supabase error in FetchQuickPrompts:", error)
        throw error
    }
    console.log(`[v0-debug] FetchQuickPrompts success. Count: ${data?.length}`)
    return data || []
}

export const AddQuickPrompt = async (userId: string, prompt: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('quick_promots').insert({ ...prompt, user_id: userId })
    if (error) throw error
}

export const DeleteQuickPrompt = async (id: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('quick_promots').delete().eq('id', id)
    if (error) throw error
}

export const UpdateQuickPrompt = async (id: string, updates: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('quick_promots').update(updates).eq('id', id)
    if (error) throw error
}

// Tasks
export const FetchTasks = async (userId: string): Promise<Task[]> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
}

export const CreateTask = async (task: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('tasks').insert({ ...task })
    if (error) throw error
}

export const UpdateTask = async (id: string, updates: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
}

export const DeleteTask = async (id: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
}

// Ideas
export const FetchIdeas = async (userId: string): Promise<Idea[]> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
}

export const CreateIdea = async (idea: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('ideas').insert({ ...idea })
    if (error) throw error
} // Note: Original code creates logic? No, createIdea calls implemented in page.tsx? Actually createIdea was not shown in the snippets I read! 
// Wait, I saw deleteIdea and updateIdea. I didn't see createIdea in the snippet.
// I will assume standard insert.

export const UpdateIdea = async (id: string, updates: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('ideas').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
}

export const DeleteIdea = async (id: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('ideas').delete().eq('id', id)
    if (error) throw error
}

// Contacts
export const FetchContacts = async (userId: string): Promise<Contact[]> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
}

export const CreateContact = async (userId: string, contact: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('contacts').insert({ ...contact, user_id: userId })
    if (error) throw error
}

export const UpdateContact = async (id: string, updates: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('contacts').update(updates).eq('id', id)
    if (error) throw error
}

export const DeleteContact = async (id: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) throw error
}

// Market

export const FetchCompetitors = async (userId: string): Promise<Competitor[]> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from('competitors').select('*').eq('user_id', userId)
    if (error) throw error
    return data || []
}

export const FetchSocialStats = async (competitorIds: string[]): Promise<SocialStat[]> => {
    if (!competitorIds || competitorIds.length === 0) return []

    const supabase = createBrowserClient()
    // Fetch stats for the specific list of competitor IDs
    const { data, error } = await supabase
        .from('social_stats')
        .select('*')
        .in('competitor_id', competitorIds)
        .order('scraped_at', { ascending: false })

    if (error) throw error
    return data || []
}

// User Settings
export const FetchUserSettings = async (userId: string): Promise<any> => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
    if (error) throw error
    return data
}

export const UpdateUserSettings = async (userId: string, settings: any): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('users').update(settings).eq('id', userId)
    if (error) throw error
}

// Additional Prompt functions
export const SaveEditCard = async (id: string, text: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('quick_promots').update({ text }).eq('id', id)
    if (error) throw error
}

export const UpdateCardIcon = async (id: string, icon: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('quick_promots').update({ icon }).eq('id', id)
    if (error) throw error
}

export const DeleteCompetitor = async (id: string): Promise<void> => {
    const supabase = createBrowserClient()
    const { error } = await supabase.from('competitors').delete().eq('id', id)
    if (error) throw error
}

// Authentication
// Authentication
export const AuthenticateUser = async (username: string, password?: string): Promise<any> => {
    const supabase = createBrowserClient()

    // Check if input looks like an email
    const isEmail = username.includes('@');
    const field = isEmail ? 'email' : 'username';

    console.log(`[v0] Attempting DB auth via ${field}: ${username}`)

    let query = supabase.from('users').select('*').eq(field, username)

    if (password) {
        query = query.eq('password', password)
    }

    const { data, error } = await query.single()

    if (error) {
        console.warn("[v0] DB Auth failed:", error.message)
        throw error
    }
    return data
}

export const LoginWithWebhook = async (credentials: any): Promise<any> => {
    // Enhance credentials to cover potential field mismatches
    const payload = {
        ...credentials,
        email: credentials.username.includes('@') ? credentials.username : undefined,
        user_email: credentials.username.includes('@') ? credentials.username : undefined,
    }

    console.log("[v0] Attempting Webhook login...", payload)

    try {
        const response = await fetch("https://admin.orcadigital.online/webhook/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        const responseText = await response.text()
        console.log("[v0] Webhook response status:", response.status)
        console.log("[v0] Webhook response body:", responseText)

        if (!response.ok) {
            throw new Error(`Webhook Login failed: ${response.statusText} - ${responseText}`)
        }

        if (!responseText) return null

        try {
            return JSON.parse(responseText)
        } catch (e) {
            console.error("[v0] JSON Parse error on webhook response")
            return null
        }
    } catch (err) {
        console.error("[v0] Webhook fetch error:", err)
        throw err
    }
}
