import axios from 'axios';

const chatbotClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatbotApi = {
    chat: async (payload) => {
        const response = await chatbotClient.post('/chatbot/chat', payload);
        return response.data;
    },
};
