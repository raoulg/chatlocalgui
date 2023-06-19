export function addChatBubble(text, sender, sessionElement) {
    const bubble = document.createElement('div');
    bubble.className = `chatBubble ${sender}`;
    bubble.innerHTML = text;
    chatSessions[sessionElement.textContent].appendChild(bubble);
  }
