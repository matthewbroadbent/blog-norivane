import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Type
} from 'lucide-react'

interface TipTapEditorProps {
  content: any
  onChange: (content: any) => void
  placeholder?: string
}

export function TipTapEditor({ content, onChange, placeholder = "Start writing..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'youtube-embed',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
        placeholder,
      },
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL:')
    if (url && editor) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      })
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`editor-button ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`editor-button ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`editor-button ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`editor-button ${editor.isActive('code') ? 'active' : ''}`}
          title="Inline Code"
        >
          <Code size={16} />
        </button>

        <div className="editor-separator" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`editor-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`editor-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`editor-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`editor-button ${editor.isActive('paragraph') ? 'active' : ''}`}
          title="Paragraph"
        >
          <Type size={16} />
        </button>

        <div className="editor-separator" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`editor-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`editor-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`editor-button ${editor.isActive('blockquote') ? 'active' : ''}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>

        <div className="editor-separator" />

        <button
          onClick={addLink}
          className={`editor-button ${editor.isActive('link') ? 'active' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        
        <button
          onClick={addImage}
          className="editor-button"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>
        
        <button
          onClick={addYoutube}
          className="editor-button"
          title="Add YouTube Video"
        >
          <YoutubeIcon size={16} />
        </button>

        <div className="editor-separator" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="editor-button"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="editor-button"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
