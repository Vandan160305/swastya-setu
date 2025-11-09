
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat as ChatEntity } from '@/entities/Chat';
import { User } from '@/entities/User';
import { Appointment } from '@/entities/Appointment';
import { Doctor } from '@/entities/Doctor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const location = useLocation();
    
    const appointmentId = new URLSearchParams(location.search).get('appointmentId');

    const fetchChatData = useCallback(async () => {
        if (!appointmentId) {
            setIsLoading(false);
            return;
        }

        try {
            const [me, apt] = await Promise.all([
                User.me(),
                Appointment.get(appointmentId)
            ]);
            setAppointment(apt);
            setCurrentUser(me);

            const chatMessages = await ChatEntity.filter({ appointment_id: appointmentId }, "created_date");
            setMessages(chatMessages);

            // Determine other user
            const isPatient = me.id === apt.patient_id;
            const otherUserId = isPatient ? (await Doctor.get(apt.doctor_id)).created_by : apt.patient_id;
            const otherUserData = await User.get(otherUserId);
            setOtherUser(otherUserData);

        } catch (error) {
            console.error("Error fetching chat data:", error);
        }
        setIsLoading(false);
    }, [appointmentId]);

    useEffect(() => {
        fetchChatData();
        const interval = setInterval(fetchChatData, 5000); // Poll for new messages every 5 seconds
        return () => clearInterval(interval);
    }, [fetchChatData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !otherUser) return;
        
        try {
            const messageData = {
                appointment_id: appointmentId,
                sender_id: currentUser.id,
                receiver_id: otherUser.id,
                message: newMessage,
            };
            await ChatEntity.create(messageData);
            setNewMessage('');
            fetchChatData(); // Refresh immediately
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (isLoading) {
        return <div className="p-6 h-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
    }
    
    if (!appointment) {
        return <div className="p-6 text-center">Invalid appointment ID.</div>;
    }

    return (
        <div className="flex flex-col h-full p-4">
            <header className="border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">Chat with {otherUser?.full_name || 'User'}</h2>
                <p className="text-sm text-gray-500">Regarding appointment on {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</p>
            </header>
            <main className="flex-1 overflow-y-auto space-y-4 pr-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === currentUser.id ? 'justify-end' : ''}`}>
                        {msg.sender_id !== currentUser.id && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{otherUser?.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <p>{msg.message}</p>
                        </div>
                         {msg.sender_id === currentUser.id && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{currentUser?.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="mt-4">
                <div className="flex gap-2">
                    <Input 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                    />
                    <Button onClick={handleSendMessage}><Send className="w-4 h-4"/></Button>
                </div>
            </footer>
        </div>
    );
}
