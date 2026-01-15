"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Mail, Phone, ArrowLeft, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  created_at: string
}

export default function CRMPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  })
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setContacts(data)
    }
  }

  const addContact = async () => {
    if (newContact.name.trim() && newContact.email.trim()) {
      setLoading(true)
      const { data, error } = await supabase.from("contacts").insert([newContact]).select().single()

      if (data && !error) {
        setContacts((prev) => [data, ...prev])
        setNewContact({ name: "", email: "", phone: "", company: "" })
        setShowAddForm(false)
      }
      setLoading(false)
    }
  }

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (!error) {
      setContacts((prev) => prev.filter((contact) => contact.id !== id))
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
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-zinc-100">CRM</h1>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Add Contact Form */}
          {showAddForm && (
            <Card className="border-zinc-800/50 bg-zinc-900/30 p-4">
              <div className="space-y-3">
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Name *"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <Input
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Email *"
                  type="email"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <Input
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  placeholder="Company"
                  disabled={loading}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-200 placeholder-zinc-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addContact}
                    disabled={!newContact.name.trim() || !newContact.email.trim() || loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                  >
                    Add Contact
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

          {/* Contacts List */}
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.length === 0 ? (
              <Card className="col-span-2 border-zinc-800/50 bg-zinc-900/20 p-8 text-center">
                <p className="text-sm text-zinc-500">No contacts yet. Add one to get started!</p>
              </Card>
            ) : (
              contacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="group border-zinc-800/50 bg-zinc-900/30 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-zinc-200">{contact.name}</h3>
                        {contact.company && <p className="text-xs text-zinc-500">{contact.company}</p>}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteContact(contact.id)}
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
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
