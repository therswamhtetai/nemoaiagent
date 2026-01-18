"use client"

import { useEditor, EditorContent } from "@tiptap/react"
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
        content: content,
        editable: editable,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[150px] text-sm text-white/90 custom-scrollbar-dark",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
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
