/**
 * ContextOne Chat Widget
 * Embeddable AI chatbot widget for websites
 * Version: 1.0.0
 */
(function() {
  'use strict';

  // Configuration
  const config = window.ContextOneConfig || {};
  const projectId = config.projectId;
  const apiKey = config.apiKey;
  const apiUrl = config.apiUrl || 'http://localhost:8000';
  const primaryColor = config.primaryColor || '#3B82F6';
  const position = config.position || 'bottom-right';

  if (!projectId || !apiKey) {
    console.error('ContextOne: projectId and apiKey are required');
    return;
  }

  // State
  let isOpen = false;
  let conversationId = null;
  let messages = [];

  // Create widget HTML
  const createWidget = () => {
    const container = document.createElement('div');
    container.id = 'contextone-widget';
    container.className = `contextone-widget-${position}`;

    container.innerHTML = `
      <style>
        .contextone-widget-bottom-right {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .contextone-widget-bottom-left {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .contextone-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${primaryColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .contextone-bubble:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        .contextone-bubble svg {
          width: 28px;
          height: 28px;
        }
        .contextone-window {
          position: fixed;
          bottom: 100px;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        .contextone-widget-bottom-right .contextone-window {
          right: 20px;
        }
        .contextone-widget-bottom-left .contextone-window {
          left: 20px;
        }
        .contextone-window.open {
          display: flex;
        }
        .contextone-header {
          background: ${primaryColor};
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .contextone-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .contextone-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .contextone-close:hover {
          background: rgba(255,255,255,0.2);
        }
        .contextone-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
        }
        .contextone-message {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
        }
        .contextone-message.user {
          align-items: flex-end;
        }
        .contextone-message.assistant {
          align-items: flex-start;
        }
        .contextone-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }
        .contextone-message.user .contextone-message-content {
          background: ${primaryColor};
          color: white;
        }
        .contextone-message.assistant .contextone-message-content {
          background: white;
          color: #1f2937;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .contextone-typing {
          display: none;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          width: fit-content;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .contextone-typing.show {
          display: block;
        }
        .contextone-typing span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          margin: 0 2px;
          animation: contextone-bounce 1.4s infinite ease-in-out;
        }
        .contextone-typing span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .contextone-typing span:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes contextone-bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        .contextone-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }
        .contextone-input {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .contextone-input:focus {
          border-color: ${primaryColor};
        }
        .contextone-send {
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .contextone-send:hover:not(:disabled) {
          opacity: 0.9;
        }
        .contextone-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .contextone-sources {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
        }
        .contextone-sources a {
          color: ${primaryColor};
          text-decoration: none;
        }
      </style>

      <div class="contextone-bubble" id="contextone-bubble">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      <div class="contextone-window" id="contextone-window">
        <div class="contextone-header">
          <h3>Chat with us</h3>
          <button class="contextone-close" id="contextone-close">&times;</button>
        </div>
        <div class="contextone-messages" id="contextone-messages">
          <div class="contextone-message assistant">
            <div class="contextone-message-content">
              Hi! How can I help you today?
            </div>
          </div>
        </div>
        <div class="contextone-typing" id="contextone-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="contextone-input-container">
          <input
            type="text"
            class="contextone-input"
            id="contextone-input"
            placeholder="Ask a question..."
            autocomplete="off"
          />
          <button class="contextone-send" id="contextone-send">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  };

  // Add message to UI
  const addMessage = (role, content, sources) => {
    const messagesContainer = document.getElementById('contextone-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `contextone-message ${role}`;

    let sourcesHtml = '';
    if (sources && sources.length > 0) {
      sourcesHtml = `<div class="contextone-sources">Sources: ${sources.map(s => s.doc_name).join(', ')}</div>`;
    }

    messageDiv.innerHTML = `
      <div class="contextone-message-content">${content}</div>
      ${sourcesHtml}
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Show typing indicator
  const showTyping = (show) => {
    const typing = document.getElementById('contextone-typing');
    if (show) {
      typing.classList.add('show');
    } else {
      typing.classList.remove('show');
    }
  };

  // Send message to API
  const sendMessage = async (message) => {
    const sendBtn = document.getElementById('contextone-send');
    const input = document.getElementById('contextone-input');

    // Disable input
    sendBtn.disabled = true;
    input.disabled = true;

    // Add user message to UI
    addMessage('user', message);

    // Clear input
    input.value = '';

    // Show typing
    showTyping(true);

    try {
      const response = await fetch(`${apiUrl}/api/widget/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          query: message,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Update conversation ID
      conversationId = data.conversation_id;

      // Hide typing
      showTyping(false);

      // Add assistant response
      addMessage('assistant', data.answer, data.sources);

    } catch (error) {
      console.error('ContextOne Error:', error);
      showTyping(false);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      // Re-enable input
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  };

  // Event handlers
  const attachEvents = () => {
    const bubble = document.getElementById('contextone-bubble');
    const window = document.getElementById('contextone-window');
    const closeBtn = document.getElementById('contextone-close');
    const sendBtn = document.getElementById('contextone-send');
    const input = document.getElementById('contextone-input');

    bubble.addEventListener('click', () => {
      isOpen = !isOpen;
      window.classList.toggle('open', isOpen);
      if (isOpen) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      window.classList.remove('open');
    });

    sendBtn.addEventListener('click', () => {
      const message = input.value.trim();
      if (message) {
        sendMessage(message);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = input.value.trim();
        if (message) {
          sendMessage(message);
        }
      }
    });
  };

  // Initialize widget
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createWidget();
        attachEvents();
      });
    } else {
      createWidget();
      attachEvents();
    }
  };

  init();
})();
