"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Plus, Trash, ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface Idea {
  id: string
  title: string
  description: string
  favorite: boolean
  created_at: string
}

export default function IdeasPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadIdeas()
  }, [])

  const loadIdeas = async () => {
    const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setIdeas(data)
    }
  }

  const addIdea = async () => {
    if (newTitle.trim()) {
      setLoading(true)
      const { data, error } = await supabase
        .from("ideas")
        .insert([{ title: newTitle, description: newDescription, favorite: false }])
        .select()
        .single()

      if (data && !error) {
        setIdeas((prev) => [data, ...prev])
        setNewTitle("")
        setNewDescription("")
      }
      setLoading(false)
    }
  }

  const toggleFavorite = async (id: string, favorite: boolean) => {
    const { error } = await supabase.from("ideas").update({ favorite: !favorite }).eq("id", id)

    if (!error) {
      setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, favorite: !favorite } : idea)))
    }
  }

  const deleteIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").delete().eq("id", id)

    if (!error) {
      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-zinc-100">Ideas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Add Idea Input */}
          <Card className="border-zinc-800/50 bg-zinc-900/30 p-4">
            <div className="space-y-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Idea title..."
                disabled={loading}
                className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
              />
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)..."
                disabled={loading}
                className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                rows={3}
              />
              <Button
                onClick={addIdea}
                disabled={!newTitle.trim() || loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Idea
              </Button>
            </div>
          </Card>

          {/* Ideas Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {ideas.length === 0 ? (
              <Card className="col-span-2 border-zinc-800/50 bg-zinc-900/20 p-8 text-center">
                <p className="text-sm text-zinc-500">No ideas yet. Add one to get started!</p>
              </Card>
            ) : (
              ideas.map((idea) => (
                <Card
                  key={idea.id}
                  className="group border-zinc-800/50 bg-zinc-900/30 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex-1 text-sm font-semibold text-zinc-200">{idea.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavorite(idea.id, idea.favorite)}
                          className="h-7 w-7"
                        >
                          <Star
                            className={`h-4 w-4 ${idea.favorite ? "fill-amber-500 text-amber-500" : "text-zinc-500"}`}
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteIdea(idea.id)}
                          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    {idea.description && <p className="text-xs text-zinc-400 leading-relaxed">{idea.description}</p>}
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
