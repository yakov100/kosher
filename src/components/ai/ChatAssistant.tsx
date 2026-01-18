'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import { Bot, Send, X, Sparkles, Trash2, RefreshCw, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const WELCOME_MESSAGE = 'שלום! 👋 אני קושר, העוזר האישי שלך. אני כאן לעזור לך לעקוב אחרי ההליכה והמשקל, לתת טיפים ולענות על שאלות. במה אוכל לעזור?'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isAnimating?: boolean
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
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
      setUnreadCount(0) // Clear unread when opening
    }
  }, [messages, isOpen, scrollToBottom])

  // Track unread messages
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1)
      }
    }
  }, [messages, isOpen])

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

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
    }

    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const assistantMessageId = `assistant-${Date.now()}`
      let assistantContent = ''

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }])

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          )
        )
      }

      if (!assistantContent.trim()) {
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId))
        throw new Error('לא התקבלה תגובה מהשרת')
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת ההודעה')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (lastUserMessage) {
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
      {/* Floating Toggle Button - מעל כפתור ההגדרות */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? 'סגור צ\'אט' : 'פתח צ\'אט'}
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-[92px] left-6 z-50",
          "w-14 h-14 rounded-full",
          "flex items-center justify-center",
          "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
          "shadow-lg hover:shadow-xl hover:shadow-emerald-500/30",
          "transition-all duration-300 transform",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          isOpen && "rotate-180 opacity-0 pointer-events-none scale-0"
        )}
      >
        <MessageCircle size={24} aria-hidden="true" className="drop-shadow-md" />
        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        role="dialog"
        aria-label="צ'אט עם העוזר האישי"
        aria-hidden={!isOpen}
        className={cn(
          "fixed bottom-[100px] left-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] h-[500px] max-h-[calc(100vh-120px)]",
          "flex flex-col glass rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/20",
          "transition-all duration-500 origin-bottom-left overflow-hidden backdrop-blur-xl",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 pointer-events-none translate-y-4"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)'
        }}
      >
        {/* Header - כותרת עם כפתורים */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 pt-8 pb-3 flex items-center justify-between shadow-lg rounded-t-3xl">
          {/* כותרת */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md animate-pulse">
              <Sparkles size={22} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <h2 className="text-base font-bold text-white drop-shadow-md">קושר AI</h2>
              <p className="text-[10px] text-white/90 font-medium leading-tight">העוזר האישי שלך</p>
            </div>
          </div>
          
          {/* כפתורים */}
          <div className="flex gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                aria-label="מחק שיחה"
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 border border-white/40"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={closeChat}
              aria-label="סגור צ'אט"
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 border border-white/40"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div 
          className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[350px] relative"
          role="log"
          aria-live="polite"
          aria-label="הודעות צ'אט"
          style={{
            background: 'linear-gradient(180deg, rgba(249,250,251,0.5) 0%, rgba(243,244,246,0.3) 100%)'
          }}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          
          {/* Welcome message when no messages */}
          {messages.length === 0 && !isLoading && (
            <div className="space-y-4 relative animate-fadeIn">
              <div className="text-center py-8 space-y-4">
                <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-500/10 animate-bounce-slow">
                  <Sparkles size={36} aria-hidden="true" className="drop-shadow-md" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg bg-white/90 text-[var(--foreground)] rounded-br-none border border-emerald-100 backdrop-blur-sm animate-slideInLeft">
                  {WELCOME_MESSAGE}
                </div>
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full relative animate-slideInUp",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards'
              }}
            >
              <div
                className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 hover:scale-[1.02]",
                  message.role === 'user'
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-md shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                    : "bg-white/90 text-[var(--foreground)] rounded-br-md border border-gray-100 shadow-md hover:shadow-lg backdrop-blur-sm"
                )}
                dir="rtl"
              >
                {message.content || (
                  <span className="text-gray-400 animate-pulse">...</span>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start animate-slideInLeft">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl rounded-br-md flex gap-2 items-center border border-emerald-100 shadow-md">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce" />
                <span className="text-xs text-emerald-600 mr-1 font-medium">מקליד...</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 text-red-600 text-sm rounded-2xl text-center border border-red-200 shadow-lg space-y-3 animate-shake">
              <p className="font-medium flex items-center justify-center gap-2">
                <span className="text-2xl">😔</span>
                {error}
              </p>
              {messages.length > 0 && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 text-xs bg-white hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
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
        <div className="p-5 border-t border-white/30 bg-white/50 backdrop-blur-sm shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="כתוב הודעה..."
              dir="rtl"
              disabled={isLoading}
              autoComplete="off"
              aria-label="כתוב הודעה"
              maxLength={2000}
              className={cn(
                "flex-1 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl px-5 py-3 text-sm text-right text-[var(--foreground)]",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white",
                "placeholder:text-gray-400 transition-all duration-200",
                "shadow-sm hover:shadow-md",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            />
            <button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label="שלח הודעה"
              className={cn(
                "p-3.5 rounded-2xl transition-all duration-200 shrink-0",
                isSubmitDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
              )}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={20} className="rotate-180" aria-hidden="true" />
              )}
            </button>
          </form>
          
          {/* Character count when typing */}
          {input.length > 1500 && (
            <p className="text-xs text-gray-500 text-left mt-2 font-medium">
              {input.length}/2000
            </p>
          )}
        </div>
      </div>
    </>
  )
}
