"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, Clock, ArrowLeft, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface Event {
  id: string
  title: string
  date: string
  time: string
  description: string
  created_at: string
}

export default function CalendarPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

    if (data && !error) {
      setEvents(data)
    }
  }

  const addEvent = async () => {
    if (newEvent.title.trim() && newEvent.date) {
      setLoading(true)
      const { data, error } = await supabase.from("events").insert([newEvent]).select().single()

      if (data && !error) {
        setEvents((prev) => [...prev, data])
        setNewEvent({ title: "", date: "", time: "", description: "" })
        setShowAddForm(false)
        loadEvents() // Reload to maintain sort order
      }
      setLoading(false)
    }
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (!error) {
      setEvents((prev) => prev.filter((event) => event.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-zinc-100">Calendar</h1>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Add Event Form */}
          {showAddForm && (
            <Card className="border-zinc-800/50 bg-zinc-900/30 p-4">
              <div className="space-y-3">
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title *"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    placeholder="Date"
                    type="date"
                    disabled={loading}
                    className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                  />
                  <Input
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="Time"
                    type="time"
                    disabled={loading}
                    className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                  />
                </div>
                <Input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Description (optional)"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addEvent}
                    disabled={!newEvent.title.trim() || !newEvent.date || loading}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700"
                  >
                    Add Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800/50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Events List */}
          <div className="space-y-2">
            {events.length === 0 ? (
              <Card className="border-zinc-800/50 bg-zinc-900/20 p-8 text-center">
                <p className="text-sm text-zinc-500">No events scheduled yet.</p>
              </Card>
            ) : (
              events.map((event) => (
                <Card
                  key={event.id}
                  className="group border-zinc-800/50 bg-zinc-900/30 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-semibold text-zinc-200">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        {event.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        )}
                      </div>
                      {event.description && <p className="text-xs text-zinc-400">{event.description}</p>}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteEvent(event.id)}
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
