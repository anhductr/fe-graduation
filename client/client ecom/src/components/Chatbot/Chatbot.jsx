import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaInfoCircle, FaBoxOpen, FaExchangeAlt } from 'react-icons/fa';
import chatbotApi from '../../services/chatbotApi';

import { getSuggestedProductsByIds, getCateUnderRoot } from '../../services/searchApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

import { getOrCreateConversationId } from '../../utils/conversationUtils';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Xin chào! Tôi có thể giúp gì cho bạn? Tôi có thể tư vấn về sản phẩm, chính sách, hoặc hỗ trợ khách hàng.",

            quick_actions: [{ label: "Xem danh mục", action: "view_categories" }, { label: "Chat trực tiếp", action: "direct_chat" }]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Get conversation ID on component mount
    const [conversationId] = useState(() => getOrCreateConversationId());

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleNavigateToProduct = (productId, productName) => {
        // Construct a slug for the URL (cosmetic) and pass ID in state
        const slug = productName ? productName.toLowerCase().replace(/\s+/g, '-') : `product-${productId}`;
        navigate(`/${slug}`, { state: { productId: productId, productName: productName } });
        // Optionally close chat on navigation?
        // setIsOpen(false); 
    };

    const handleSendMessage = async (e, textOverride = null) => {
        if (e) e.preventDefault();
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: text,
            role: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Construct the request body as per V2 spec
            const payload = {
                message: text,
                user_id: "log_gen_user", // TODO: Replace with actual user ID if available
                conversation_id: conversationId
            };

            const response = await chatbotApi.sendMessage(payload);
            const data = response.data;

            if (data.success && data.response) {
                const botRes = data.response;
                const botMessage = {
                    id: Date.now() + 1,
                    text: botRes.message,
                    role: 'bot',
                    type: botRes.type,
                    products: botRes.products,
                    comparison: botRes.comparison,
                    sources: botRes.sources,
                    quick_actions: botRes.quick_actions,
                    policy_type: botRes.policy_type
                };

                // Enrich product data if available
                if (botRes.products && botRes.products.length > 0) {
                    try {
                        const productIds = botRes.products.map(p => p.id);
                        const productsResponse = await getSuggestedProductsByIds({
                            productIds,
                            recomentedType: "chatbot_suggestion",
                            page: 1,
                            size: productIds.length
                        });

                        const fetchedProducts = productsResponse?.result?.productGetVMList ||
                            productsResponse?.content ||
                            productsResponse?.data ||
                            [];

                        let enrichedProducts = [];

                        if (Array.isArray(fetchedProducts)) {
                            enrichedProducts = fetchedProducts;
                        } else if (Array.isArray(fetchedProducts?.items)) {
                            enrichedProducts = fetchedProducts.items;
                        }

                        // Map fetched details back to bot products
                        if (enrichedProducts.length > 0) {
                            botMessage.products = botRes.products.map(bp => {
                                const detailed = enrichedProducts.find(dp => dp.id === bp.id);
                                if (detailed) {
                                    return {
                                        ...bp,
                                        ...detailed, // Merge detailed info
                                        image: detailed.thumbnailUrl ? [detailed.thumbnailUrl] : bp.image, // Prefer thumbnail
                                        price: detailed.price || bp.price,
                                        name: detailed.name || bp.name
                                    };
                                }
                                return bp;
                            });
                        }
                    } catch (err) {
                        console.error("Failed to fetch full product details for chatbot:", err);
                        // Continue with original basic info if fetch fails
                    }
                }

                setMessages(prev => [...prev, botMessage]);
            } else {
                // Fallback for error or unexpected format
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
                    role: 'bot'
                }]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            // Mock response for testing if API fails (Optional: Remove in production)
            // For now, let's just show an error message
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau nhé.",
                role: 'bot'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (action) => {
        if (action.action === 'ask_policy' && action.label) {
            handleSendMessage(null, action.label);
        } else if (action.action === 'view_product' && action.product_id) {
            handleNavigateToProduct(action.product_id, "chi-tiet-san-pham");
        } else if (action.action === 'view_categories') {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Xem danh mục sản phẩm",
                role: 'user'
            }]);
            setIsLoading(true);
            try {
                const response = await getCateUnderRoot();
                const categories = response?.result?.categoryGetVM || [];

                const botMessage = {
                    id: Date.now() + 1,
                    text: "Dưới đây là các danh mục sản phẩm chính của chúng tôi:",
                    role: 'bot',
                    type: 'category_list',
                    categories: categories
                };
                setMessages(prev => [...prev, botMessage]);

            } catch (e) {
                console.error("Error fetching categories", e);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Xin lỗi, không thể lấy danh sách danh mục lúc này.",
                    role: 'bot'
                }]);
            } finally {
                setIsLoading(false);
            }

        } else if (action.action === 'direct_chat') {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Chat trực tiếp",
                role: 'user'
            }]);

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Bạn có thể chat trực tiếp với chúng tôi qua Fanpage: [Facebook FPT Shop](https://www.facebook.com/FPTShopOnline/)",
                    role: 'bot'
                }]);
            }, 500);

        } else if (action.label) {
            handleSendMessage(null, action.label);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderBotContent = (msg) => {
        return (
            <div className="flex flex-col gap-3">
                {/* Text Message */}
                <div className="text-sm leading-relaxed text-gray-800">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 w-full text-xs my-2" {...props} />,
                            th: ({ node, ...props }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold" {...props} />,
                            td: ({ node, ...props }) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-1" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                            strong: ({ node, ...props }) => <span className="font-semibold text-gray-900" {...props} />,
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                </div>

                {/* Product List (Horizontal Scroll) */}
                {msg.products && msg.products.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300">
                        {msg.products.map(product => (
                            <div
                                key={product.id}
                                className="min-w-[200px] w-[200px] bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleNavigateToProduct(product.id, product.name)}
                            >
                                <div className="h-28 bg-gray-100 flex items-center justify-center relative">
                                    {product.image && product.image.length > 0 ? (
                                        <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain p-2" />
                                    ) : product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <FaBoxOpen className="text-gray-300 text-3xl" />
                                    )}
                                    {product.badges && product.badges.includes("Sắp hết hàng") && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Sắp hết</span>
                                    )}
                                </div>
                                <div className="p-2 flex flex-col flex-1">
                                    <h4 className="font-semibold text-xs text-gray-800 line-clamp-2 mb-1" title={product.name}>{product.name}</h4>
                                    <div className="mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-red-600 font-bold text-sm block">{formatPrice(product.price)}</span>
                                            {product.listPrice && product.listPrice > product.price && (
                                                <span className="text-gray-400 text-[10px] line-through">{formatPrice(product.listPrice)}</span>
                                            )}
                                        </div>
                                        <button
                                            className="mt-2 w-full bg-indigo-50 text-indigo-600 text-xs py-1.5 rounded hover:bg-indigo-100 transition font-medium"
                                            onClick={(e) => { e.stopPropagation(); handleNavigateToProduct(product.id, product.name); }}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Comparison Table */}
                {msg.type === 'compare' && msg.comparison && msg.comparison.table && (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs text-left">
                            <thead className="bg-gray-50 font-semibold text-gray-700">
                                <tr>
                                    <th className="px-2 py-2 border-b">Tiêu chí</th>
                                    {msg.comparison.products.map(p => (
                                        <th key={p.id} className="px-2 py-2 border-b">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {msg.comparison.table.map((row, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-2 py-2 font-medium text-gray-600">{row.spec}</td>
                                        {row.values.map((val, vIdx) => (
                                            <td key={vIdx} className="px-2 py-2 text-gray-800">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Sources/Citations */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase">Nguồn tham khảo:</p>
                        <div className="flex flex-col gap-1">
                            {msg.sources.map((source, idx) => (
                                <div key={idx} className="flex items-start gap-1 text-[10px] text-gray-500 bg-gray-50 p-1 rounded">
                                    <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{source.text_preview || `Mục: ${source.chunk_id || source.policy_type}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}





                {/* Custom Category List */}
                {msg.type === 'category_list' && msg.categories && msg.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {msg.categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    navigate(`/search?category=${cat.id}`);
                                }}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FaBoxOpen className="text-gray-400" />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {msg.quick_actions && msg.quick_actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {msg.quick_actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[450px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                                    <FaRobot className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">AI Assistant</h3>
                                    <span className="text-xs text-blue-100 flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                        Sẵn sàng hỗ trợ
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                                aria-label="Close chat"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-[#F3F4F6] flex flex-col gap-4 scroll-smooth">
                            {messages.map((message) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={message.id}
                                    className={`flex items-start gap-2.5 max-w-[90%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-blue-600 border border-gray-100'
                                        }`}>
                                        {message.role === 'user' ? <FaUser size={13} /> : <FaRobot size={15} />}
                                    </div>
                                    <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${message.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {message.role === 'user' ? message.text : renderBotContent(message)}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mr-auto flex items-center gap-2 max-w-[85%]"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
                                        <FaRobot size={15} />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Nhập tin nhắn của bạn..."
                                        className="w-full bg-gray-100 text-gray-700 placeholder-gray-400 text-sm rounded-full py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-indigo-100 focus:bg-white focus:outline-none border border-transparent focus:border-indigo-200 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${inputValue.trim() && !isLoading
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <FaPaperPlane size={14} className={inputValue.trim() && !isLoading ? 'ml-0.5' : ''} />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400">Powered by AI - Thông tin chỉ mang tính chất tham khảo</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-600/30 text-white flex items-center justify-center text-2xl hover:shadow-xl transition-all z-50"
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
