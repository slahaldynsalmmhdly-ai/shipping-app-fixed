// نظام Cache للمحادثات والرسائل
interface CachedConversation {
  _id: string;
  participant: {
    _id: string;
    name: string;
    avatar?: string;
    userType?: string;
  };
  lastMessage: {
    content?: string;
    messageType: string;
    mediaUrl?: string;
    createdAt: string;
    isSender: boolean;
  } | null;
  unreadCount: number;
  lastMessageTime: string;
}

interface CachedMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  messageType: string;
  content?: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaSize?: number;
  mediaDuration?: number;
  isRead: boolean;
  isSender: boolean;
  createdAt: string;
  isPending?: boolean; // للرسائل التي لم تُرسل بعد
}

class ChatCache {
  private CONVERSATIONS_KEY = 'cached_conversations';
  private MESSAGES_KEY_PREFIX = 'cached_messages_';

  // حفظ المحادثات
  saveConversations(conversations: CachedConversation[]): void {
    try {
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('خطأ في حفظ المحادثات:', error);
    }
  }

  // جلب المحادثات من Cache
  getConversations(): CachedConversation[] {
    try {
      const cached = localStorage.getItem(this.CONVERSATIONS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('خطأ في جلب المحادثات:', error);
      return [];
    }
  }

  // حفظ رسائل محادثة معينة
  saveMessages(conversationId: string, messages: CachedMessage[]): void {
    try {
      const key = this.MESSAGES_KEY_PREFIX + conversationId;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('خطأ في حفظ الرسائل:', error);
    }
  }

  // جلب رسائل محادثة معينة من Cache
  getMessages(conversationId: string): CachedMessage[] {
    try {
      const key = this.MESSAGES_KEY_PREFIX + conversationId;
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      return [];
    }
  }

  // إضافة رسالة جديدة إلى Cache
  addMessage(conversationId: string, message: CachedMessage): void {
    const messages = this.getMessages(conversationId);
    // Replace temp message if it exists, otherwise add new one
    const existingIndex = messages.findIndex(m => m._id.startsWith('temp_') && m.createdAt === message.createdAt);
    if (existingIndex > -1) {
        messages[existingIndex] = message;
    } else {
        messages.push(message);
    }
    this.saveMessages(conversationId, messages);
  }

  // تحديث محادثة في Cache
  updateConversation(conversationId: string, updates: Partial<CachedConversation>): void {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c._id === conversationId);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates };
      this.saveConversations(conversations);
    }
  }

  // مسح Cache (للخروج من الحساب)
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.MESSAGES_KEY_PREFIX) || key === this.CONVERSATIONS_KEY) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const chatCache = new ChatCache();
