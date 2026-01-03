import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { MdFormatListBulleted } from "react-icons/md";
import { FaItalic } from "react-icons/fa";
import { FaBold } from "react-icons/fa";

export default function TextEditor({ description, setDescription, placeholder = 'Nhập mô tả sản phẩm...' }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: description,
        onUpdate: ({ editor }) => {
            setDescription(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm max-w-none focus:outline-none min-h-[118px] pt-[15px] pl-[15px] pr-[15px] bg-[#fafafa] rounded-[5px] border border-solid border-[rgba(0,0,0,0.1)] [&_ul]:list-disc [&_ul>li::marker]:text-gray-800 [&_ul]:pl-6',
            },
        },
    });

    // Đồng bộ lại content khi description từ props thay đổi (rất quan trọng khi edit sản phẩm)
    useEffect(() => {
        if (editor && description !== editor.getHTML() && !editor.isDestroyed) {
            editor.commands.setContent(description || '', false);
        }
    }, [description, editor]);

    // Fix nút active ngay lập tức
    useEffect(() => {
        if (editor) {
            const handleUpdate = () => {
                editor.view.updateState(editor.state);
            };
            editor.on('transaction', handleUpdate);
            return () => {
                editor.off('transaction', handleUpdate);
            };
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <>
            {/* Toolbar 3 nút */}
            <div className="mb-2 flex gap-2 bg-white border border-gray-300 rounded-t-[5px] p-2">
                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${editor.isActive('bulletList')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <MdFormatListBulleted size={18} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${editor.isActive('bold')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <FaBold size={14} />
                </button>

                <button
                    type='button'
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${editor.isActive('italic')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <FaItalic size={14} />
                </button>
            </div>

            {/* Editor - giờ sẽ có placeholder khi trống */}
            <EditorContent editor={editor} />
        </>
    );
};