
import { v4 as uuidv4 } from 'uuid';

export const getOrCreateConversationId = () => {
    // 1. Thử lấy ID đã lưu trong localStorage
    let conversationId = localStorage.getItem('chat_conversation_id');
    // 2. Nếu chưa có (người dùng mới), tạo một UUID mới
    if (!conversationId) {
        conversationId = uuidv4();
        localStorage.setItem('chat_conversation_id', conversationId);
    }
    return conversationId;
};
