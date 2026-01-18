"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import { useMemo } from "react"
import StarterKit from "@tiptap/starter-kit"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, List, ListOrdered, CheckSquare, Strikethrough } from "lucide-react"


interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    editable?: boolean
}

const RichTextEditor = ({ content, onChange, placeholder = "Write something...", editable = true }: RichTextEditorProps) => {
    // Custom simple markdown parser to handle AI-generated content
    const editorContent = useMemo(() => {
        if (!content) return ""

        // If it starts with an HTML tag, assume it's already HTML
        if (content.trim().startsWith("<")) {
            return content
        }

        try {
            // Simple parser for the specific format the user has
            let html = content

            // Handle Task Lists: "- [ ] " -> <ul data-type="taskList"><li data-type="taskItem"><label><input type="checkbox"></label><div>...</div></li></ul>
            // Note: This is a basic implementation. For complex nested lists, a library is better.

            // check if contains task items
            if (html.includes("- [ ]") || html.includes("- [x]")) {
                const lines = html.split(/(?=- \[)/) // Split by lookahead
                let listHtml = '<ul data-type="taskList">'
                let hasList = false

                for (const line of lines) {
                    const trimmed = line.trim()
                    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
                        hasList = true
                        const isChecked = trimmed.startsWith("- [x]")
                        const text = trimmed.substring(5).trim() // Remove "- [ ] "
                        listHtml += `
                            <li data-type="taskItem" data-checked="${isChecked}">
                                <label><input type="checkbox" ${isChecked ? "checked" : ""}></label>
                                <div>${text}</div>
                            </li>
                        `
                    } else if (trimmed) {
                        // Regular text mixed in?
                        listHtml += `<li>${trimmed}</li>`
                    }
                }
                listHtml += "</ul>"

                if (hasList) {
                    html = listHtml
                }
            } else {
                // Convert newlines to breaks if not a list
                html = html.replace(/\n/g, "<br>")
            }

            // Handle Bold: **text** -> <strong>text</strong>
            html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

            return html
        } catch (e) {
            console.error("Error parsing markdown:", e)
            return content
        }
    }, [content])

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: editorContent, // Use the parsed content
        editable: editable,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[150px] text-sm text-white/90 custom-scrollbar-dark",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-col border border-white/10 rounded-lg bg-white/5 overflow-hidden">
            {/* Toolbar */}
            {editable && (
                <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/[0.02]">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("bold") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Bold"
                        type="button"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("italic") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Italic"
                        type="button"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("strike") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Strike"
                        type="button"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("bulletList") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Bullet List"
                        type="button"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("orderedList") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Ordered List"
                        type="button"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${editor.isActive("taskList") ? "bg-white/10 text-white" : "text-white/60"
                            }`}
                        title="Task List"
                        type="button"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Editor Content */}
            <div className="p-3">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
        /* Custom TipTap Styles for Glassmorphism */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
          height: 0;
        }
        
        /* List Styles */
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
        }
        
        /* Task List Styles */
        ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.15rem;
          user-select: none;
        }
        ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        ul[data-type="taskList"] input[type="checkbox"] {
            appearance: none;
            background-color: rgba(255, 255, 255, 0.1);
            margin: 0;
            cursor: pointer;
            width: 1.25em;
            height: 1.25em;
            position: relative;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: grid;
            place-content: center;
        }       
        ul[data-type="taskList"] input[type="checkbox"]::before {
            content: "";
            width: 0.65em;
            height: 0.65em;
            transform: scale(0);
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1em 1em white; 
            transform-origin: center;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        ul[data-type="taskList"] input[type="checkbox"]:checked::before {
            transform: scale(1);
        }

        /* Spacing */
        .ProseMirror > * + * {
          margin-top: 0.75em;
        }
      `}</style>
        </div>
    )
}

export default RichTextEditor
