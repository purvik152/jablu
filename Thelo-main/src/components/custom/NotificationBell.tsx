"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

interface NotificationType {
    _id: string;
    message: string;
    link: string;
    isRead: boolean;
}

// 1. Add a 'role' prop to the component
export function NotificationBell({ role }: { role: 'seller' | 'shopkeeper' }) {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);
        return () => clearInterval(intervalId);
    }, []);
    
    // 2. Filter notifications based on the role
    const filteredNotifications = notifications.filter(n => {
        const message = n.message.toLowerCase();
        if (role === 'seller') {
            // Sellers only see "new order" notifications
            return message.includes('new order');
        }
        if (role === 'shopkeeper') {
            // Shopkeepers only see status updates
            return message.includes('shipped') || message.includes('delivered') || message.includes('pending');
        }
        return false;
    });

    const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

    const handleOpenChange = async (isOpen: boolean) => {
        if (isOpen && unreadCount > 0) {
            await fetch('/api/notifications/read', { method: 'PUT' });
            setNotifications(current => current.map(n => ({ ...n, isRead: true })));
        }
    };

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                    <Bell className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel>
                    {role === 'seller' ? 'New Orders' : 'Order Updates'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filteredNotifications.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                        {/* 3. Map over the new filtered list */}
                        {filteredNotifications.map(notif => (
                            <DropdownMenuItem key={notif._id} onSelect={() => router.push(notif.link)} className="flex items-start gap-3 p-2">
                                {!notif.isRead && (<span className="mt-1 flex h-2 w-2 rounded-full bg-sky-500" />)}
                                <p className={`whitespace-normal text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                                    {notif.message}
                                </p>
                            </DropdownMenuItem>
                        ))}
                    </div>
                ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">You have no new notifications.</p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}