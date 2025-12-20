import { ChatThread } from '../types';

// This is a temporary helper to generate threads since the backend doesn't have a "getThreads" endpoint yet.
// We will mock threads based on known users or just static for now.
export const MOCK_THREADS_SERVICE: ChatThread[] = [
    { id: '1', userId: 'u1', userName: 'Canberk Hız', userAvatar: '', isOnline: true, lastMessage: 'Yarın sabah 6\'da Şile\'ye çıkıyoruz, geliyor musun?', lastMessageTime: '2m', unreadCount: 2 },
    { id: '2', userId: 'u2', userName: 'MotoServis', userAvatar: '', isOnline: false, lastMessage: 'Parçalar elimize ulaştı, bekleriz.', lastMessageTime: '1h', unreadCount: 0 },
    { id: '3', userId: 'u3', userName: 'Zeynep Yılmaz', userAvatar: '', isOnline: true, lastMessage: 'Kaskın linkini atabilir misin?', lastMessageTime: '1d', unreadCount: 0 },
];
