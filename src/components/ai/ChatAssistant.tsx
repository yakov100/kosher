'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import { Bot, Send, X, Sparkles, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const WELCOME_MESSAGE = 'שלום! 👋 אני קושר, העוזר האישי שלך. אני כאן לעזור לך לעקוב אחרי ההליכה והמשקל, לתת טיפים ולענות על שאלות. במה אוכל לעזור?'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // Send message to API
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return

    // Abort any ongoing request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
    }

    // Add user message and clear input
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const assistantMessageId = `assistant-${Date.now()}`
      let assistantContent = ''

      // Add empty assistant message
      setMessages(prev => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ])

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content: assistantContent }
              : m
          )
        )
      }

      // If no content was received, show error
      if (!assistantContent.trim()) {
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId))
        throw new Error('No response received')
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was aborted, ignore
      }
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת ההודעה')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  // Handle form submission
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Clear chat history
  const handleClearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  // Retry last message
  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
      // Remove the last assistant message if it exists
      setMessages(prev => {
        const lastIndex = prev.length - 1
        if (prev[lastIndex]?.role === 'assistant') {
          return prev.slice(0, lastIndex)
        }
        return prev
      })
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Close chat
  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Check if submit is disabled
  const isSubmitDisabled = isLoading || !input.trim()

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? 'סגור צ\'אט' : 'פתח צ\'אט'}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-24 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform",
          "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          isOpen && "rotate-90 opacity-0 pointer-events-none scale-0"
        )}
      >
        <Sparkles size={24} aria-hidden="true" />
      </button>

      {/* Chat Window */}
      <div
        role="dialog"
        aria-label="צ'אט עם העוזר האישי"
        aria-hidden={!isOpen}
        className={cn(
          "fixed bottom-24 left-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh]",
          "flex flex-col bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)]",
          "transition-all duration-300 origin-bottom-left overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--primary)] text-white shadow-sm">
              <Bot size={20} aria-hidden="true" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-[var(--foreground)] text-sm">קושר - העוזר האישי</h3>
              <p className="text-xs text-[var(--muted-foreground)]">מוכן לעזור לך</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                aria-label="נקה היסטוריה"
                title="נקה היסטוריה"
                className="p-2 hover:bg-[var(--card-hover)] rounded-full transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={closeChat}
              aria-label="סגור צ'אט"
              className="p-2 hover:bg-[var(--card-hover)] rounded-full transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] bg-[var(--background)]/50"
          role="log"
          aria-live="polite"
          aria-label="הודעות צ'אט"
        >
          {/* Welcome message when no messages */}
          {messages.length === 0 && !isLoading && (
            <div className="space-y-4">
              <div className="text-center py-6 space-y-3">
                <div className="inline-block p-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Sparkles size={32} aria-hidden="true" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm bg-[var(--card)] text-[var(--foreground)] rounded-bl-none border border-[var(--border)]">
                  {WELCOME_MESSAGE}
                </div>
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                  message.role === 'user'
                    ? "bg-[var(--primary)] text-black rounded-br-none"
                    : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-none border border-[var(--border)]"
                )}
                dir="rtl"
              >
                {message.content || (
                  <span className="text-gray-400">...</span>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-[var(--card)] p-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center border border-[var(--border)] shadow-sm">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100 space-y-2">
              <p>😔 {error}</p>
              {messages.length > 0 && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  נסה שוב
                </button>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Input form */}
        <div className="p-4 border-t bg-[var(--card)] shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="כתוב הודעה..."
              dir="rtl"
              disabled={isLoading}
              aria-label="כתוב הודעה"
              maxLength={2000}
              className={cn(
                "flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-right text-[var(--foreground)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
                "placeholder:text-[var(--muted-foreground)] transition-all",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            />
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label="שלח הודעה"
              className={cn(
                "p-2.5 rounded-xl transition-all shrink-0",
                isSubmitDisabled
                  ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
                  : "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] shadow-md shadow-[var(--primary)]/20 active:scale-95"
              )}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={18} className="rotate-180" aria-hidden="true" />
              )}
            </button>
          </form>
          
          {/* Character count when typing */}
          {input.length > 1500 && (
            <p className="text-xs text-gray-400 text-left mt-1">
              {input.length}/2000
            </p>
          )}
        </div>
      </div>
    </>
  )
}
