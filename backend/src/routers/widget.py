from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from supabase import Client
from ..dependencies.database import get_supabase

router = APIRouter()

@router.get("/widget/{project_id}/config")
async def get_widget_config(project_id: str, x_api_key: str = Header(None), supabase: Client = Depends(get_supabase)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    key_response = supabase.table("api_keys").select("tenant_id").eq("key", x_api_key).eq("is_active", True).execute()
    if not key_response.data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    tenant_id = key_response.data[0]["tenant_id"]
    
    project_response = supabase.table("projects").select("*").eq("project_id", project_id).eq("tenant_id", tenant_id).execute()
    if not project_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = project_response.data[0]
    
    return {
        "project_id": project["project_id"],
        "name": project["name"],
        "welcome_message": project["welcome_message"],
        "ui_config": project["ui_config"]
    }

@router.get("/widget.js")
async def get_widget_js():
    widget_js = '''
(function() {
    const WIDGET_STYLES = `
        .ctx-widget-container { position: fixed; z-index: 9999; font-family: 'Inter', sans-serif; }
        .ctx-widget-container.bottom-right { bottom: 20px; right: 20px; }
        .ctx-widget-container.bottom-left { bottom: 20px; left: 20px; }
        .ctx-widget-button { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s; }
        .ctx-widget-button:hover { transform: scale(1.05); }
        .ctx-widget-button svg { width: 28px; height: 28px; fill: white; }
        .ctx-widget-chat { position: absolute; bottom: 70px; right: 0; width: 380px; height: 500px; background: #0B0E14; border: 1px solid #2D3748; border-radius: 12px; display: none; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .ctx-widget-chat.open { display: flex; }
        .ctx-widget-header { padding: 16px; background: #151921; border-bottom: 1px solid #2D3748; display: flex; align-items: center; justify-content: space-between; }
        .ctx-widget-header h3 { margin: 0; color: white; font-size: 16px; font-weight: 600; }
        .ctx-widget-close { background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 20px; }
        .ctx-widget-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .ctx-widget-message { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
        .ctx-widget-message.user { background: #6366F1; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ctx-widget-message.assistant { background: #1F2937; color: #E5E7EB; align-self: flex-start; border-bottom-left-radius: 4px; }
        .ctx-widget-input-area { padding: 12px; border-top: 1px solid #2D3748; display: flex; gap: 8px; }
        .ctx-widget-input { flex: 1; padding: 10px 14px; border: 1px solid #2D3748; border-radius: 8px; background: #151921; color: white; font-size: 14px; outline: none; }
        .ctx-widget-input:focus { border-color: #6366F1; }
        .ctx-widget-send { padding: 10px 16px; background: #6366F1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .ctx-widget-send:hover { background: #5558E3; }
        .ctx-widget-send:disabled { opacity: 0.5; cursor: not-allowed; }
    `;

    class ContextOneWidget {
        constructor(config) {
            this.projectId = config.projectId;
            this.apiKey = config.apiKey;
            this.apiUrl = config.apiUrl || window.location.origin;
            this.position = config.position || 'bottom-right';
            this.primaryColor = config.primaryColor || '#6366F1';
            this.messages = [];
            this.init();
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.loadConfig();
        }

        injectStyles() {
            const style = document.createElement('style');
            style.textContent = WIDGET_STYLES;
            document.head.appendChild(style);
        }

        createWidget() {
            this.container = document.createElement('div');
            this.container.className = `ctx-widget-container ${this.position}`;
            this.container.innerHTML = `
                <div class="ctx-widget-chat">
                    <div class="ctx-widget-header">
                        <h3>AI Assistant</h3>
                        <button class="ctx-widget-close">&times;</button>
                    </div>
                    <div class="ctx-widget-messages"></div>
                    <div class="ctx-widget-input-area">
                        <input type="text" class="ctx-widget-input" placeholder="Type your message..." />
                        <button class="ctx-widget-send">Send</button>
                    </div>
                </div>
                <button class="ctx-widget-button" style="background: ${this.primaryColor}">
                    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                </button>
            `;
            document.body.appendChild(this.container);
            this.bindEvents();
        }

        bindEvents() {
            const btn = this.container.querySelector('.ctx-widget-button');
            const chat = this.container.querySelector('.ctx-widget-chat');
            const close = this.container.querySelector('.ctx-widget-close');
            const input = this.container.querySelector('.ctx-widget-input');
            const send = this.container.querySelector('.ctx-widget-send');

            btn.onclick = () => chat.classList.toggle('open');
            close.onclick = () => chat.classList.remove('open');
            send.onclick = () => this.sendMessage();
            input.onkeypress = (e) => e.key === 'Enter' && this.sendMessage();
        }

        async loadConfig() {
            try {
                const res = await fetch(`${this.apiUrl}/api/widget/${this.projectId}/config`, {
                    headers: { 'X-API-Key': this.apiKey }
                });
                if (res.ok) {
                    const config = await res.json();
                    this.container.querySelector('.ctx-widget-header h3').textContent = config.name || 'AI Assistant';
                    if (config.welcome_message) {
                        this.addMessage('assistant', config.welcome_message);
                    }
                }
            } catch (e) { console.error('Widget config error:', e); }
        }

        addMessage(role, content) {
            const messages = this.container.querySelector('.ctx-widget-messages');
            const msg = document.createElement('div');
            msg.className = `ctx-widget-message ${role}`;
            msg.textContent = content;
            messages.appendChild(msg);
            messages.scrollTop = messages.scrollHeight;
        }

        async sendMessage() {
            const input = this.container.querySelector('.ctx-widget-input');
            const send = this.container.querySelector('.ctx-widget-send');
            const query = input.value.trim();
            if (!query) return;

            this.addMessage('user', query);
            input.value = '';
            send.disabled = true;

            try {
                const res = await fetch(`${this.apiUrl}/api/widget/${this.projectId}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
                    body: JSON.stringify({ query, conversation_history: [] })
                });
                const data = await res.json();
                this.addMessage('assistant', data.answer || 'Sorry, I could not process that.');
            } catch (e) {
                this.addMessage('assistant', 'Error connecting to the server.');
            }
            send.disabled = false;
        }
    }

    window.ContextOneWidget = ContextOneWidget;
})();
'''
    return StreamingResponse(
        iter([widget_js]),
        media_type="application/javascript",
        headers={"Content-Disposition": "inline; filename=widget.js"}
    )