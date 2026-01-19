import axios from "axios";

// Create a dedicated axios instance for the chatbot service
const chatbotClient = axios.create({
    baseURL: import.meta.env.CONTENT_CHATBOT_API_URL || "http://localhost:8000",
});

const chatbotApi = {
    sendMessage: (payload) => {
        return chatbotClient.post("/chatbot/chat/v2", payload);
    },
};

export default chatbotApi;
