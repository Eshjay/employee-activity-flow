
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "employee" | "ceo" | "developer";
  status: "active" | "inactive";
  lastLogin: string;
  department: string;
  password?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

class UserStore {
  private users: SystemUser[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "ceo@company.com",
      role: "ceo",
      status: "active",
      lastLogin: "2024-06-12",
      department: "Executive",
      password: "password123"
    },
    {
      id: "2",
      name: "John Smith",
      email: "employee@company.com",
      role: "employee",
      status: "active",
      lastLogin: "2024-06-12",
      department: "Development",
      password: "password123"
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@company.com",
      role: "employee",
      status: "active",
      lastLogin: "2024-06-11",
      department: "Design",
      password: "password123"
    },
    {
      id: "4",
      name: "Admin User",
      email: "admin@company.com",
      role: "developer",
      status: "active",
      lastLogin: "2024-06-12",
      department: "IT",
      password: "password123"
    }
  ];

  private messages: Message[] = [];
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getUsers(): SystemUser[] {
    return [...this.users];
  }

  getUserByEmail(email: string): SystemUser | undefined {
    return this.users.find(user => user.email === email);
  }

  getUserById(id: string): SystemUser | undefined {
    return this.users.find(user => user.id === id);
  }

  addUser(user: Omit<SystemUser, 'id' | 'lastLogin' | 'status'>): SystemUser {
    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
      status: "active",
      lastLogin: "Never"
    };
    this.users.push(newUser);
    this.notify();
    return newUser;
  }

  updateUser(id: string, updates: Partial<SystemUser>): void {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.notify();
    }
  }

  deleteUser(id: string): void {
    this.users = this.users.filter(user => user.id !== id);
    this.notify();
  }

  setPassword(userId: string, password: string): void {
    this.updateUser(userId, { password });
  }

  validateLogin(email: string, password: string): SystemUser | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.updateUser(user.id, { lastLogin: new Date().toISOString().split('T')[0] });
      return user;
    }
    return null;
  }

  // Messaging functionality
  getMessages(): Message[] {
    return [...this.messages];
  }

  getMessagesForUser(userId: string): Message[] {
    return this.messages.filter(msg => msg.recipientId === userId || msg.senderId === userId);
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): void {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    this.messages.push(newMessage);
    this.notify();
  }

  markMessageAsRead(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
      this.notify();
    }
  }
}

export const userStore = new UserStore();
