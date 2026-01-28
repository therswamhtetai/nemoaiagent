"use client"

import { useState, useEffect } from "react"
import Confetti from "react-confetti"
import { Plus, CheckCircle, Circle, Trash, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export default function TasksPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setTasks(data)
    }
  }

  const addTask = async () => {
    if (newTask.trim()) {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ title: newTask, completed: false }])
        .select()
        .single()

      if (data && !error) {
        setTasks((prev) => [data, ...prev])
        setNewTask("")
      }
      setLoading(false)
    }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", id)

    if (!error) {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !completed } : task)))

      // Trigger confetti only when marking task as complete (not when uncompleting)
      if (!completed) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (!error) {
      setTasks((prev) => prev.filter((task) => task.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80', '#86efac']}
        />
      )}
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-zinc-100">Tasks</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Add Task Input */}
          <Card className="border-zinc-800/50 bg-zinc-900/30 p-4">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a new task..."
                disabled={loading}
                className="flex-1 border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
              />
              <Button
                onClick={addTask}
                disabled={!newTask.trim() || loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </Card>

          {/* Tasks List */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <Card className="border-zinc-800/50 bg-zinc-900/20 p-8 text-center">
                <p className="text-sm text-zinc-500">No tasks yet. Add one to get started!</p>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card
                  key={task.id}
                  className="group border-zinc-800/50 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="text-zinc-400 transition-colors hover:text-blue-500"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <span
                      className={`flex-1 text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}
                    >
                      {task.title}
                    </span>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
