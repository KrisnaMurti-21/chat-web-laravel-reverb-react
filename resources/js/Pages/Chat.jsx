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

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await axios.get(
                route("getmessage", { friend: friend.id })
            );
            setMessages(response.data);
        };
        fetchMessages();
        const chatChannel = Echo.private(`chat.${currentUser.id}`);

        chatChannel.listen("MessageSent", (e) => {
            setMessages((prevMessages) => [...prevMessages, e.message]);
        });

        chatChannel.listenForWhisper(
            "typing",
            (response) => {
                setIsFriendTyping(response.userId === friend.id);

                if (isFriendTypingTimerRef.current) {
                    clearTimeout(isFriendTypingTimerRef.current);
                }

                isFriendTypingTimerRef.current = setTimeout(() => {
                    setIsFriendTyping(false);
                }, 1000);
            },
            [friend.id, currentUser.id]
        );

        return () => {
            chatChannel.stopListening("MessageSent");
            chatChannel.stopListeningForWhisper("typing");
        };
    });
    const sendMessage = async () => {
        if (newMessage.trim() !== "") {
            try {
                const response = await axios.post(
                    route("sendmessage", { friend: friend.id }),
                    {
                        message: newMessage,
                    }
                );
                setMessages((prevMessages) => [...prevMessages, response.data]);
                setNewMessage("");
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const sendTypingEvent = () => {
        if (messages.length !== 0) {
            Echo.private(`chat.${friend.id}`).whisper("typing", {
                userId: currentUser.id,
            });
        }
    };

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className=" font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Chat with {friend.name}
                </h2>
            }
        >
            <Head title="Chat" />
            <div className="mx-auto max-w-7xl sm:px-6 lg-px-8">
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
                                    </div>
                                ) : (
                                    <div className="p-2 mr-auto bg-gray-200 rounded-lg max-w-[80%]">
                                        {message.text}
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
                    ></TextInput>
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
