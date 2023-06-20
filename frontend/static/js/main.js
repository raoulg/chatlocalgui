import { fetchData } from './api.js';

let activeSession = null;
let chatSessions = {};

function handleSessionClick(sessionElement) {
    if (activeSession) {
        activeSession.classList.remove('active');
        chatSessions[activeSession.id].style.display = 'none';
    }

    activeSession = sessionElement;
    activeSession.classList.add('active');
    chatSessions[activeSession.id].style.display = 'block';
}

document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('sendButton').click();
        e.preventDefault(); // prevent form submission
    }
});

document.getElementById('sendButton').addEventListener('click', async function () {
    const input = document.getElementById('chatInput');
    const question = input.value;
    input.value = '';

    const health = await fetchData('http://localhost:8000/health');
    console.log(health.status);

    addChatBubble(question, 'user', activeSession);
    console.log(question);

    const response = await fetchData('http://localhost:8000/api/chat','POST', { question });

    const answer = response.answer;
    const sources = response.sources;
    const bubbleContent = `${answer}<br><br>Sources: ${sources}`;

    addChatBubble(bubbleContent, 'bot', activeSession);
    console.log("stored: ", activeSession.dataset.stored);

    if (activeSession.dataset.stored === 'false') {
        console.log('Storing chat session', activeSession.id, activeSession.dataset.timestamp, activeSession.dataset.title)
        // Store the chat session in the backend
        const storeResponse = await fetchData('/db/store-session', 'POST', {
            id: activeSession.id,
            timestamp: activeSession.dataset.timestamp,
            title: activeSession.dataset.title,
        });

        console.log('Marking chat session as stored', activeSession)
        activeSession.dataset.stored = 'true';
        console.log("stored: ", activeSession.dataset.stored);

    } else {
        console.log('Chat session already stored', activeSession.id);
    }


    const storeresult = await fetchData('db/store-result', 'POST', {
        chatid : activeSession.id,
        question : question,
        answer : answer,
        source: sources
    });
    console.log(storeresult);
    console.log("stored chat")

});

document.getElementById('newChatButton').addEventListener('click', async function () {
    try {
        const response = await fetchData('/newchat');
        console.log(response);
        const { id, timestamp, title } = response;
        const sessionName = title + ' ' + timestamp;
        // const sessionId = id;

        // Create a new chat session element
        const sessionElement = document.createElement('div');
        sessionElement.textContent = sessionName;
        sessionElement.id = id;
        sessionElement.dataset.timestamp = timestamp;
        sessionElement.dataset.title = title;
        sessionElement.dataset.stored = 'false';
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
        chatSessions[id] = historyElement;

        sessionElement.click();

    } catch (error) {
        console.error(error);
    }

});

window.addEventListener('DOMContentLoaded', async function () {
    try {
        console.log("starting DOMContentLoaded")
        const sessions = await fetchData('db/fetch-sessions');

        if (sessions === null) {
            // Handle the case when the response data is null
            console.log('No chat sessions found.');
            document.getElementById('newChatButton').click();
            // You can display a message or perform any other action here
            return;
        }
        // check if the length of response is bigger or equal to 1
        if (sessions.length >= 1) {
            console.log('Found chat sessions:', sessions.length);
        }

        console.log("loading sessions", sessions);


        sessions.forEach(session => {
            const { id, title, timestamp } = session;
            const sessionName = title + ' ' + timestamp;

            // Create a new chat session element
            const sessionElement = document.createElement('div');
            sessionElement.textContent = sessionName;
            sessionElement.id = id;
            sessionElement.dataset.timestamp = timestamp;
            sessionElement.dataset.title = title;
            sessionElement.dataset.stored = 'true';
            sessionElement.className = 'chatSession';

            // append the new chat session element to the chat list
            document.getElementById('chatList').appendChild(sessionElement);

            // Add click event listener to the new chat session element
            sessionElement.addEventListener('click', async function () {
                handleSessionClick(sessionElement);

                // Check if the chat history is already loaded
                const historyElement = chatSessions[id];
                if (historyElement.childElementCount > 0) {
                    console.log("history already loaded ")
                    return;
                }

                // Fetch chat history for the clicked session from the server
                const history = await fetchChatHistory(sessionElement.id);
                console.log("history: ", history);

                // Add chat bubbles for each message in the history
                history.forEach((message) => {
                    addChatBubble(message.Question, 'user', sessionElement);
                    addChatBubble(message.Answer, 'bot', sessionElement);
                });
            });

            const historyElement = document.createElement('div');
            historyElement.style.display = 'none';
            document.getElementById('chatHistory').appendChild(historyElement);
            chatSessions[id] = historyElement;
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

async function fetchChatHistory(chatId) {
    try {
        const response = await fetchData(`db/fetch-chat-history?chatId=${chatId}`);
        if (response === null) {
            console.log('No chat history found.');
            return [];
        }
        return response;
    } catch (error) {
        console.log("error", error);
        return [];
    }
}

function addChatBubble(text, sender, sessionElement) {
    const bubble = document.createElement('div');
    bubble.className = `chatBubble ${sender}`;
    bubble.innerHTML = text;
    chatSessions[sessionElement.id].appendChild(bubble);
}