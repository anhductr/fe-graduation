import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

import { chatbotApi } from '../../services/chatbotApi';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I help you today?", role: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [capabilities, setCapabilities] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let sid = sessionStorage.getItem('chat_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            sessionStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleSendMessage = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const textToSend = textOverride || inputValue;

        if (!textToSend.trim() || isLoading) return;

        const userMessageText = textToSend;
        const newUserMessage = {
            id: Date.now(),
            text: userMessageText,
            role: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);
        setCapabilities(null);

        try {
            const response = await chatbotApi.chat({
                user_id: user?._id || "guest",
                query: userMessageText,
                session_id: sessionId,
                top_k: 5
            });

            const botResponse = {
                id: Date.now() + 1,
                text: response.answer,
                role: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);

            if (response.capabilities) {
                setCapabilities(response.capabilities);
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorResponse = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                role: 'bot'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapabilityClick = (key, label) => {
        handleSendMessage(null, label);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <FaRobot className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg leading-tight">Assistant</h3>
                                    <span className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Close chat"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {message.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {message.role === 'user' ? (
                                            message.text
                                        ) : (
                                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                                                <ReactMarkdown
                                                    components={{
                                                        strong: ({ node, ...props }) => <span className="font-bold text-indigo-600" {...props} />
                                                    }}
                                                >
                                                    {message.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Capabilities Chips */}
                            {capabilities && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-10 mb-2">
                                    {Object.entries(capabilities).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleCapabilityClick(key, label)}
                                            className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-xs rounded-full hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex items-start gap-2 mr-auto mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <FaRobot size={14} />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm py-1"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className={`p-2 rounded-full transition-all ${inputValue.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105 active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <FaPaperPlane size={14} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-indigo-500/30 text-white flex items-center justify-center text-2xl hover:shadow-xl transition-all"
                aria-label="Toggle chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FaTimes />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FaComments />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default Chatbot;
