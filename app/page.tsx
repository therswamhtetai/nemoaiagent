"use client"

import type React from "react"
import type { PromptCard } from "@/lib/types"
import * as API from "@/lib/services/api"

import { useState, useRef, useEffect, useTransition } from "react"
import {
  Search,
  Sparkles,
  Calendar,
  Plus,
  Bell,
  Settings,
  MoreVertical,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Home,
  CheckSquare,
  Lightbulb,
  X,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  Mic,
  Send,
  Image as ImageIcon,
  Camera,
  Upload,
  User,
  UserCircle,
  LogOut,
  Edit2,
  Trash2,
  FileText,
  Copy,
  Users,
  Briefcase,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Video,
  Code,
  Music,
  Zap,
  Star,
  Heart,
  BookOpen,
  Target,
  Award,
  Gift,
  Mail,
  Phone,
  Globe,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from "lucide-react"

import RichTextEditor from "@/components/RichTextEditor"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

const modules = [
  { id: "home", icon: Home, label: "Home" },
  { id: "tasks", icon: Briefcase, label: "Tasks" },
  { id: "ideas", icon: Lightbulb, label: "Ideas" }, // Added Ideas module
  { id: "market", icon: TrendingUp, label: "Market Intelligence" },
  { id: "crm", icon: Users, label: "CRM" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
]

const availableIcons = [
  { name: "UserCircle", icon: UserCircle },
  { name: "Video", icon: Video },
  { name: "BookOpen", icon: BookOpen },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Briefcase", icon: Briefcase },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Zap", icon: Zap },
  { name: "Code", icon: Code },
  { name: "Music", icon: Music },
  { name: "Image", icon: ImageIcon },
  { name: "FileText", icon: FileText },
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "Globe", icon: Globe },
  { name: "Target", icon: Target },
  { name: "Award", icon: Award },
  { name: "Gift", icon: Gift },
  { name: "MessageSquare", icon: MessageSquare },
  { name: "Sparkles", icon: Sparkles },
]

import { Message, Thread, Task, Idea, Contact, Competitor, SocialStat } from "@/lib/types"

const loadingStates = [
  "Analyzing your request...",
  "Searching knowledge base...",
  "Formulating response...",
  "Thinking deeply...",
  "Reviewing context...",
  "Almost there...",
]

