import { fetchData } from './api.js';
import { addChatBubble } from './utils.js';

let activeSession = null;
let chatSessions = {};

function handleSessionClick(sessionElement) {
    if (activeSession) {
      activeSession.classList.remove('active');
      chatSessions[activeSession.textContent].style.display = 'none';
    }

    activeSession = sessionElement;
    activeSession.classList.add('active');
    chatSessions[activeSession.textContent].style.display = 'block';
  }

document.getElementById('chatInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('sendButton').click();
    e.preventDefault(); // prevent form submission
  }
});

document.getElementById('sendButton').addEventListener('click', async function () {
    const input = document.getElementById('chatInput');

    const health = await fetchData('http://localhost:8000/health');
    console.log(health.status);

    addChatBubble(input.value, 'user', activeSession);
    const question = input.value;
    console.log(question);

    const response = await fetchData(url = 'http://localhost:8000/api/chat', method = 'POST', body = { question });

    const answer = response.answer;
    const sources = response.sources;
    const bubbleContent = `${answer}<br><br>Sources: ${sources}`;

    addChatBubble(bubbleContent, 'bot', activeSession);

    if (!activeSession.stored) {
      console.log('Storing chat session', activeSession.id, activeSession.dataset.timestamp, activeSession.dataset.title)
      // Store the chat session in the backend
      const storeResponse = await fetchData('/db/store-session', 'POST', {
        id: activeSession.id,
        timestamp: activeSession.dataset.timestamp,
        title: activeSession.dataset.title,
      });

      if (storeResponse.ok) {
        console.log('Marking chat session as stored')
        activeSession.stored = 'true';
      } else {
        logrust.Error('Failed to store chat session', err);
      }
    } else {
      console.log('Chat session already stored', activeSession.id);
    }


    const ok = await fetchData('/db/store-result', 'POST', { question, answer, sources, chatid: activeSession.id });
    console.log(ok);
    input.value = '';
  });

  document.getElementById('newChatButton').addEventListener('click', async function () {
    try {
      const response = await fetchData('/newchat');
      console.log(response);
      const { id, timestamp, title } = response;
      const sessionName = title + ' ' + timestamp;
      const sessionId = id;

      // Create a new chat session element
      const sessionElement = document.createElement('div');
      sessionElement.textContent = sessionName;
      sessionElement.id = sessionId;
      sessionElement.dataset.timestamp = timestamp;
      sessionElement.dataset.title = title;
      sessionElement.className = 'chatSession';
      document.getElementById('chatList').appendChild(sessionElement);

      // Add click event listener to the new chat session element
      sessionElement.addEventListener('click', function () {
        handleSessionClick(sessionElement);
      });

      // Create a new chat history element
      const historyElement = document.createElement('div');
      historyElement.style.display = 'none';
      document.getElementById('chatHistory').appendChild(historyElement);
      chatSessions[sessionName] = historyElement;

      sessionElement.click();

    } catch (error) {
      console.error(error);
    }

  });

  window.addEventListener('DOMContentLoaded', async function () {
    try {
      const sessions = await fetchData('db/fetch-sessions');

      if (sessions === null) {
        // Handle the case when the response data is null
        console.log('No chat sessions found.');
        // You can display a message or perform any other action here
        return;
      }

      // check if the length of response is bigger or equal to 1
      if (sessions.length >= 1) {
        console.log('Found chat sessions:', sessions.length);
      }

      console.log("loading sessions ");


      sessions.forEach(session => {
        const { id, title, timestamp } = session;
        const sessionName = title + ' ' + timestamp;

        const sessionElement = document.createElement('div');
        sessionElement.textContent = sessionName;
        sessionElement.id = id;
        sessionElement.className = 'chatSession';
        document.getElementById('chatList').appendChild(sessionElement);

        sessionElement.addEventListener('click', function () {
          handleSessionClick(sessionElement);
        });

        const historyElement = document.createElement('div');
        historyElement.style.display = 'none';
        document.getElementById('chatHistory').appendChild(historyElement);
        chatSessions[sessionName] = historyElement;
      });

      const firstSessionElement = document.querySelector('.chatSession');
      if (firstSessionElement) {
        handleSessionClick(firstSessionElement);
      }

    // Create and click an initial chat session
    document.getElementById('newChatButton').click();
    } catch (error) {
      console.error(error);
    }
  });

