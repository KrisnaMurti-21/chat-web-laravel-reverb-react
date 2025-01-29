import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

function Chat({ friend, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newMedia, setNewMedia] = useState(null);
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const messagesContainerRef = useRef(null);
    const isFriendTypingTimerRef = useRef(null);

    // Fetch messages on component mount
    useEffect(() => {
        const fetchMessages = async () => {
            const response = await axios.get(
                route("getmessage", { friend: friend.id })
            );
            setMessages(response.data);
        };
        fetchMessages();
    }, [friend.id]);

    // Setup event listeners for real-time updates
    useEffect(() => {
        const chatChannel = Echo.private(`chat.${currentUser.id}`);

        chatChannel.listen("MessageSent", (response) => {
            console.log(response);
            setMessages((prevMessages) => [...prevMessages, response.message]);
        });

        chatChannel.listenForWhisper("typing", (response) => {
            if (response.userId === friend.id) {
                setIsFriendTyping(true);

                if (isFriendTypingTimerRef.current) {
                    clearTimeout(isFriendTypingTimerRef.current);
                }

                isFriendTypingTimerRef.current = setTimeout(() => {
                    setIsFriendTyping(false);
                }, 1000);
            }
        });

        return () => {
            chatChannel.stopListening("MessageSent");
            chatChannel.stopListeningForWhisper("typing");
        };
    }, [currentUser.id, friend.id]); // Ensure this effect runs only once per user and friend

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (newMessage.trim() !== "" || newMedia) {
            try {
                const formData = new FormData();
                formData.append("message", newMessage);
                if (newMedia) {
                    formData.append("media", newMedia);
                }
                const response = await axios.post(
                    route("sendmessage", { friend: friend.id }),
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                setMessages((prevMessages) => [...prevMessages, response.data]);
                setNewMessage("");
                setNewMedia(null);
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const handleFileChange = (e) => {
        setNewMedia(e.target.files[0]);
    };

    const sendTypingEvent = () => {
        if (newMessage.trim() !== "") {
            Echo.private(`chat.${friend.id}`).whisper("typing", {
                userId: currentUser.id,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Chat with {friend.name}
                </h2>
            }
        >
            <Head title="Chat" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex flex-col justify-end h-[70vh]">
                    <div
                        ref={messagesContainerRef}
                        className="p-4 overflow-y-auto max-h-fit"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="flex items-center mb-2"
                            >
                                {message.sender_id === currentUser.id ? (
                                    <div className="p-2 ml-auto text-white bg-blue-500 rounded-lg max-w-[80%] dark:bg-blue-400">
                                        {message.text}
                                        {message.media_path && (
                                            <img
                                                src={`/storage/${message.media_path}`}
                                                alt="Media"
                                                className="mt-2 rounded-lg max-h-52"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-2 mr-auto bg-gray-200 rounded-lg max-w-[80%]">
                                        {message.text}
                                        {message.media_path && (
                                            <img
                                                src={`/storage/${message.media_path}`}
                                                alt="Media"
                                                className="mt-2 rounded-lg max-h-52"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center mb-2">
                    <TextInput
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={sendTypingEvent}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        type="text"
                        className="block w-full"
                        placeholder="Type a Message"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="ml-4 bg-slate-300 text-sm file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded-lg"
                    />
                    <PrimaryButton
                        onClick={sendMessage}
                        className="block py-3 ms-4"
                    >
                        Send
                    </PrimaryButton>
                </div>
                {isFriendTyping && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {friend.name} is typing...
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default Chat;