// FIXED_USER_ID removed for dynamic auth
const LoginScreen = ({ onLogin }: { onLogin: (userId: string) => void }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let loggedInUserId = null

      // Authenticate with DB first
      try {
        const user = await API.AuthenticateUser(username, password)
        if (user && user.id) {
          loggedInUserId = user.id
        }
      } catch (dbErr) {
        console.error("[v0] DB Login info:", dbErr)
      }

      // Check webhook if DB fails
      if (!loggedInUserId) {
        try {
          const webhookData = await API.LoginWithWebhook({ username, password })
          if (webhookData && (webhookData.id || webhookData.user_id)) {
            loggedInUserId = webhookData.id || webhookData.user_id
          }
        } catch (webhookErr) {
          console.error("[v0] Webhook Login info:", webhookErr)
        }
      }

      // Fallback for admin/dev access if everything else fails
      if (!loggedInUserId && username === "admin") {
        console.log("[v0] Using fallback admin login")
        loggedInUserId = "admin-user-id"
      }

      if (loggedInUserId) {
        if (rememberMe) {
          localStorage.setItem("nemo_user_id", loggedInUserId)
        }
        onLogin(loggedInUserId)
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4 font-sans">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-4">Welcome Back</h2>
          <p className="text-white/40 text-base font-light">Sign in to your AI Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/30 font-medium ml-1">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-white/10 focus:border-white/20 focus:ring-0 h-12 rounded-lg transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/30 font-medium ml-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-white/10 focus:border-white/20 focus:ring-0 h-12 rounded-lg transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center space-x-2 ml-1">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/60"
            >
              Remember me
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-lg font-medium transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}

// Sound Effects
// Sound Effects
const playSound = (type: "reply" | "orb_open" | "orb_close" | "sent" | "received") => {
  const sounds = {
    reply: "/sounds/received.m4a", // Use received for reply default
    orb_open: "/sounds/orb_open.mp3",
    orb_close: "/sounds/orb_open.mp3",
    sent: "/sounds/sent.m4a",
    received: "/sounds/received.m4a",
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5; // Soft sound
  audio.play().catch(e => console.log("Audio play failed (user interaction needed likely):", e));
};

export default function NemoAIDashboard() {
  const router = useRouter()
  const [useFallbackMode, setUseFallbackMode] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [supabase] = useState(() => {
    try {
      const client = createBrowserClient()
      console.log("[v0] Supabase client created successfully")
      return client
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      setUseFallbackMode(true)
      return null
    }
  })

  // Check for remembered user on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("nemo_user_id")
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("nemo_user_id")
    setUserId(null)
    setShowSettingsModal(false)
    window.location.reload() // Reload to clear any other state/cache
  }

  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [activeModule, setActiveModule] = useState<string>("home")
  const [isPending, startTransition] = useTransition()
  const [loadingModule, setLoadingModule] = useState<string | null>(null)
  const moduleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [promptCards, setPromptCards] = useState<PromptCard[]>([])
  const [isEditingPrompts, setIsEditingPrompts] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconPickerCardId, setIconPickerCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isServerOnline, setIsServerOnline] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editingThreadTitle, setEditingThreadTitle] = useState("")
  const [loadingStateIndex, setLoadingStateIndex] = useState(0)
  const [isPushToTalk, setIsPushToTalk] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  // Fix: Declare setWeather state variable
  const [weather, setWeather] = useState({ temp: "", condition: "" })
  const [isOrbActive, setIsOrbActive] = useState(false)

  // CHANGE: Set calendar view default to "week" instead of "month"
  const [calendarView, setCalendarView] = useState<"month" | "week">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  const [showCalendarTaskModal, setShowCalendarTaskModal] = useState(false)
  const [selectedCalendarTask, setSelectedCalendarTask] = useState<Task | null>(null)
  const [taskMenuOpen, setTaskMenuOpen] = useState(false) // Renamed from taskMenuOpenId for clarity
  const [activeTaskPopup, setActiveTaskPopup] = useState<"pending" | "overdue" | "completed" | "urgent" | "today" | "archived" | null>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CHANGE: Add refs for MediaRecorder and audio context
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [isProcessing, setIsProcessing] = useState(false)

  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "archived">("all")
  const [taskMenuOpenId, setTaskMenuOpenId] = useState<string | null>(null)
  const [slidingTaskId, setSlidingTaskId] = useState<string | null>(null)
  const [slideOffset, setSlideOffset] = useState(0)

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null)
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false)
  const [viewingIdeaId, setViewingIdeaId] = useState<string | null>(null)
  const [viewingIdea, setViewingIdea] = useState<Partial<Idea> | null>(null)

  // CRM State management at top of component
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactSearchQuery, setContactSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContactId, setEditingContactId] = useState<string | null>(null) // Added state for editing contact

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    notes: "",
  })

  // Market Intelligence State management
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [socialStats, setSocialStats] = useState<SocialStat[]>([])
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [showCompetitorModal, setShowCompetitorModal] = useState(false)
  const [loadingMarketData, setLoadingMarketData] = useState(false)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [userSettings, setUserSettings] = useState({
    username: "",
    full_name: "",
    email: "",
    language_code: "en",
  })
  const [settingsLoading, setSettingsLoading] = useState(false)

  const [settingsSaved, setSettingsSaved] = useState(false)
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  const [ideaFormData, setIdeaFormData] = useState({
    title: "",
    description: "",
    type: "product" as Idea["type"],
    status: "draft" as Idea["status"],
    tags: "",
  })

  // State for the animated orb
  const [orbAnimating, setOrbAnimating] = useState(false)

  // State for mobile thread menu
  const [activeThreadMenuId, setActiveThreadMenuId] = useState<string | null>(null)

  const [currentGreeting, setCurrentGreeting] = useState("")
  const [greetingTimestamp, setGreetingTimestamp] = useState(0)

  // Helper to render message content with markdown-like formatting
  const renderMessageContent = (content: string) => {
    // Handle Headers (###, ##, ####)
    let processed = content
      .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold mt-2 mb-1 text-white/90">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-3 mb-1 text-white">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2 text-white border-b border-white/10 pb-1">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold

    return <div dangerouslySetInnerHTML={{ __html: processed }} className="whitespace-pre-wrap font-sans" />
  }
  const getTimeBasedGreeting = () => {
    return currentGreeting || "Good day!"
  }

  // Initialize greeting on mount to avoid hydration mismatch
  useEffect(() => {
    const generateGreeting = () => {
      const now = Date.now()
      const threeHours = 3 * 60 * 60 * 1000

      // Always regenerate if the name changes or on initial load
      // The 3-hour check prevented updates when the name loaded asynchronously
      // if (!currentGreeting || now - greetingTimestamp > threeHours) {
      const hour = new Date().getHours()
      // Don't generate greeting if we don't have a name yet and are still loading settings
      // This prevents the "Boss" flash
      if (!userSettings.full_name && settingsLoading) return

      const userName = userSettings.full_name || "Boss"

      const greetings = {
        morning: [
          `Good morning, ${userName}!`,
          `Rise and shine, ${userName}!`,
          `Morning, ${userName}!`,
          `Let's go, ${userName}!`,
        ],
        afternoon: [
          `Good afternoon, ${userName}!`,
          `Keep it up, ${userName}!`,
          `Hey ${userName}!`,
          `Let's keep going, ${userName}!`,
        ],
        evening: [
          `Good evening, ${userName}!`,
          `Winding down, ${userName}?`,
          `Hey ${userName}!`,
          `Almost there, ${userName}!`,
        ],
        night: [
          `Night owl, ${userName}?`,
          `Still here, ${userName}?`,
          `Late night, ${userName}!`,
          `Burning the candle, ${userName}?`,
        ],
      }

      let period = "afternoon"
      if (hour >= 5 && hour < 12) period = "morning"
      else if (hour >= 12 && hour < 17) period = "afternoon"
      else if (hour >= 17 && hour < 21) period = "evening"
      else period = "night"

      const periodGreetings = greetings[period as keyof typeof greetings]
      const newGreeting = periodGreetings[Math.floor(Math.random() * periodGreetings.length)]

      setCurrentGreeting(newGreeting)
      setGreetingTimestamp(now)
      // }
    }

    generateGreeting()
  }, [userSettings.full_name]) // Dependencies

  useEffect(() => {
    const updateTimeAndWeather = () => {
      // Update weather (in real app, this would be an API call)
      const temps = ["32°C", "31°C", "33°C", "30°C"]
      const randomTemp = temps[Math.floor(Math.random() * temps.length)]
      setWeather({ temp: randomTemp, condition: "Sunny" })
    }

    // Update immediately
    updateTimeAndWeather()

    // Update every minute
    const interval = setInterval(updateTimeAndWeather, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"
      const displayHours = hours % 12 || 12
      const displayMinutes = minutes.toString().padStart(2, "0")
      setCurrentTime(`${displayHours}:${displayMinutes} ${ampm}`)
    }

    // Update immediately
    updateTime()

    // Update every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setLoadingStateIndex((prev) => (prev + 1) % loadingStates.length)
      }, 3000) // Slower transition (3s)
    }
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    if (activeModule !== "home") {
      setShowQuickPrompts(false)
    } else if (messages.length === 0) {
      setShowQuickPrompts(true)
    }
  }, [activeModule, messages.length])

  // CHANGE: Remove font size localStorage loading
  // Remove: useEffect(() => {
  //   const savedFontSize = localStorage.getItem("fontSizeScale") as "small" | "medium" | "large" | null
  //   if (savedFontSize) {
  //     setFontSizeScale(savedFontSize)
  //     document.documentElement.setAttribute("data-font-size", savedFontSize)
  //   }
  // }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlThreadId = params.get("thread_id")

    if (!urlThreadId) {
      const newThreadId = crypto.randomUUID()
      setCurrentThreadId(newThreadId)
      window.history.pushState({}, "", `/?thread_id=${newThreadId}`)
      console.log("[v0] Auto-created thread on home:", newThreadId)
    } else {
      console.log("[v0] Thread ID from URL:", urlThreadId)
      setCurrentThreadId(urlThreadId)
    }

    const defaultPrompts = [
      { id: "1", icon: "UserCircle", text: "Any advice for me?", sort_order: 1 },
      { id: "2", icon: "Video", text: "Some youtube video idea", sort_order: 2 },
      { id: "3", icon: "BookOpen", text: "Life lessons from kratos", sort_order: 3 },
    ]
    setPromptCards(defaultPrompts)
  }, [])

  useEffect(() => {
    if (userId && supabase && !useFallbackMode) {
      loadThreads() // Load threads list
      loadQuickPrompts()
      checkServerConnection()
      loadContacts() // Load contacts when component mounts
      loadUserSettings() // Load user settings on initial mount
      loadTasks() // Load tasks immediately to show counts in topbar
      loadIdeas() // Load ideas immediately
      loadMarketData() // Load market data immediately
    } else if (!supabase || useFallbackMode) {
      console.log("[v0] Running in fallback mode without database")
      setIsServerOnline(false)
      setUseFallbackMode(true)
    }
  }, [userId, supabase, useFallbackMode])

  useEffect(() => {
    if (!showNewIdeaForm) {
      setIdeaFormData({
        title: "",
        description: "",
        type: "product",
        status: "draft",
        tags: "",
      })
    }
  }, [showNewIdeaForm])

  useEffect(() => {
    if (showContactModal && selectedContact) {
      setFormData({
        name: selectedContact.name,
        email: selectedContact.email,
        phone: selectedContact.phone || "",
        company: selectedContact.company || "",
        role: selectedContact.role || "",
        notes: selectedContact.notes || "",
      })
    } else if (showContactModal) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        notes: "",
      })
    }
  }, [showContactModal, selectedContact])

  useEffect(() => {
    if (currentThreadId && supabase && !useFallbackMode) {
      loadConversations(currentThreadId)
    } else if (!currentThreadId && supabase && !useFallbackMode) {
      // If no thread is selected, clear messages and show quick prompts
      setMessages([])
      setShowQuickPrompts(true)
    }
  }, [currentThreadId])

  useEffect(() => {
    // Instant scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }, [messages])

  useEffect(() => {
    if (activeModule === "crm") {
      loadContacts()
    }
  }, [activeModule])

  // Load Market Intelligence data
  useEffect(() => {
    if (activeModule === "market") {
      loadMarketData()
    }
  }, [activeModule])

  // Load Calendar data
  useEffect(() => {
    if (activeModule === "calendar") {
      loadTasks() // Calendar relies on tasks data
    }
  }, [activeModule])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (moduleClickTimeoutRef.current) {
        clearTimeout(moduleClickTimeoutRef.current)
      }
    }
  }, [])

  const handleModuleClick = (moduleId: string) => {
    // Prevent rapid clicks and interruptions during loading
    if (isPending || loadingModule) return

    // Clear any existing timeout
    if (moduleClickTimeoutRef.current) {
      clearTimeout(moduleClickTimeoutRef.current)
    }

    // Set loading state immediately for UI feedback
    setLoadingModule(moduleId)

    // Use transition to prevent UI blocking
    startTransition(() => {
      setActiveModule(moduleId)
      setIsSidebarOpen(false)

      if (moduleId === "home") {
        setMessages([])
        setShowQuickPrompts(true)
        const newThreadId = crypto.randomUUID()
        setCurrentThreadId(newThreadId)
        window.history.pushState({}, "", `/?thread_id=${newThreadId}`)
        console.log("[v0] Reset to home, new thread:", newThreadId)
        setLoadingModule(null)
      } else {
        // Delay data loading slightly to allow UI to update first
        moduleClickTimeoutRef.current = setTimeout(async () => {
          try {
            if (moduleId === "tasks") {
              await loadTasks()
            } else if (moduleId === "ideas") {
              await loadIdeas()
            } else if (moduleId === "crm") {
              await loadContacts()
            } else if (moduleId === "calendar") {
              await loadTasks()
            }
          } catch (error) {
            console.error("[v0] Error loading module data:", error)
          } finally {
            setLoadingModule(null)
          }
        }, 50)
      }
    })
  }

  const loadThreads = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const threadsArray = await API.FetchThreads(userId)
      console.log("[v0] Threads loaded:", threadsArray.length)
      setThreads(threadsArray)
      setIsServerOnline(true)
    } catch (err) {
      console.error("[v0] Exception loading threads:", err)
      setIsServerOnline(false)
    }
  }

  const loadConversations = async (threadId?: string) => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const reversedData = await API.FetchConversations(userId, threadId)
      console.log("[v0] Conversations loaded:", reversedData?.length || 0, "for thread:", threadId || "all")

      if (reversedData && reversedData.length > 0) {
        setMessages(reversedData)
        setShowQuickPrompts(false)
      } else {
        console.log("[v0] Database returned empty, keeping current messages")
      }
      setIsServerOnline(true)
    } catch (err) {
      console.error("[v0] Exception loading conversations:", err)
      setIsServerOnline(false)
    }
  }

  const loadQuickPrompts = async () => {
    console.log(`[v0-debug] loadQuickPrompts called. supabase: ${!!supabase}, useFallbackMode: ${useFallbackMode}, userId: ${userId}`)
    if (!supabase || useFallbackMode || !userId) {
      console.log("[v0-debug] loadQuickPrompts: Early return (missing supabase, fallback mode, or no userId)")
      return
    }

    try {
      const data = await API.FetchQuickPrompts(userId)
      if (data && data.length > 0) {
        console.log("[v0] Quick prompts loaded:", data.length)
        setPromptCards(data)
        setIsServerOnline(true)
      } else {
        console.log("[v0-debug] Quick prompts loaded but empty")
      }
    } catch (err) {
      console.error("[v0] Exception loading quick prompts:", err)
    }
  }

  const checkServerConnection = async () => {
    if (!supabase || useFallbackMode) {
      setIsServerOnline(false)
      return
    }

    try {
      console.log("[v0] Checking server connection...")
      const online = await API.CheckServerConnection()
      console.log("[v0] Server online:", online)
      setIsServerOnline(online)
      if (!online) {
        setUseFallbackMode(true)
      }
    } catch (err) {
      console.error("[v0] Server connection check failed:", err)
      setIsServerOnline(false)
      setUseFallbackMode(true)
    }
  }

  const createNewThread = async () => {
    const newThreadId = crypto.randomUUID()
    const newThread: Thread = {
      id: newThreadId,
      title: "New Chat",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setThreads((prev) => [newThread, ...prev])
    setCurrentThreadId(newThreadId)
    setMessages([])
    setShowQuickPrompts(true)

    window.history.pushState({}, "", `/?thread_id=${newThreadId}`)

    console.log("[v0] New thread created:", newThreadId)
  }

  const deleteThread = async (threadId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this thread? This action cannot be undone.")) return

    // Store state before deletion for rollback
    const previousThreads = [...threads]
    const previousCurrentThreadId = currentThreadId
    const previousMessages = [...messages]

    // OPTIMISTIC UPDATE:
    // 1. Remove from list
    setThreads((prev) => prev.filter((t) => t.id !== threadId))

    // 2. Handle active thread deletion
    if (currentThreadId === threadId) {
      setCurrentThreadId(null)
      setMessages([])
      window.history.pushState({}, "", `/`)

      // Force a short delay before creating new thread to allow UI to settle? 
      // Actually, creating it immediately is fine.
      createNewThread()
    }

    if (!supabase || useFallbackMode) return

    try {
      await API.DeleteThread(threadId)
      console.log("[v0] Thread deleted:", threadId)
    } catch (err) {
      console.error("[v0] Error deleting thread:", err)

      // ROLLBACK ON ERROR
      alert("Failed to delete thread. Restoring...")
      setThreads(previousThreads)
      if (previousCurrentThreadId === threadId) {
        setCurrentThreadId(previousCurrentThreadId)
        setMessages(previousMessages)
        window.history.pushState({}, "", `/?thread_id=${previousCurrentThreadId}`)
      }
    }
  }

  const updateThreadTitle = async (threadId: string, newTitle: string) => {
    if (!newTitle.trim()) return

    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, title: newTitle.trim() } : t)))
    setEditingThreadId(null)
    setEditingThreadTitle("")

    if (!useFallbackMode && supabase) {
      try {
        await API.UpdateThreadTitle(threadId, newTitle.trim())
        console.log("[v0] Thread title saved to database:", threadId, newTitle)
      } catch (err) {
        console.error("[v0] Error saving thread title:", err)
      }
    }

    console.log("[v0] Thread title updated:", threadId, newTitle)
  }

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = message.trim()
    setMessage("")
    setLoading(true)
    setLoadingStateIndex(0)

    console.log("[v0] Sending message:", userMessage)
    playSound("sent")
    setShowQuickPrompts(false)

    let threadId = currentThreadId
    if (!threadId) {
      threadId = crypto.randomUUID()
      setCurrentThreadId(threadId)
      window.history.pushState({}, "", `/?thread_id=${threadId}`)
      console.log("[v0] Created new thread_id:", threadId)
    }

    const tempUserMsgId = crypto.randomUUID()
    const tempUserMsg: Message = {
      id: tempUserMsgId,
      content: userMessage,
      role: "user",
      created_at: new Date().toISOString(),
      thread_id: threadId,
    }
    setMessages((prev) => [...prev, tempUserMsg])

    const existingThread = threads.find((t) => t.id === threadId)
    if (!existingThread) {
      const newThread: Thread = {
        id: threadId,
        title: userMessage.substring(0, 50),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setThreads((prev) => [newThread, ...prev])
    }

    try {
      console.log("[v0] Calling webhook with thread_id:", threadId)
      const webhookResponse = await fetch("https://admin.orcadigital.online/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
          userId: userId, // CamelCase alias
          thread_id: threadId,
          threadId: threadId, // CamelCase alias
          sessionId: threadId, // Critical for N8N Memory isolation
          chatId: threadId, // Common alias
          name: userSettings.full_name || "Boss",
        }),
      })

      console.log("[v0] Webhook status:", webhookResponse.status)

      let assistantContent = "I received your message."

      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text()
        console.log("[v0] Webhook raw response:", responseText)

        if (responseText && responseText.trim()) {
          const contentType = webhookResponse.headers.get("content-type")
          if (contentType?.includes("application/json")) {
            try {
              const jsonData = JSON.parse(responseText)
              assistantContent = jsonData.reply || jsonData.message || jsonData.response || responseText
            } catch (e) {
              assistantContent = responseText
            }
          } else {
            assistantContent = responseText
          }
        }
      }

      const tempAssistantMsg: Message = {
        id: crypto.randomUUID(),
        content: assistantContent,
        role: "assistant",
        created_at: new Date().toISOString(),
        thread_id: threadId,
      }
      setMessages((prev) => [...prev, tempAssistantMsg])
      playSound("received")

      setTimeout(() => {
        loadConversations(threadId)
        loadThreads()
      }, 1000) // Small delay to allow backend to process
    } catch (error) {
      console.error("[v0] Webhook error:", error)
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        created_at: new Date().toISOString(),
        thread_id: threadId,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePromptCardClick = (text: string) => {
    setMessage(text)
    inputRef.current?.focus()
  }

  const addPromptCard = async () => {
    const newCard: PromptCard = {
      id: crypto.randomUUID(),
      icon: "Sparkles",
      text: "New prompt",
      sort_order: promptCards.length,
    }

    setPromptCards((prev) => [...prev, newCard])
    setEditingCardId(newCard.id)
    setEditText("New prompt")

    if (!supabase || useFallbackMode) return

    try {
      if (userId) {
        await API.AddQuickPrompt(userId, { ...newCard, user_id: userId })
        await loadQuickPrompts()
      }
    } catch (err) {
      console.error("[v0] Exception adding prompt card:", err)
    }
  }

  const removePromptCard = async (id: string) => {
    setPromptCards((prev) => prev.filter((card) => card.id !== id))

    if (!supabase || useFallbackMode) return

    try {
      await API.DeleteQuickPrompt(id)
      await loadQuickPrompts()
    } catch (err) {
      console.error("[v0] Exception removing prompt card:", err)
    }
  }

  // Renamed startEditingCard to startEditCard and saveCardEdit to saveCardEdit
  const startEditCard = (card: PromptCard) => {
    setEditingCardId(card.id)
    setEditText(card.text)
  }

  const saveEditCard = async (id: string) => {
    if (!editText.trim()) return

    setPromptCards((prev) => prev.map((card) => (card.id === id ? { ...card, text: editText } : card)))
    setEditingCardId(null)
    setEditText("")

    if (!supabase || useFallbackMode) return

    try {
      await API.SaveEditCard(id, editText)
      await loadQuickPrompts()
    } catch (err) {
      console.error("[v0] Exception updating prompt card:", err)
    }
  }

  const updateCardIcon = async (id: string, iconName: string) => {
    setPromptCards((prev) => prev.map((card) => (card.id === id ? { ...card, icon: iconName } : card)))
    setShowIconPicker(false)
    setIconPickerCardId(null)

    if (!supabase || useFallbackMode) return

    try {
      await API.UpdateCardIcon(id, iconName)
    } catch (err) {
      console.error("[v0] Exception updating icon:", err)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconObj = availableIcons.find((i) => i.name === iconName)
    return iconObj ? iconObj.icon : MessageSquare
  }

  // Removed createNewThread function, simplified message handling using conversations table directly
  // const createNewThread = async () => {
  //   setMessages([])
  //   setShowQuickPrompts(true)
  //   // Clear current conversation
  // }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now just show the file name in chat
      setMessage(`[Attached: ${file.name}]`)
      setShowAttachmentMenu(false)
    }
  }

  // CHANGE: Replace handlePushToTalk with new voice recording logic
  const handlePushToTalk = async () => {
    if (!isPushToTalk && isProcessing) {
      console.log("[v0] Already processing a recording, ignoring")
      return
    }

    if (!isPushToTalk) {
      // START RECORDING - First tap
      try {
        setIsProcessing(true)
        playSound("orb_open")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          // Recording stopped - send to n8n
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          await sendAudioToN8n(audioBlob)
          audioChunksRef.current = []
          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop())
          // Reset processing flag after everything is done
          // setIsProcessing(false) // Moved to finally block in sendAudioToN8n
        }

        mediaRecorder.start()
        setIsPushToTalk(true)
        setIsRecording(true)
        setOrbAnimating(true) // Activate orb animation when recording starts
        console.log("[v0] Audio recording started")
      } catch (err) {
        console.error("[v0] Error accessing microphone:", err)
        alert("Unable to access microphone. Please check permissions.")
        setIsProcessing(false)
      }
    } else {
      // STOP RECORDING - Second tap
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        setIsPushToTalk(false)
        setIsRecording(false)
        setIsRecording(false)
        setOrbAnimating(false) // Deactivate orb animation
        playSound("sent") // Play sent sound when recording stops

        // IMMEDIATE UI UPDATE:
        // 1. Ensure we have a thread
        let targetThreadId = currentThreadId
        if (!targetThreadId) {
          targetThreadId = crypto.randomUUID()
          setCurrentThreadId(targetThreadId)

          // Create new thread in UI list immediately
          const newThread: Thread = {
            id: targetThreadId,
            title: "Voice Chat",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setThreads((prev) => [newThread, ...prev])
          window.history.pushState({}, "", `/?thread_id=${targetThreadId}`)
        }

        // 2. Switch UI to chat view immediately
        setShowQuickPrompts(false)
        // Ensure messages list is "active" by having at least empty state or loading
        if (messages.length === 0) {
          // We need to trigger the view to switch from "Orb" to "Messages"
          // The view condition is: activeModule === "home" ? (messages.length === 0 ? <Orb> : <Messages>)
          // So we MUST add a temporary placeholder message OR just rely on loading state if we change the condition.
          // But changing the rendering condition is risky. 
          // Better: Add a dummy "Thinking..." message or relying on loading overlay?
          // The user wants "waiting for reply animation". 
          // The existing code has: `loading && (...)` inside the message list.
          // But if `messages.length === 0`, it shows the Orb!
          // FIX: Add a dummy "Thinking..." message
          setMessages([{
            id: "temp-loading-msg",
            content: "Thinking...",
            role: "assistant",
            created_at: new Date().toISOString(),
            thread_id: targetThreadId || "temp",
          }])
        }

        setLoading(true) // Start loading animation
        console.log("[v0] Audio recording stopped, switching to thread:", targetThreadId)
      }
    }
  }

  // CHANGE: Add sendAudioToN8n function to handle API call and response
  const sendAudioToN8n = async (audioBlob: Blob) => {
    // Capture the thread ID at the start of the function to ensure consistency
    // If currentThreadId is set (which it should be from handlePushToTalk), use it.
    let activeThreadId = currentThreadId

    // Fallback if state hasn't updated yet (though it should have in handlePushToTalk)
    if (!activeThreadId) {
      // This case should ideally not happen if handlePushToTalk does its job, 
      // but for safety let's check URL or generate one.
      const params = new URLSearchParams(window.location.search)
      activeThreadId = params.get("thread_id")
    }

    // Force UI update to show "Thinking" state if not already
    setLoading(true)
    setShowQuickPrompts(false)

    try {
      const formData = new FormData()
      formData.append("data", audioBlob, "audio.webm")
      if (userId) {
        formData.append("user_id", userId)
        formData.append("userId", userId) // CamelCase alias
      }
      if (activeThreadId) {
        formData.append("thread_id", activeThreadId)
        formData.append("threadId", activeThreadId) // CamelCase alias
        formData.append("sessionId", activeThreadId) // Critical for N8N Memory
        formData.append("chatId", activeThreadId) // Common alias
      }

      console.log("[v0] Sending audio to n8n webhook...")
      console.log("[v0] - Audio blob size:", audioBlob.size, "bytes")
      console.log("[v0] - User ID:", userId || "not set")
      console.log("[v0] - Thread ID:", activeThreadId || "not set")

      // Add a placeholder message to force the view to switch from Orb to Chat List
      // only if the chat is currently empty.
      if (messages.length === 0) {
        const placeholderMsg: Message = {
          id: "temp-mic-placeholder",
          content: "🎤 Processing voice command...",
          role: "user",
          created_at: new Date().toISOString(),
          thread_id: activeThreadId || "temp",
        }
        setMessages([placeholderMsg])
      }

      const response = await fetch("https://admin.orcadigital.online/webhook/voice-chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      const responseText = await response.text()

      console.log("[v0] Response content-type:", contentType)
      console.log("[v0] Response text:", responseText.substring(0, 200)) // Log first 200 chars

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from n8n webhook")
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("[v0] Failed to parse JSON. Response was:", responseText)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`)
      }

      console.log("[v0] n8n response:", data)

      // CHANGE: After webhook responds, reload conversations to show updates
      if (activeThreadId) {
        console.log("[v0] Reloading conversations for thread:", activeThreadId)
        await loadConversations(activeThreadId)
        console.log("[v0] Conversations reloaded successfully")
      }

      if (data.audio_base64) {
        playSound("received")
        playAudioResponse(data.audio_base64)
      } else {
        playSound("received")
      }

      console.log("[v0] Voice response received - backend handled conversation updates")
    } catch (err) {
      console.error("[v0] Error sending audio to n8n:", err)
      alert(
        `Failed to process voice chat: ${err instanceof Error ? err.message : "Unknown error"}. Please check the webhook.`,
      )
    } finally {
      // CHANGE: Always hide loading animation when done
      setLoading(false)
      setIsProcessing(false) // Also reset processing flag

      // Cleanup the temp message if it exists
      setMessages(prev => prev.filter(m => m.id !== "temp-mic-placeholder"))
    }
  }

  // CHANGE: Add playAudioResponse function to play base64 audio
  const playAudioResponse = (audioBase64: string) => {
    try {
      const audio = new Audio()
      audio.src = `data:audio/mp3;base64,${audioBase64}`
      audio.play().catch((err) => console.error("[v0] Error playing audio:", err))
      console.log("[v0] Playing audio response")
    } catch (err) {
      console.error("[v0] Error creating audio element:", err)
    }
  }

  const loadTasks = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const data = await API.FetchTasks(userId)
      console.log("[v0] Tasks loaded:", data?.length || 0)
      setTasks(data || [])
    } catch (err) {
      console.error("[v0] Error loading tasks:", err)
      setTasks([])
    }
  }

  const loadIdeas = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const data = await API.FetchIdeas(userId)
      console.log("[v0] Ideas loaded:", data?.length || 0)
      setIdeas(data || [])
    } catch (err) {
      console.error("[v0] Error loading ideas:", err)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await API.UpdateTask(taskId, updates)
      await loadTasks()
      setEditingTaskId(null)
      setEditingTask(null)
      console.log("[v0] Task updated:", taskId)
    } catch (err) {
      console.error("[v0] Error updating task:", err)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return

    try {
      await API.DeleteTask(taskId)
      await loadTasks()
      console.log("[v0] Task deleted:", taskId)
    } catch (err) {
      console.error("[v0] Error deleting task:", err)
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    console.log("[v0-debug] createTask called with:", taskData)
    try {
      if (userId) {
        console.log("[v0-debug] Creating task for userId:", userId)
        const newTask = { ...taskData, user_id: userId }
        // Ensure due_date format is correct if present
        if (newTask.due_date) {
          // Basic validation/conversion could go here if needed
          console.log("[v0-debug] Task due_date:", newTask.due_date)
        }
        await API.CreateTask(newTask)
        await loadTasks()
        setShowNewTaskForm(false)
        console.log("[v0] Task created successfully")
      } else {
        console.error("[v0-debug] Cannot create task: No userId found")
      }
    } catch (err) {
      console.error("[v0] Error creating task raw:", err)
      console.error("[v0] Error creating task JSON:", JSON.stringify(err, null, 2))
    }
  }

  const handleTouchStart = (taskId: string, e: React.TouchEvent) => {
    setSlidingTaskId(taskId)
    setSlideOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!slidingTaskId) return
    const touch = e.touches[0]
    const card = e.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    const offset = touch.clientX - rect.left
    const maxSlide = rect.width * 0.7 // 70% of card width
    setSlideOffset(Math.min(Math.max(0, offset - 50), maxSlide))
  }

  const handleTouchEnd = (taskId: string) => {
    if (slideOffset > 150) {
      // Threshold to complete
      completeTask(taskId)
    }
    setSlidingTaskId(null)
    setSlideOffset(0)
  }

  const markTaskComplete = async (taskId: string) => {
    await updateTask(taskId, { status: "completed" })
  }
  // Added completeTask function for quick task completion
  const completeTask = async (taskId: string) => {
    await updateTask(taskId, { status: "completed" })
  }

  // Added updateTaskStatus function for toggling task completion
  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    await updateTask(taskId, { status })
  }

  const deleteIdea = async (ideaId: string) => {
    if (!confirm("Delete this idea?")) return

    try {
      await API.DeleteIdea(ideaId)
      await loadIdeas()
      console.log("[v0] Idea deleted:", ideaId)
    } catch (err) {
      console.error("[v0] Error deleting idea:", err)
    }
  }

  const copyIdeaToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      alert("Idea copied to clipboard!")
    } catch (err) {
      console.error("[v0] Error copying:", err)
    }
  }

  // Added updateIdea function
  const updateIdea = async (ideaId: string, updates: Partial<Idea>) => {
    try {
      await API.UpdateIdea(ideaId, updates)
      await loadIdeas()
      console.log("[v0] Idea updated:", ideaId)
    } catch (err) {
      console.error("[v0] Error updating idea:", err)
    }
  }

  // CRM Functions
  const loadContacts = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const data = await API.FetchContacts(userId)
      console.log("[v0] Contacts loaded:", Array.isArray(data) ? data.length : 0)
      setContacts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("[v0] Error loading contacts:", err)
      setContacts([])
    }
  }

  const createContact = async (contactData: Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      if (!contactData.name || !contactData.email) {
        console.error("[v0] Name and email are required")
        alert("Name and email are required")
        return
      }

      if (userId) {
        await API.CreateContact(userId, contactData)
        await loadContacts()
        setShowContactModal(false)
        setSelectedContact(null)
        console.log("[v0] Contact created")
        alert("Contact created successfully!")
      }
    } catch (err) {
      console.error("[v0] Error creating contact:", err)
      alert("Error creating contact")
    }
  }

  const updateContact = async (contactId: string, updates: Partial<Contact>) => {
    try {
      await API.UpdateContact(contactId, updates)
      await loadContacts()
      setShowContactModal(false)
      setSelectedContact(null)
      console.log("[v0] Contact updated:", contactId)
    } catch (err) {
      console.error("[v0] Error updating contact:", err)
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!confirm("Delete this contact?")) return

    try {
      await API.DeleteContact(contactId)
      await loadContacts()
      console.log("[v0] Contact deleted:", contactId)
    } catch (err) {
      console.error("[v0] Error deleting contact:", err)
    }
  }

  // Market Intelligence Functions
  const loadMarketData = async () => {
    if (!supabase || useFallbackMode || !userId) {
      setLoadingMarketData(false)
      return
    }

    setLoadingMarketData(true)
    console.log("[v0] Loading market intelligence data...")

    try {
      const competitorsData = await API.FetchCompetitors(userId)
      if (!Array.isArray(competitorsData)) {
        console.error("[v0] Competitors data is not an array:", competitorsData)
        setCompetitors([])
        setSocialStats([])
        setLoadingMarketData(false)
        return
      }

      setCompetitors(competitorsData)

      const competitorIds = competitorsData.map((c: any) => c.id)
      const statsData = await API.FetchSocialStats(competitorIds)
      if (!Array.isArray(statsData)) {
        console.error("[v0] Stats data is not an array:", statsData)
        setSocialStats([])
      } else {
        // Fix column names
        const fixedStats = statsData.map((stat: any) => ({
          ...stat,
          follower_count: stat.follower_count || stat.followers_count || 0, // Handle column name variations
          is_running_ads: stat.is_running_ads === true || stat.is_running_ads === "true",
        }))
        setSocialStats(fixedStats)
      }
      setLoadingMarketData(false)
    } catch (err) {
      console.error("[v0] Exception loading market data:", err)
      setLoadingMarketData(false)
    }
  }



  // Refresh market data via webhook
  const refreshMarketData = async () => {
    try {
      console.log(`[v0-debug] Triggering market data refresh webhook... UserID: ${userId}`)
      if (!userId) {
        console.error("[v0-debug] UserID is missing upon refresh!")
        return
      }
      setLoadingMarketData(true)

      const response = await fetch("https://admin.orcadigital.online/webhook/monitor-competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: "manual_refresh",
          user_id: userId,  // Add explicit user_id for N8N workflow
          link: selectedCompetitor?.url || "" // Send competitor URL
        }),
      })

      if (response.ok) {
        console.log("[v0] Webhook triggered successfully")
        // Wait a bit then reload data - Increased to 5s to allow scraper to finish
        setTimeout(() => loadMarketData(), 5000)
      }
    } catch (error) {
      console.error("[v0] Error triggering webhook:", error)
    } finally {
      setLoadingMarketData(false)
    }
  }

  // CHANGE: Fix getLatestStats to return the LATEST (most recent) stats per competitor instead of just the first match
  const getLatestStats = (competitorId: string) => {
    // Filter all stats for this competitor and sort by scraped_at descending
    const competitorStats = socialStats
      .filter((stat) => stat.competitor_id === competitorId && stat.scraped_at) // Ensure scraped_at exists
      .sort((a, b) => new Date(b.scraped_at || 0).getTime() - new Date(a.scraped_at || 0).getTime())

    // Return the most recent one (first after sorting)
    return competitorStats.length > 0 ? competitorStats[0] : null
  }

  const deleteCompetitor = async (competitorId: string) => {
    if (!supabase || useFallbackMode) return

    if (!confirm("Are you sure you want to delete this competitor?")) {
      return
    }

    try {
      console.log("[v0] Deleting competitor:", competitorId)
      await API.DeleteCompetitor(competitorId)
      console.log("[v0] Competitor deleted successfully")
      // Remove from local state
      setCompetitors(competitors.filter((c) => c.id !== competitorId))
      // Also remove associated stats
      setSocialStats(socialStats.filter((s) => s.competitor_id !== competitorId))
    } catch (error) {
      console.error("[v0] Error deleting competitor:", error)
      alert("Error deleting competitor")
    }
  }

  const remainingTasksCount = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length

  const filteredTasks =
    taskStatusFilter === "all"
      ? tasks.filter((t) => t.status !== "archived")
      : taskStatusFilter === "archived"
        ? tasks.filter((t) => t.status === "archived")
        : tasks.filter((t) => t.status === taskStatusFilter)

  const calculateOverdueTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks.filter((t) => {
      if (!t.due_date || t.status === "completed" || t.status === "archived") return false
      const dueDate = new Date(t.due_date)
      return dueDate < today
    }).length
  }
  const overdueTasks = calculateOverdueTasks()

  const calculateTodayTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter((t) => {
      if (!t.due_date || t.status === "completed" || t.status === "archived") return false
      const dueDate = new Date(t.due_date)
      return dueDate >= today && dueDate < tomorrow
    }).length
  }
  const todayTasksCount = calculateTodayTasks()

  const archivedTasksCount = tasks.filter((t) => t.status === "archived").length

  // Filter contacts for CRM view
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(contactSearchQuery.toLowerCase()) || // Updated to search by company
      contact.role?.toLowerCase().includes(contactSearchQuery.toLowerCase()), // Added search by role
  )

  const loadUserSettings = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      const user = await API.FetchUserSettings(userId)
      if (user) {
        setUserSettings({
          username: user.username || "",
          full_name: user.full_name || "",
          email: user.email || "",
          language_code: user.language_code || "en",
        })
        console.log("[v0] User settings loaded")
      }
    } catch (err) {
      console.error("[v0] Exception loading user settings:", err)
    }
  }

  const updateUserSettings = async () => {
    if (!supabase || useFallbackMode || !userId) return

    try {
      setSettingsLoading(true)
      await API.UpdateUserSettings(userId, { ...userSettings })
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
      console.log("[v0] User settings updated successfully")
    } catch (err) {
      console.error("[v0] Exception updating user settings:", err)
      alert("Error saving settings. Please try again.")
    } finally {
      setSettingsLoading(false)
    }
  }

  const createIdea = async (ideaData: Omit<Idea, "id" | "created_at" | "updated_at">) => {
    try {
      if (userId) {
        await API.CreateIdea({ ...ideaData, user_id: userId })
        console.log("[v0] Idea created successfully")
        await loadIdeas()
        setShowNewIdeaForm(false)
        setIdeaFormData({ title: "", description: "", type: "product", status: "draft", tags: "" })
      }
    } catch (err) {
      console.error("[v0] Error creating idea:", err)
      alert("Error creating idea: " + String(err))
    }
  }

  // CHANGE: Remove font size handling logic
  // Remove: const handleFontSizeChange = (size: "small" | "medium" | "large") => {
  //   setFontSizeScale(size)
  //   document.documentElement.setAttribute("data-font-size", size)
  //   localStorage.setItem("fontSizeScale", size)
  // }

  // Main Render
  if (!userId) {
    return <LoginScreen onLogin={setUserId} />
  }

  return (
    <div className="flex fixed inset-0 w-full overflow-hidden bg-black text-white">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Updated with gradient black and grey glassmorphism */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:translate-x-0 md:relative w-[280px] md:w-56 h-full bg-gradient-to-b from-zinc-900 to-black/90 backdrop-blur-xl border-r border-white/[0.08] transition-transform duration-300 ease-out z-40 flex flex-col custom-scrollbar-dark shadow-2xl md:shadow-none`}
      >
        {/* Logo Area - Updated with white/grey gradient */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden">
              <img src="/icon.png" alt="NemoAI" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white/90">NemoAI</span>
          </div>
          {/* Close button for mobile sidebar */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Updated with white/grey accent on active */}
        <nav className="overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar-dark">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                disabled={isPending || (loadingModule !== null && loadingModule !== module.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${activeModule === module.id
                  ? "bg-white/[0.1] text-white"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  } ${isPending || (loadingModule !== null && loadingModule !== module.id)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
              >
                {loadingModule === module.id ? (
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                ) : (
                  <IconComponent className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{module.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Threads Section - Reduced top padding and margin to move closer to Calendar */}
        <div className="border-t border-white/[0.08] pt-1.5 flex-1 flex flex-col min-h-0 pb-2">
          <div className="px-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <h3 className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Threads</h3>
              {/* Updated thread creation button - removed orange accents */}
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-white/[0.08] text-zinc-600 hover:text-white"
                onClick={createNewThread}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-0.5 pr-1 custom-scrollbar-dark">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group relative rounded-md px-2 py-1.5 cursor-pointer transition-all duration-200 ${currentThreadId === thread.id
                    ? "bg-gradient-to-r from-white/[0.12] to-white/[0.08] shadow-sm"
                    : "hover:bg-white/[0.06]"
                    }`}
                  onClick={() => {
                    setActiveModule("home")
                    setCurrentThreadId(thread.id)
                    window.history.pushState({}, "", `/?thread_id=${thread.id}`)
                    loadConversations(thread.id)
                    setIsSidebarOpen(false)
                  }}
                >
                  {editingThreadId === thread.id ? (
                    <input
                      type="text"
                      value={editingThreadTitle}
                      onChange={(e) => setEditingThreadTitle(e.target.value)}
                      onBlur={() => updateThreadTitle(thread.id, editingThreadTitle)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateThreadTitle(thread.id, editingThreadTitle)
                        } else if (e.key === "Escape") {
                          setEditingThreadId(null)
                          setEditingThreadTitle("")
                        }
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-[12px] text-white focus:outline-none focus:border-white/40"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 text-[13px]">
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-zinc-500 group-hover:text-zinc-400" />
                        <span className="flex-1 truncate text-zinc-300 group-hover:text-white font-light">
                          {thread.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0 relative">
                        {/* 3-dot menu - visible on mobile */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveThreadMenuId(activeThreadMenuId === thread.id ? null : thread.id)
                          }}
                          className="md:hidden p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                        {/* Dropdown menu for mobile */}
                        {activeThreadMenuId === thread.id && (
                          <div className="md:hidden absolute right-0 top-full mt-1 bg-zinc-900 border border-white/20 rounded shadow-lg z-50 min-w-[100px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingThreadId(thread.id)
                                setEditingThreadTitle(thread.title)
                                setActiveThreadMenuId(null)
                              }}
                              className="block w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteThread(thread.id)
                                setActiveThreadMenuId(null)
                              }}
                              className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        {/* Desktop edit/delete buttons - hidden on mobile */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingThreadId(thread.id)
                            setEditingThreadTitle(thread.title)
                          }}
                          className="hidden md:block p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteThread(thread.id)
                          }}
                          className="hidden md:block p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Updated with hamburger menu for mobile and Task Remaining */}
        <div className="h-14 border-b border-white/5 bg-gradient-to-r from-black/20 via-transparent to-black/20 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
          {/* Left: Hamburger menu (mobile/tablet) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="/icon.png" alt="NemoAI" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                NemoAI
              </span>
            </div>
          </div>

          {/* Center: Status info */}
          <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-white/90 font-medium hidden sm:inline">Stable Sync</span>
              <span className="text-white/90 font-medium sm:hidden">Sync</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all hover:bg-blue-500/20">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span className="text-blue-200 font-medium text-xs tracking-wide">
                In Progress: {tasks.filter((t) => t.status === "in_progress").length}
              </span>
            </div>
            <div className="text-white/70 font-mono text-xs md:text-sm">{currentTime}</div>
          </div>

          {/* Right: Settings - Visible on all devices */}
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-white/10 text-white/70 hover:text-white"
              onClick={() => {
                loadUserSettings()
                setShowSettingsModal(true)
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeModule === "home" ? (
            messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
                <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-8">
                  {/* Text above orb - Updated typography */}
                  <div className="text-center space-y-2 animate-fade-in">
                    {/* Increased text sizes throughout for better readability */}
                    <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white">
                      {isPushToTalk ? "I'm Listening..." : getTimeBasedGreeting()}
                    </h2>
                  </div>

                  {/* Orb */}
                  <button
                    onClick={handlePushToTalk}
                    className="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center focus:outline-none transition-transform hover:scale-105"
                    style={{ width: "150px", height: "150px" }}
                    aria-label="Voice assistant"
                  >
                    <div className={`${orbAnimating || isPushToTalk ? "animated-orb-active" : "animated-orb-idle"}`}>
                      <div className="orb-circle-wrapper">
                        <div
                          className={`orb-circle c1 ${orbAnimating || isPushToTalk ? "animate-fast-1" : "animate-idle-1"}`}
                        ></div>
                        <div
                          className={`orb-circle c2 ${orbAnimating || isPushToTalk ? "animate-fast-2" : "animate-idle-2"}`}
                        ></div>
                        <div
                          className={`orb-circle c3 ${orbAnimating || isPushToTalk ? "animate-fast-3" : "animate-idle-3"}`}
                        ></div>
                        <div
                          className={`orb-circle c4 ${orbAnimating || isPushToTalk ? "animate-fast-4" : "animate-idle-4"}`}
                        ></div>
                        <div
                          className={`orb-circle c5 ${orbAnimating || isPushToTalk ? "animate-fast-5" : "animate-idle-5"}`}
                        ></div>
                        <div
                          className={`orb-circle c6 ${orbAnimating || isPushToTalk ? "animate-fast-6" : "animate-idle-6"}`}
                        ></div>
                        <div
                          className={`orb-circle c7 ${orbAnimating || isPushToTalk ? "animate-fast-7" : "animate-idle-7"}`}
                        ></div>
                      </div>
                    </div>
                  </button>

                  <p className="text-sm text-white/50 text-center">
                    {isPushToTalk ? "Tap again to send" : "Tap to speak"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar-dark">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tl-none ${msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30"
                        : "bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-zinc-300 border border-white/[0.08]"
                        } px-3.5 py-2.5 text-xs backdrop-blur-xl `}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tl-none bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] px-4 py-4 backdrop-blur-xl">
                      <div className="space-y-2.5 mb-3">
                        <div className="h-2 w-24 bg-white/20 rounded animate-pulse" />
                        <div className="h-2 w-full max-w-[200px] bg-white/10 rounded animate-pulse" />
                        <div className="h-2 w-full max-w-[160px] bg-white/10 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                        <span className="text-[10px] text-zinc-400 font-medium animate-pulse transition-opacity duration-500 uppercase tracking-wider">
                          {loadingStates[loadingStateIndex]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )
          ) : activeModule === "tasks" ? (
            // Tasks View - Revised layout with improved spacing and typography
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar-dark bg-gradient-to-b from-black/20 to-transparent">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section - Improved typography hierarchy */}
                <div className="space-y-2 mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Task Management</h1>
                  <p className="text-base text-zinc-400">Organize and track your work efficiently</p>
                </div>

                {/* Task Stats - Enhanced cards with better spacing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card
                    className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border-white/[0.12] backdrop-blur-xl hover:from-white/[0.12] hover:to-white/[0.06] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("pending")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70 uppercase tracking-wide">In Progress</p>
                        <p className="text-4xl font-bold text-white">
                          {remainingTasksCount}
                        </p>
                        <p className="text-xs text-white/50 mt-2">Active tasks</p>
                      </div>
                      <div className="p-3 bg-white/[0.08] rounded-lg group-hover:bg-white/[0.12] transition-colors">
                        <Target className="w-6 h-6 text-white/60" />
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 bg-gradient-to-br from-emerald-500/[0.15] to-emerald-500/[0.05] border-emerald-500/[0.2] backdrop-blur-xl hover:from-emerald-500/[0.2] hover:to-emerald-500/[0.1] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("completed")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-emerald-300/80 uppercase tracking-wide">Completed</p>
                        <p className="text-4xl font-bold text-emerald-300">
                          {tasks.filter((t) => t.status === "completed").length}
                        </p>
                        <p className="text-xs text-emerald-300/50 mt-2">Finished tasks</p>
                      </div>
                      <div className="p-3 bg-emerald-500/[0.15] rounded-lg group-hover:bg-emerald-500/[0.25] transition-colors">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="p-6 bg-gradient-to-br from-red-500/[0.15] to-red-500/[0.05] border-red-500/[0.2] backdrop-blur-xl hover:from-red-500/[0.2] hover:to-red-500/[0.1] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("overdue")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-300/80 uppercase tracking-wide">Overdue</p>
                        <p className="text-4xl font-bold text-red-300">
                          {overdueTasks}
                        </p>
                        <p className="text-xs text-red-300/50 mt-2">Past due tasks</p>
                      </div>
                      <div className="p-3 bg-red-500/[0.15] rounded-lg group-hover:bg-red-500/[0.25] transition-colors">
                        <Calendar className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </Card>

                  {/* Urgent Tasks Card */}
                  <Card
                    className="p-6 bg-gradient-to-br from-orange-500/[0.15] to-orange-500/[0.05] border-orange-500/[0.2] backdrop-blur-xl hover:from-orange-500/[0.2] hover:to-orange-500/[0.1] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("urgent")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-orange-300/80 uppercase tracking-wide">Urgent Tasks</p>
                        <p className="text-4xl font-bold text-orange-300">
                          {tasks.filter((t) => t.priority === "urgent" && t.status !== "archived" && t.status !== "completed").length}
                        </p>
                        <p className="text-xs text-orange-300/50 mt-2">High priority items</p>
                      </div>
                      <div className="p-3 bg-orange-500/[0.15] rounded-lg group-hover:bg-orange-500/[0.25] transition-colors">
                        <Zap className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </Card>

                  {/* Today's Tasks Card */}
                  <Card
                    className="p-6 bg-gradient-to-br from-blue-500/[0.15] to-blue-500/[0.05] border-blue-500/[0.2] backdrop-blur-xl hover:from-blue-500/[0.2] hover:to-blue-500/[0.1] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("today")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-300/80 uppercase tracking-wide">Today</p>
                        <p className="text-4xl font-bold text-blue-300">
                          {todayTasksCount}
                        </p>
                        <p className="text-xs text-blue-300/50 mt-2">Due today</p>
                      </div>
                      <div className="p-3 bg-blue-500/[0.15] rounded-lg group-hover:bg-blue-500/[0.25] transition-colors">
                        <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </Card>

                  {/* Archived Tasks Card */}
                  <Card
                    className="p-6 bg-gradient-to-br from-purple-500/[0.15] to-purple-500/[0.05] border-purple-500/[0.2] backdrop-blur-xl hover:from-purple-500/[0.2] hover:to-purple-500/[0.1] transition-all duration-300 group cursor-pointer"
                    onClick={() => setActiveTaskPopup("archived")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-purple-300/80 uppercase tracking-wide">Archived</p>
                        <p className="text-4xl font-bold text-purple-300">
                          {archivedTasksCount}
                        </p>
                        <p className="text-xs text-purple-300/50 mt-2">Hidden from lists</p>
                      </div>
                      <div className="p-3 bg-purple-500/[0.15] rounded-lg group-hover:bg-purple-500/[0.25] transition-colors">
                        <CheckSquare className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Filter and Action Section - Improved visual hierarchy */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 md:p-6 bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-xl border border-white/[0.08]">
                  <div className="flex flex-wrap gap-2">
                    {(["all", "pending", "in_progress", "completed", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setTaskStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${taskStatusFilter === status
                          ? "bg-white text-black shadow-lg shadow-white/10"
                          : "bg-white/[0.05] text-white/70 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                          }`}
                      >
                        {status === "all"
                          ? "All Tasks"
                          : status === "in_progress"
                            ? "In Progress"
                            : status === "pending"
                              ? "Pending"
                              : status === "archived"
                                ? "Archive"
                                : "Completed"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                    className="px-4 py-2 bg-white/[0.12] hover:bg-white/[0.18] border border-white/[0.2] rounded-lg text-white font-medium text-sm transition-all duration-200 flex items-center gap-2 justify-center md:justify-start"
                  >
                    <Plus className="w-4 h-4" />
                    New Task
                  </button>
                </div>

                {/* Task List - Improved card styling and layout */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Your Tasks</h2>

                  {filteredTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="relative p-4 md:p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.03] border-white/[0.12] hover:from-white/[0.12] hover:to-white/[0.06] transition-all duration-300 group"
                    >

                      {editingTaskId === task.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingTask?.title || ""}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="bg-white/[0.1] border-white/[0.2] text-white"
                            placeholder="Task title"
                          />
                          <textarea
                            value={editingTask?.description || ""}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                            placeholder="Description"
                            rows={3}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <select
                              value={editingTask?.status || "pending"}
                              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                            <select
                              value={editingTask?.priority || "medium"}
                              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          <div className="flex gap-3 pt-3">
                            <Button
                              onClick={() => updateTask(task.id, editingTask!)}
                              className="flex-1 bg-white/[0.15] hover:bg-white/[0.2] text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingTaskId(null)
                                setEditingTask(null)
                              }}
                              variant="outline"
                              className="flex-1 border-white/[0.2] text-white/70 hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-xl text-white leading-tight line-clamp-2">{task.title}</h3>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
                                    ${task.priority === "urgent"
                                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                      : task.priority === "high"
                                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                        : task.priority === "medium"
                                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    }`}
                                >
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </span>
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
                                    ${task.status === "completed"
                                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                      : task.status === "in_progress"
                                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        : "bg-white/10 text-white/70 border border-white/20"
                                    }`}
                                >
                                  {task.status === "pending" ? "Pending" : task.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <div className="relative flex items-center gap-2">
                              {task.status !== "completed" && (
                                <button
                                  onClick={() => completeTask(task.id)}
                                  className="p-2.5 hover:bg-white/[0.1] rounded-lg transition-colors group"
                                  title="Mark as complete"
                                >
                                  <Check className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                                </button>
                              )}
                              <button
                                onClick={() => setTaskMenuOpenId(taskMenuOpenId === task.id ? null : task.id)}
                                className="p-2.5 hover:bg-white/[0.1] rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-white/60 group-hover:text-white" />
                              </button>
                              {taskMenuOpenId === task.id && (
                                <div className="absolute right-0 top-12 bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden min-w-[160px] backdrop-blur-xl">
                                  <button
                                    onClick={() => {
                                      setEditingTaskId(task.id)
                                      setEditingTask(task)
                                      setTaskMenuOpenId(null)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white/80"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Task
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateTaskStatus(task.id, "archived")
                                      setTaskMenuOpenId(null)
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                    Archive
                                  </button>
                                  {task.status !== "completed" && (
                                    <button
                                      onClick={() => {
                                        completeTask(task.id)
                                        setTaskMenuOpenId(null)
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Mark Complete
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      deleteTask(task.id)
                                      setTaskMenuOpenId(null)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Task
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <div
                              className="text-sm text-white/60 line-clamp-3 prose prose-invert prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                              dangerouslySetInnerHTML={{ __html: task.description }}
                            />
                          )}
                          {task.due_date && (
                            <p
                              className={`text-xs ${new Date(task.due_date) < new Date() && task.status !== "completed" ? "text-red-400" : "text-white/50"}`}
                            >
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}

                  {filteredTasks.length === 0 && (
                    <Card className="p-12 bg-gradient-to-br from-white/5 to-white/0 border-white/10 backdrop-blur-xl text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <p className="text-white/40">
                        No{" "}
                        {taskStatusFilter !== "all"
                          ? taskStatusFilter === "pending"
                            ? "pending"
                            : taskStatusFilter.replace("_", " ")
                          : ""}{" "}
                        tasks found. All clear!
                      </p>
                    </Card>
                  )}
                </div>

                {/* New Task Form Modal */}
                {showNewTaskForm && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                    <Card className="w-full max-w-lg h-full md:h-auto p-4 md:p-8 bg-gradient-to-br from-zinc-900 to-black border-white/20 backdrop-blur-xl space-y-5 rounded-none md:rounded-xl overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-white">Create New Task</h2>
                        <button onClick={() => setShowNewTaskForm(false)} className="p-2 hover:bg-white/10 rounded-lg">
                          <X className="w-5 h-5 text-white/70" />
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          createTask({
                            user_id: userId || "", // Use dynamic userId
                            title: formData.get("title") as string,
                            description: formData.get("description") as string,
                            status: (formData.get("status") as any) || "pending",
                            priority: (formData.get("priority") as any) || "medium",
                            due_date: (formData.get("due_date") as string) || null,
                          })
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Title *</label>
                          <Input
                            name="title"
                            required
                            className="bg-white/[0.1] border-white/[0.2] text-white placeholder:text-white/40"
                            placeholder="e.g. Design the new landing page"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Description</label>
                          <textarea
                            name="description"
                            className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                            placeholder="Add more details about the task"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-white/70 mb-1 block">Status</label>
                            <select
                              name="status"
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white appearance-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white/70 mb-1 block">Priority</label>
                            <select
                              name="priority"
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white appearance-none"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Due Date</label>
                          <Input
                            name="due_date"
                            type="datetime-local"
                            className="bg-white/[0.1] border-white/[0.2] text-white"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1 bg-white/[0.15] hover:bg-white/[0.2] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowNewTaskForm(false)}
                            variant="outline"
                            className="flex-1 border-white/[0.2] text-white/70 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </div>
                )}

                {/* Edit Task Modal */}
                {editingTask && editingTaskId && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                    <Card className="w-full max-w-lg h-full md:h-auto p-4 md:p-8 bg-gradient-to-br from-zinc-900 to-black border-white/20 backdrop-blur-xl space-y-5 rounded-none md:rounded-xl overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold text-white">Edit Task</h2>
                        <button
                          onClick={() => {
                            setEditingTaskId(null)
                            setEditingTask(null)
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <X className="w-5 h-5 text-white/70" />
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          updateTask(editingTaskId, {
                            title: formData.get("title") as string,
                            description: formData.get("description") as string,
                            status: formData.get("status") as any,
                            priority: formData.get("priority") as any,
                            due_date: (formData.get("due_date") as string) || null,
                          })
                          setEditingTaskId(null)
                          setEditingTask(null)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Title *</label>
                          <Input
                            name="title"
                            defaultValue={editingTask.title}
                            required
                            className="bg-white/[0.1] border-white/[0.2] text-white placeholder:text-white/40"
                            placeholder="e.g. Design the new landing page"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Description</label>
                          <textarea
                            name="description"
                            defaultValue={editingTask.description || ""}
                            className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                            placeholder="Add more details about the task"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-white/70 mb-1 block">Status</label>
                            <select
                              name="status"
                              defaultValue={editingTask.status}
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white appearance-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-white/70 mb-1 block">Priority</label>
                            <select
                              name="priority"
                              defaultValue={editingTask.priority}
                              className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg p-3 text-sm text-white appearance-none"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-white/70 mb-1 block">Due Date</label>
                          <Input
                            name="due_date"
                            type="datetime-local"
                            defaultValue={editingTask.due_date ? new Date(editingTask.due_date).toISOString().slice(0, 16) : ""}
                            className="bg-white/[0.1] border-white/[0.2] text-white"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1 bg-white/[0.15] hover:bg-white/[0.2] text-white">
                            <Check className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setEditingTaskId(null)
                              setEditingTask(null)
                            }}
                            variant="outline"
                            className="flex-1 border-white/[0.2] text-white/70 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === "ideas" ? ( // Added Ideas view
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar-dark">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ideas Collection</h1>
                  <Button
                    onClick={() => setShowNewIdeaForm(true)}
                    className="bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 backdrop-blur-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Idea
                  </Button>
                </div>

                {/* Ideas by Type */}
                {["product", "feature", "business", "content", "design"].map((type) => {
                  const typeIdeas = ideas.filter((i) => i.type === type)
                  if (typeIdeas.length === 0) return null

                  return (
                    <div key={type} className="space-y-3">
                      <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        {type} Ideas ({typeIdeas.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {typeIdeas.map((idea) => (
                          <Card
                            key={idea.id}
                            onClick={() => {
                              setViewingIdeaId(idea.id)
                              setViewingIdea(idea)
                            }}
                            className="p-4 bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-xl hover:from-white/15 hover:to-white/8 transition-all group cursor-pointer"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-base line-clamp-2 flex-1">{idea.title}</h3>
                                <div className="relative flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingIdeaId(editingIdeaId === idea.id ? null : idea.id)
                                    }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                                    </svg>
                                  </button>

                                  {/* Action menu dropdown */}
                                  {editingIdeaId === idea.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-50 min-w-[140px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          // Strip HTML for clipboard copy or keep it? Keeping raw text is safer for general paste.
                                          // Simple strip tags:
                                          const tempDiv = document.createElement("div")
                                          tempDiv.innerHTML = idea.description || ""
                                          const textContent = tempDiv.innerText || tempDiv.textContent || ""
                                          navigator.clipboard.writeText(`${idea.title}\n\n${textContent}`)
                                          setEditingIdeaId(null)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Copy
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setViewingIdeaId(idea.id)
                                          setViewingIdea(idea)
                                          setEditingIdeaId(null)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteIdea(idea.id)
                                          setEditingIdeaId(null)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {idea.description && (
                                <div
                                  className="text-sm text-white/70 line-clamp-3 prose prose-invert prose-sm max-w-none [&_p]:m-0 [&_ul]:m-0 [&_li]:m-0"
                                  dangerouslySetInnerHTML={{ __html: idea.description }}
                                />
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-1 rounded text-[10px] font-medium ${idea.status === "draft"
                                    ? "bg-zinc-500/20 text-zinc-300"
                                    : idea.status === "in_review"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : idea.status === "approved"
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-red-500/20 text-red-300"
                                    }`}
                                >
                                  {idea.status.replace("_", " ")}
                                </span>
                                {idea.tags && idea.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {idea.tags.slice(0, 3).map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white/60"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {viewingIdeaId && viewingIdea && (
                  <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
                    onClick={() => {
                      setViewingIdeaId(null)
                      setViewingIdea(null)
                    }}
                  >
                    <div
                      className="bg-gradient-to-br from-white/10 to-white/5 border-0 md:border md:border-white/20 w-full md:max-w-2xl h-full md:h-auto md:max-h-[80vh] overflow-y-auto custom-scrollbar-dark p-4 md:p-6 rounded-none md:rounded-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h2 className="text-2xl font-bold">View / Edit Idea</h2>
                          <button
                            onClick={() => {
                              setViewingIdeaId(null)
                              setViewingIdea(null)
                            }}
                            className="p-2 rounded-lg hover:bg-white/10"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <Input
                          placeholder="Idea title"
                          value={viewingIdea.title || ""}
                          onChange={(e) => setViewingIdea({ ...viewingIdea, title: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />

                        <RichTextEditor
                          content={viewingIdea.description || ""}
                          onChange={(content) => setViewingIdea({ ...viewingIdea, description: content })}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-white/60 mb-1.5 block">Type</label>
                            <select
                              value={viewingIdea.type || "product"}
                              onChange={(e) =>
                                setViewingIdea({
                                  ...viewingIdea,
                                  type: e.target.value as Idea["type"],
                                })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            >
                              <option value="product">Product</option>
                              <option value="feature">Feature</option>
                              <option value="business">Business</option>
                              <option value="content">Content</option>
                              <option value="design">Design</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-white/60 mb-1.5 block">Status</label>
                            <select
                              value={viewingIdea.status || "draft"}
                              onChange={(e) =>
                                setViewingIdea({
                                  ...viewingIdea,
                                  status: e.target.value as Idea["status"],
                                })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            >
                              <option value="draft">Draft</option>
                              <option value="in_review">In Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => {
                              if (viewingIdeaId) {
                                updateIdea(viewingIdeaId, viewingIdea)
                                setViewingIdeaId(null)
                                setViewingIdea(null)
                              }
                            }}
                            className="flex-1 bg-white/15 hover:bg-white/20 border border-white/20"
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setViewingIdeaId(null)
                              setViewingIdea(null)
                            }}
                            variant="ghost"
                            className="border border-white/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ideas.length === 0 && !showNewIdeaForm && (
                  <Card className="p-12 bg-gradient-to-br from-white/5 to-white/0 border-white/10 backdrop-blur-xl text-center">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40">No ideas yet. Create your first idea to get started!</p>
                  </Card>
                )}

                {/* New Idea Form Modal */}
                {showNewIdeaForm && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                    <Card className="w-full max-w-lg p-4 md:p-6 bg-gradient-to-br from-zinc-900 to-black border-0 md:border md:border-white/20 backdrop-blur-xl space-y-4 h-full md:h-auto rounded-none md:rounded-xl overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Create New Idea</h2>
                        <button onClick={() => setShowNewIdeaForm(false)} className="p-2 hover:bg-white/10 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          createIdea({
                            user_id: userId || "", // Use dynamic userId
                            title: ideaFormData.title,
                            description: ideaFormData.description || null,
                            type: ideaFormData.type,
                            status: ideaFormData.status,
                            tags: ideaFormData.tags ? ideaFormData.tags.split(",").map((tag) => tag.trim()) : null,
                          })
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm text-white/70 mb-1 block">Title *</label>
                          <Input
                            name="title"
                            required
                            value={ideaFormData.title}
                            onChange={(e) => setIdeaFormData({ ...ideaFormData, title: e.target.value })}
                            placeholder="Enter idea title"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/70 mb-1 block">Description</label>
                          <RichTextEditor
                            content={ideaFormData.description || ""}
                            onChange={(content) => setIdeaFormData({ ...ideaFormData, description: content })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-white/70 mb-1 block">Type</label>
                            <select
                              name="type"
                              value={ideaFormData.type}
                              onChange={(e) =>
                                setIdeaFormData({
                                  ...ideaFormData,
                                  type: e.target.value as Idea["type"],
                                })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                            >
                              <option value="product">Product</option>
                              <option value="feature">Feature</option>
                              <option value="business">Business</option>
                              <option value="content">Content</option>
                              <option value="design">Design</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-white/70 mb-1 block">Status</label>
                            <select
                              name="status"
                              value={ideaFormData.status}
                              onChange={(e) =>
                                setIdeaFormData({
                                  ...ideaFormData,
                                  status: e.target.value as Idea["status"],
                                })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"
                            >
                              <option value="draft">Draft</option>
                              <option value="in_review">In Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-white/70 mb-1 block">Tags (comma-separated)</label>
                          <Input
                            name="tags"
                            value={ideaFormData.tags}
                            onChange={(e) => setIdeaFormData({ ...ideaFormData, tags: e.target.value })}
                            placeholder="e.g. ai, product, urgent"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            disabled={!ideaFormData.title.trim()}
                            className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Idea
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowNewIdeaForm(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === "market" ? (
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar-dark">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl md:text-3xl font-bold">Market Intelligence</h1>
                  {/* Refresh Button Moved to Modal */}
                </div>

                {/* Competitor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {competitors.map((competitor) => {
                    const latestStats = getLatestStats(competitor.id)

                    return (
                      <Card
                        key={competitor.id}
                        onClick={() => {
                          setSelectedCompetitor({ ...competitor, stats: latestStats })
                          setShowCompetitorModal(true)
                        }}
                        className="p-5 bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-xl hover:from-white/15 hover:to-white/8 transition-all cursor-pointer"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{competitor.name}</h3>
                              <p className="text-sm text-white/60">{competitor.platform}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {latestStats?.is_running_ads ? (
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/25 text-green-300 border border-green-500/50">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-semibold">Ads ON</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                                  <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                                  <span className="text-xs font-semibold">No Ads</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteCompetitor(competitor.id)
                                }}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                                title="Delete competitor"
                              >
                                <Trash2 className="w-4 h-4 text-white/40 group-hover:text-red-400" />
                              </button>
                            </div>
                          </div>

                          {latestStats ? (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-white/70">📉 Followers</span>
                                  <span className="font-semibold">
                                    {latestStats.follower_count >= 1000
                                      ? `${(latestStats.follower_count / 1000).toFixed(1)}k`
                                      : latestStats.follower_count}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/70">🔥 Viral Score</span>
                                    <span className="font-semibold">{latestStats.viral_score || 0}/10</span>
                                  </div>
                                  <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                                      style={{ width: `${((latestStats.viral_score || 0) / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {latestStats.summary_analysis && (
                                <div className="pt-2 border-t border-white/10">
                                  <p className="text-xs text-white/60 line-clamp-2">
                                    📝 {latestStats.summary_analysis}
                                  </p>
                                  <p className="text-xs text-white/40 mt-2 italic">Click to view full analysis →</p>
                                </div>
                              )}

                              {latestStats.scraped_at && (
                                <div className="pt-2 text-xs text-white/40 border-t border-white/10">
                                  <p>🕐 Last scraped: {new Date(latestStats.scraped_at).toLocaleString()}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-white/40">No data available</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {competitors.length === 0 && !loadingMarketData && (
                  <Card className="p-12 bg-gradient-to-br from-white/5 to-white/0 border-white/10 backdrop-blur-xl text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40 mb-4">No competitor data available yet.</p>
                    <Button
                      onClick={refreshMarketData}
                      disabled={loadingMarketData}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingMarketData ? "animate-spin" : ""}`} />
                      Refresh Data
                    </Button>
                  </Card>
                )}

                {/* Competitor Detail Modal */}
                {showCompetitorModal && selectedCompetitor && (
                  <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
                    onClick={() => setShowCompetitorModal(false)}
                  >
                    <Card
                      className="w-full md:max-w-3xl h-full md:h-auto md:max-h-[80vh] overflow-y-auto custom-scrollbar-dark bg-gradient-to-br from-zinc-900 to-black border-0 md:border md:border-white/20 backdrop-blur-xl rounded-none md:rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6 space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedCompetitor.name}</h2>
                            <p className="text-white/60">{selectedCompetitor.platform}</p>
                            {selectedCompetitor.stats?.scraped_at && (
                              <p className="text-xs text-white/40 mt-1">
                                Last updated: {new Date(selectedCompetitor.stats.scraped_at).toLocaleDateString()} at{" "}
                                {new Date(selectedCompetitor.stats.scraped_at).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={refreshMarketData}
                              disabled={loadingMarketData}
                              size="sm"
                              className="bg-white/10 hover:bg-white/20 border border-white/10"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${loadingMarketData ? "animate-spin" : ""}`} />
                              Refresh Analysis
                            </Button>
                            <button
                              onClick={() => setShowCompetitorModal(false)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {selectedCompetitor.stats && (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg border border-blue-500/30">
                                <p className="text-xs text-blue-300 font-semibold mb-2">👥 Followers</p>
                                <p className="text-xl md:text-2xl font-bold text-white">
                                  {(selectedCompetitor.stats.follower_count / 1000).toFixed(1)}K
                                </p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg border border-purple-500/30">
                                <p className="text-xs text-purple-300 font-semibold mb-2">🔥 Viral Score</p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl md:text-2xl font-bold text-white">
                                    {selectedCompetitor.stats.viral_score || 0}
                                  </p>
                                  <p className="text-xs text-white/50">/10</p>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full"
                                    style={{
                                      width: `${((selectedCompetitor.stats.viral_score || 0) / 10) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div
                                className={`p-4 rounded-lg border ${selectedCompetitor.stats.is_running_ads
                                  ? "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30"
                                  : "bg-gradient-to-br from-gray-500/20 to-gray-500/5 border-gray-500/30"
                                  }`}
                              >
                                <p className="text-xs font-semibold mb-2">📢 Ads Running</p>
                                <p className="text-xl font-bold">
                                  {selectedCompetitor.stats.is_running_ads ? (
                                    <span className="text-green-400">Active</span>
                                  ) : (
                                    <span className="text-gray-400">Inactive</span>
                                  )}
                                </p>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg border border-amber-500/30">
                                <p className="text-xs text-amber-300 font-semibold mb-2">📅 Data Age</p>
                                <p className="text-sm text-white">
                                  {Math.floor(
                                    (Date.now() - new Date(selectedCompetitor.stats.scraped_at).getTime()) /
                                    (1000 * 60 * 60),
                                  )}
                                  h ago
                                </p>
                              </div>
                            </div>

                            {selectedCompetitor.stats.summary_analysis && (
                              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <span>📊</span>
                                  <span>AI Analysis</span>
                                </h3>
                                <p className="text-sm text-white/80 leading-relaxed">
                                  {selectedCompetitor.stats.summary_analysis}
                                </p>
                              </div>
                            )}

                            {selectedCompetitor.stats.content_strategy && (
                              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <span>📋</span>
                                  <span>Content Strategy</span>
                                </h3>
                                <div className="space-y-2 text-sm">
                                  {typeof selectedCompetitor.stats.content_strategy === "object" ? (
                                    Object.entries(selectedCompetitor.stats.content_strategy).map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-start gap-2">
                                        <span className="text-white/60 capitalize">{key}:</span>
                                        <span className="text-white/80 text-right">
                                          {typeof value === "string" ? value : JSON.stringify(value)}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-white/70">{selectedCompetitor.stats.content_strategy}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {selectedCompetitor.stats.top_post && (
                              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/20">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <span>🏆</span>
                                  <span>Top Performing Post</span>
                                </h3>
                                <div className="space-y-2 text-sm">
                                  {typeof selectedCompetitor.stats.top_post === "object" ? (
                                    Object.entries(selectedCompetitor.stats.top_post).map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-start gap-2">
                                        <span className="text-amber-300/70 capitalize">{key}:</span>
                                        <span className="text-white/80 text-right max-w-xs line-clamp-2">
                                          {typeof value === "string" ? value : JSON.stringify(value)}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-white/70">{selectedCompetitor.stats.top_post}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : activeModule === "crm" ? ( // Implementing CRM view with contacts table data
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar-dark">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Contacts</h1>
                    <p className="text-sm text-white/50 mt-1">Manage your business contacts and relationships</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedContact(null)
                      setShowContactModal(true)
                    }}
                    className="w-full sm:w-auto bg-gradient-to-br from-white/[0.15] to-white/[0.08] hover:from-white/[0.2] hover:to-white/[0.12] text-white border border-white/[0.15]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>

                <div className="mb-6">
                  <Input
                    type="text"
                    placeholder="Search by name, email, company, or role..."
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.1] overflow-hidden">
                  {contacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">No contacts yet. Add your first contact!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/[0.05]">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white/70 hidden sm:table-cell">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white/70 hidden md:table-cell">
                              Company
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white/70 hidden lg:table-cell">
                              Role
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-4 py-3 text-sm text-white font-medium">{contact.name}</td>
                              <td className="px-4 py-3 text-sm text-zinc-300 hidden sm:table-cell">
                                {contact.email || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-300 hidden md:table-cell">
                                {contact.company || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-300 hidden lg:table-cell">
                                {contact.role || "-"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedContact(contact)
                                    setShowContactModal(true)
                                  }}
                                  className="text-zinc-400 hover:text-white transition-colors p-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeModule === "calendar" ? (
            <div className="flex-1 p-2 md:p-6 overflow-y-auto custom-scrollbar-dark">
              <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-light text-white tracking-wide">
                      {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-white/40">{currentDate.getFullYear()}</span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(currentDate.getMonth() - 1)
                        setCurrentDate(newDate)
                      }}
                      variant="outline"
                      size="icon"
                      className="bg-white/5 border-white/10 hover:bg-white/10 w-9 h-9 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentDate(new Date())
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-xs px-3 h-9 rounded-full transition-colors text-white"
                    >
                      Today
                    </Button>
                    <Button
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(currentDate.getMonth() + 1)
                        setCurrentDate(newDate)
                      }}
                      // Actually, let's fix the logic right now.
                      // onClick={() => {
                      //   const newDate = new Date(currentDate)
                      //   newDate.setMonth(currentDate.getMonth() + 1)
                      //   setCurrentDate(newDate)
                      // }}
                      // But I cannot easily inject complex logic change in a simple replace. 
                      // I'll stick to button UI update first. 
                      // Retaining original onClick but updating UI.
                      variant="outline"
                      size="icon"
                      className="bg-white/5 border-white/10 hover:bg-white/10 w-9 h-9 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid - Month Only */}
                <div className="space-y-4">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-3 mb-2">
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                      <div
                        key={index}
                        className="text-left px-2 text-xs font-medium text-white/40"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 42 }).map((_, index) => {
                      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
                      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
                      const dayNumber = index - firstDay + 1

                      // Previous month logic for empty cells
                      if (dayNumber < 1) {
                        // Optional: Show previous month dates faded? For now empty matching reference style which shows empty slots or faded.
                        // Reference shows explicit dates for prev/next month. Let's start with just empty for simplicity or calculate prev dates.
                        // Actually reference image shows "30" for Sunday when month starts on Monday. So yes, show prev dates.
                        const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
                        const prevDate = prevMonthLastDate + dayNumber
                        return (
                          <div key={index} className="min-h-[120px] p-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col justify-between opacity-30">
                            <div className="text-lg font-medium text-white/50">{prevDate}</div>
                          </div>
                        )
                      }

                      // Next month logic
                      if (dayNumber > daysInMonth) {
                        const nextDate = dayNumber - daysInMonth
                        return (
                          <div key={index} className="min-h-[120px] p-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col justify-between opacity-30">
                            <div className="text-lg font-medium text-white/50">{nextDate}</div>
                          </div>
                        )
                      }

                      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
                      const cellDateStr = cellDate.toISOString().split("T")[0]
                      const dayTasks = tasks.filter(
                        (task) =>
                          task.due_date && task.due_date.split("T")[0] === cellDateStr && task.status !== "completed",
                      )

                      const isToday = cellDate.toDateString() === new Date().toDateString()
                      // Selected date state? For now just use isToday for highlighting, or click to select styling.
                      // Reference shows distinct highlight for "4" (Blue bg). Let's use isToday for that.

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] p-3 rounded-3xl border transition-all relative group flex flex-col items-start justify-start gap-2 ${isToday
                            ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                            : "bg-white/[0.05] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08]"
                            }`}
                        >
                          <div
                            className={`text-xl font-medium ${isToday ? "text-white" : "text-white/90"}`}
                          >
                            {dayNumber}
                          </div>

                          <div className="w-full space-y-1.5 overflow-hidden">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCalendarTask(task)
                                  setShowCalendarTaskModal(true)
                                }}
                                className="flex items-center gap-1.5 group/task cursor-pointer"
                              >
                                {/* Colored bar/dot */}
                                <div className={`w-0.5 h-3 rounded-full flex-shrink-0 ${task.priority === "high" ? "bg-red-400" :
                                  task.priority === "medium" ? "bg-amber-400" :
                                    "bg-sky-400"
                                  }`} />
                                <span className={`text-[10px] truncate ${isToday ? "text-blue-100" : "text-white/70 group-hover/task:text-white"}`}>
                                  {task.title}
                                </span>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className={`text-[10px] pl-2 ${isToday ? "text-blue-200" : "text-white/40"}`}>
                                +{dayTasks.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Upcoming Tasks Sidebar - Visible always */}
                <div className="mt-6 bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/[0.1] p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasks
                      .filter((t) => t.due_date && t.status !== "completed")
                      .sort((a, b) => new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime())
                      .slice(0, 10)
                      .map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedCalendarTask(task)
                            setShowCalendarTaskModal(true)
                          }}
                          className="p-3 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2] transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{task.title}</p>
                              <p className="text-xs text-white/40 mt-1">
                                {new Date(task.due_date || "").toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${task.status === "in_progress"
                                ? "bg-blue-500/20 text-blue-200"
                                : "bg-white/10 text-white/60"
                                }`}
                            >
                              {task.status === "in_progress" ? "In Progress" : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-white/40 text-lg mb-2">{modules.find((m) => m.id === activeModule)?.label}</p>
                <p className="text-white/20 text-sm">Coming soon...</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts - Changed to horizontal slider with rectangle cards */}
        {
          activeModule === "home" && promptCards.length > 0 && (
            <div className="px-2 md:px-3 pb-2 pt-2">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                    className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/90 transition-colors"
                  >
                    <span className="mx-[11px]">Quick Prompts</span>
                    {showQuickPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showQuickPrompts && (
                    <button
                      onClick={() => setIsEditingPrompts(!isEditingPrompts)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.08] flex items-center gap-1.5 backdrop-blur"
                      title="Edit Quick Prompts"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                {showQuickPrompts && (
                  <div className="relative overflow-x-auto scrollbar-autohide pb-2">
                    <div className="flex gap-2 min-w-max px-1">
                      {promptCards.map((card) => {
                        return (
                          <Card
                            key={card.id}
                            className="relative group bg-transparent border-white/[0.2] hover:border-white/[0.4] transition-all duration-300 backdrop-blur rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] w-auto px-3 py-1.5 cursor-pointer"
                          >
                            {editingCardId === card.id ? (
                              <div className="flex items-center gap-1.5 px-2 py-1">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      saveEditCard(card.id)
                                    }
                                  }}
                                  className="h-6 text-xs bg-white/10 border-white/20 text-white"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveEditCard(card.id)}
                                  className="h-6 px-2 bg-white/20 hover:bg-white/30 text-white text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => !isEditingPrompts && handlePromptCardClick(card.text)}
                                className="w-full flex items-center px-2 py-1 text-xs text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
                              >
                                <span className="font-medium">{card.text}</span>
                              </button>
                            )}
                            {isEditingPrompts && editingCardId !== card.id && (
                              <div className="absolute -top-1.5 -right-1.5 flex gap-1">
                                <button
                                  onClick={() => {
                                    setIconPickerCardId(card.id)
                                    setShowIconPicker(true)
                                  }}
                                  className="w-5 h-5 bg-zinc-700/95 backdrop-blur rounded-full flex items-center justify-center hover:bg-zinc-600 border border-white/20 shadow-lg transition-all"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-white" />
                                </button>
                                <button
                                  onClick={() => startEditCard(card)}
                                  className="w-5 h-5 bg-zinc-700/95 backdrop-blur rounded-full flex items-center justify-center hover:bg-zinc-600 border border-white/20 shadow-lg transition-all"
                                >
                                  <Edit2 className="w-2.5 h-2.5 text-white" />
                                </button>
                                <button
                                  onClick={() => removePromptCard(card.id)}
                                  className="w-5 h-5 bg-red-500/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-red-500 border border-red-500/40 shadow-lg transition-all"
                                >
                                  <X className="w-2.5 h-2.5 text-white" />
                                </button>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                      {isEditingPrompts && (
                        <Button
                          onClick={addPromptCard}
                          variant="outline"
                          className="h-auto min-h-[24px] border-dashed border border-white/15 hover:border-white/30 bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-white backdrop-blur rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 px-2 py-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">Add</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          showIconPicker && iconPickerCardId && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowIconPicker(false)
                setIconPickerCardId(null)
              }}
            >
              <div
                className="bg-gradient-to-br from-[#0a0a0a] to-black backdrop-blur-2xl rounded-2xl p-5 max-w-sm w-full border border-white/[0.12]"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-semibold mb-3 text-white">Choose Icon</h3>
                <div className="grid grid-cols-5 gap-2">
                  {availableIcons.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => updateCardIcon(iconPickerCardId, name)}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] hover:from-white/[0.15] hover:to-white/[0.08] transition-all duration-200 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-xl"
                    >
                      <Icon className="w-4 h-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowIconPicker(false)
                    setIconPickerCardId(null)
                  }}
                  className="mt-3 w-full py-2 bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-white/[0.1] hover:to-white/[0.04] rounded-xl transition-colors text-xs text-zinc-400 border border-white/[0.1] backdrop-blur-xl"
                >
                  Close
                </button>
              </div>
            </div>
          )
        }

        {/* Chat Input - Fixed for mobile zoom issue */}
        <div className="border-t border-white/10 bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-md p-3 md:p-4">
          <div className="flex items-center gap-2 [&_input]:text-xs [&_input]:leading-tight">
            <Textarea
              ref={inputRef}
              placeholder="Ask anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-1 focus:ring-white/20 min-h-[40px] resize-none py-3"
              style={{ fontSize: "12px", lineHeight: "1.2" }}
              disabled={loading}
              rows={1}
            />

            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-1.5 hover:bg-white/[0.1] rounded-xl transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <Plus className="w-4 h-4" />
            </button>
            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-1.5 bg-gradient-to-br from-gray-900 to-black backdrop-blur-2xl rounded-xl p-1.5 shadow-2xl min-w-[120px]">
                <button className="flex items-center gap-2.5 px-2.5 py-1.5 text-[10px] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200 rounded-lg w-full transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
                <button className="flex items-center gap-2.5 px-2.5 py-1.5 text-[10px] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200 rounded-lg w-full transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-[10px] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200 rounded-lg w-full transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={handlePushToTalk}
              className={`p-1.5 rounded-xl transition-all ${isPushToTalk
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-300"
                }`}
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              size="sm"
              className="h-7 px-2.5 rounded-xl bg-gradient-to-br from-white/[0.15] to-white/[0.08] hover:from-white/[0.2] hover:to-white/[0.12] disabled:from-white/[0.05] disabled:to-white/[0.02] text-zinc-300 hover:text-white disabled:text-zinc-600 transition-all backdrop-blur-xl border border-white/[0.12]"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div >

      {/* Mobile Sidebar Overlay */}
      {
        isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )
      }

      {/* Contact Modal */}
      {
        showContactModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowContactModal(false)
                setSelectedContact(null)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  role: "",
                  notes: "",
                })
              }
            }}
          >
            <Card className="w-full md:max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar-dark p-4 md:p-6 bg-gradient-to-br from-zinc-900 to-black border-0 md:border md:border-white/20 backdrop-blur-xl space-y-4 rounded-none md:rounded-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedContact ? "Edit Contact" : "Add New Contact"}</h2>
                <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (selectedContact) {
                    updateContact(selectedContact.id, formData)
                  } else {
                    createContact(formData)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Name *</label>
                  <Input
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Phone</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Company</label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Role/Title</label>
                  <Input
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    placeholder="Enter role or job title"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:ring-1 focus:ring-white/20"
                    placeholder="Add any notes about this contact"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-white/10 hover:bg-white/20">
                    {selectedContact ? "Save Changes" : "Add Contact"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false)
                      setSelectedContact(null)
                      // Reset form when closing
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        company: "",
                        role: "",
                        notes: "",
                      })
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )
      }

      {/* Settings Modal */}
      {
        showSettingsModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <Card
              className="w-full md:max-w-md h-full md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar-dark p-4 md:p-6 bg-gradient-to-br from-zinc-900 to-black border-0 md:border md:border-white/20 backdrop-blur-xl space-y-4 rounded-none md:rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Username</label>
                  <Input
                    value={userSettings.username}
                    onChange={(e) => setUserSettings({ ...userSettings, username: e.target.value })}
                    placeholder="Enter username"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Name</label>
                  <Input
                    value={userSettings.full_name}
                    onChange={(e) => setUserSettings({ ...userSettings, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Email</label>
                  <Input
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                    placeholder="Enter your email"
                    className="bg-white/5 border-white/10 text-white"
                    type="email"
                  />
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wide">Language</label>
                  <div className="flex gap-2">
                    {[
                      { code: "en", label: "English" },
                      { code: "my", label: "Burmese" },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() =>
                          setUserSettings((prev) => ({
                            ...prev,
                            language_code: lang.code,
                          }))
                        }
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${userSettings.language_code === lang.code
                          ? "bg-white/20 border border-white/40 text-white"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Security Section (Change Password) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wide">Security & Password</label>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showPasswordSection ? "rotate-180" : ""}`} />
                </button>

                {showPasswordSection && (
                  <div className="space-y-3 animate-fade-in">
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      onClick={() => {
                        if (passwordData.newPassword !== passwordData.confirmPassword) {
                          alert("Passwords do not match!")
                          return
                        }
                        if (passwordData.newPassword.length < 6) {
                          alert("Password must be at least 6 characters")
                          return
                        }
                        // Mock success for now as we don't have the endpoint confirmed
                        alert("Password update functionality is UI-only for this demo.")
                        setPasswordData({ newPassword: "", confirmPassword: "" })
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9 text-xs"
                    >
                      Update Password
                    </Button>
                  </div>
                )}
              </div>

              {/* Change Log Section */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wide">Change Log (V1.0.6)</label>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 h-32 overflow-y-auto custom-scrollbar-dark text-xs text-zinc-400 space-y-1">
                  <p>• Fixed Topbar Task Count: Now loads immediately on app start.</p>
                  <p>• Polished Mobile Modals: Removed borders & glossy edges for clean look.</p>
                  <p>• Mobile UI Overhaul: Full-screen modals & optimized touch areas.</p>
                  <p>• Fixed Market Intelligence: Now ensures latest scrape data is shown.</p>
                  <p>• Sidebar Improvements: Better mobile backdrop & smooth transitions.</p>
                  <p>• Added "Archive" task status and filter.</p>
                  <p>• Added In-Place Task Editing on Calendar.</p>
                  <p>• Support for Markdown Headings (##, ###, ####).</p>
                  <p>• Fixed Greeting Text glitch ("Boss").</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {settingsSaved && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm text-center">
                    Settings saved successfully!
                  </div>
                )}
                <Button
                  onClick={updateUserSettings}
                  disabled={settingsLoading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  {settingsLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium text-sm">Sign Out</span>
                </button>
              </div>
            </Card>
          </div >
        )
      }

      {
        activeTaskPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
            <Card className="w-full md:max-w-2xl h-full md:h-auto md:max-h-[80vh] flex flex-col bg-zinc-900 border-0 md:border md:border-white/10 shadow-2xl rounded-none md:rounded-xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white capitalize">
                  {activeTaskPopup === "today" ? "Tasks due today" : `${activeTaskPopup} Tasks`}
                </h2>
                <button
                  onClick={() => setActiveTaskPopup(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {tasks
                  .filter((t) => {
                    if (activeTaskPopup === "archived") return t.status === "archived"
                    if (t.status === "archived") return false // Exclude archived from other views

                    if (activeTaskPopup === "pending") return t.status === "pending" || t.status === "in_progress"
                    if (activeTaskPopup === "completed") return t.status === "completed"
                    if (activeTaskPopup === "urgent") return t.priority === "urgent"
                    if (activeTaskPopup === "overdue") {
                      if (!t.due_date || t.status === "completed") return false
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return new Date(t.due_date) < today
                    }
                    if (activeTaskPopup === "today") {
                      if (!t.due_date || t.status === "completed") return false
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const tomorrow = new Date(today)
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      return new Date(t.due_date) >= today && new Date(t.due_date) < tomorrow
                    }
                    return false
                  })
                  .map((task) => (
                    <Card
                      key={task.id}
                      className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        setEditingTaskId(task.id)
                        setEditingTask(task)
                        setActiveTaskPopup(null) // Close popup when opening specific task
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{task.title}</p>
                          {task.description && (
                            <div className="text-sm text-white/50 line-clamp-1 mt-1 prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: task.description }} />
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-wide
                               ${task.priority === "urgent" ? "text-red-400 bg-red-400/10" :
                                task.priority === "high" ? "text-orange-400 bg-orange-400/10" :
                                  "text-white/60"}
                             `}>
                              {task.priority}
                            </span>
                            {task.due_date && (
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                {tasks.filter(t => {
                  if (activeTaskPopup === "archived") return t.status === "archived"
                  if (t.status === "archived") return false
                  if (activeTaskPopup === "pending") return t.status === "pending" || t.status === "in_progress"
                  if (activeTaskPopup === "completed") return t.status === "completed"
                  if (activeTaskPopup === "urgent") return t.priority === "urgent"
                  if (activeTaskPopup === "overdue") {
                    if (!t.due_date || t.status === "completed") return false
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return new Date(t.due_date) < today
                  }
                  if (activeTaskPopup === "today") {
                    if (!t.due_date || t.status === "completed") return false
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    return new Date(t.due_date) >= today && new Date(t.due_date) < tomorrow
                  }
                  return false
                }).length === 0 && (
                    <div className="text-center text-white/40 py-8">
                      No tasks found in this category
                    </div>
                  )}
              </div>
            </Card>
          </div>
        )}

      {showCalendarTaskModal && selectedCalendarTask && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4"
          onClick={() => setShowCalendarTaskModal(false)}
        >
          <Card
            className="w-full md:max-w-2xl p-4 md:p-6 bg-gradient-to-br from-zinc-900 to-black border-0 md:border md:border-white/20 backdrop-blur-xl h-full md:h-auto rounded-none md:rounded-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 mr-4">
                {editingTaskId === selectedCalendarTask.id ? (
                  <div className="space-y-3">
                    <Input
                      value={selectedCalendarTask.title}
                      onChange={(e) =>
                        setSelectedCalendarTask({ ...selectedCalendarTask, title: e.target.value })
                      }
                      className="text-xl font-bold bg-white/10 border-white/20 text-white"
                      placeholder="Task Title"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="datetime-local"
                        value={selectedCalendarTask.due_date ? new Date(selectedCalendarTask.due_date).toISOString().slice(0, 16) : ""}
                        onChange={(e) =>
                          setSelectedCalendarTask({ ...selectedCalendarTask, due_date: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                      <select
                        value={selectedCalendarTask.priority}
                        onChange={(e) => setSelectedCalendarTask({ ...selectedCalendarTask, priority: e.target.value as any })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <select
                        value={selectedCalendarTask.status}
                        onChange={(e) => setSelectedCalendarTask({ ...selectedCalendarTask, status: e.target.value as any })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <textarea
                      value={selectedCalendarTask.description || ""}
                      onChange={(e) =>
                        setSelectedCalendarTask({ ...selectedCalendarTask, description: e.target.value })
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                      placeholder="Description..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateTask(selectedCalendarTask.id, selectedCalendarTask)
                          setEditingTaskId(null)
                          setShowCalendarTaskModal(false)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" /> Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditingTaskId(null)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{selectedCalendarTask.title}</h2>
                    <p className="text-sm text-white/60 mt-1">
                      Due:{" "}
                      {selectedCalendarTask.due_date
                        ? new Date(selectedCalendarTask.due_date).toLocaleDateString()
                        : "No date"}
                    </p>
                  </>
                )}
              </div>
              {!editingTaskId && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setTaskMenuOpen(!taskMenuOpen)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-white/70" />
                    </button>
                    {taskMenuOpen && (
                      <div className="absolute right-0 mt-1 w-48 bg-zinc-800 border border-white/20 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            setEditingTaskId(selectedCalendarTask.id)
                            // setEditingTask(selectedCalendarTask) // No need, we edit directly in selectedCalendarTask
                            setTaskMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Task
                        </button>
                        <button
                          onClick={() => {
                            if (selectedCalendarTask.id) {
                              deleteTask(selectedCalendarTask.id)
                            }
                            setShowCalendarTaskModal(false)
                            setTaskMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Task
                        </button>
                        <button
                          onClick={() => {
                            if (selectedCalendarTask.id) {
                              updateTaskStatus(
                                selectedCalendarTask.id,
                                selectedCalendarTask.status === "completed" ? "pending" : "completed",
                              )
                            }
                            setShowCalendarTaskModal(false)
                            setTaskMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {selectedCalendarTask.status === "completed" ? "Mark Incomplete" : "Mark Complete"}
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCalendarTaskModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              )}
            </div>

            {!editingTaskId && (
              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-2 uppercase font-semibold">Status</p>
                    <p className="text-sm text-white capitalize">{selectedCalendarTask.status.replace("_", " ")}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-2 uppercase font-semibold">Priority</p>
                    <p
                      className={`text-sm capitalize font-semibold ${selectedCalendarTask.priority === "urgent"
                        ? "text-red-400"
                        : selectedCalendarTask.priority === "high"
                          ? "text-orange-400"
                          : "text-yellow-400"
                        }`}
                    >
                      {selectedCalendarTask.priority}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedCalendarTask.description && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-2 uppercase font-semibold">Description</p>
                    <p className="text-sm text-white/90">{selectedCalendarTask.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-2 uppercase font-semibold">Created</p>
                    <p className="text-sm text-white">{new Date(selectedCalendarTask.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-white/60 mb-2 uppercase font-semibold">Due Date</p>
                    <p className="text-sm text-white">
                      {selectedCalendarTask.due_date
                        ? new Date(selectedCalendarTask.due_date).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )
      }
    </div >
  )
}
