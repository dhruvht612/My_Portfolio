function ChatWidget({ chatOpen, toggleChat, chatMessages, chatInput, onChatInputChange, onChatSend, chatMessagesRef }) {
  return (
    <div id="chat-widget" className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={toggleChat}
        className="bg-[var(--color-orange)] text-white p-3 rounded-full shadow-lg text-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-orange)]/50"
        aria-expanded={chatOpen}
        aria-controls="chat-box"
      >
        💬
      </button>
      {chatOpen && (
        <div id="chat-box" className="mt-3 w-80 h-96 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl flex flex-col">
          <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-3 text-sm space-y-2">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`px-3 py-2 rounded-lg max-w-[80%] ${
                  message.from === 'bot' ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] self-start' : 'bg-[var(--color-orange)] text-white self-end ml-auto'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex border-t border-[var(--color-border)]">
            <input
              id="chat-input"
              type="text"
              placeholder="Type..."
              className="flex-1 p-2 bg-gray-800 text-white outline-none"
              value={chatInput}
              onChange={onChatInputChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onChatSend()
                }
              }}
            />
            <button type="button" onClick={onChatSend} className="bg-[var(--color-orange)] px-4 text-white">
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget

