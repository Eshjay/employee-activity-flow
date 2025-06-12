
import { useState, useEffect } from 'react';
import { userStore, SystemUser, Message } from '@/store/userStore';

export const useUserStore = () => {
  const [users, setUsers] = useState<SystemUser[]>(userStore.getUsers());
  const [messages, setMessages] = useState<Message[]>(userStore.getMessages());

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setUsers(userStore.getUsers());
      setMessages(userStore.getMessages());
    });

    return unsubscribe;
  }, []);

  return {
    users,
    messages,
    addUser: userStore.addUser.bind(userStore),
    updateUser: userStore.updateUser.bind(userStore),
    deleteUser: userStore.deleteUser.bind(userStore),
    getUserByEmail: userStore.getUserByEmail.bind(userStore),
    getUserById: userStore.getUserById.bind(userStore),
    setPassword: userStore.setPassword.bind(userStore),
    validateLogin: userStore.validateLogin.bind(userStore),
    sendMessage: userStore.sendMessage.bind(userStore),
    getMessagesForUser: userStore.getMessagesForUser.bind(userStore),
    markMessageAsRead: userStore.markMessageAsRead.bind(userStore)
  };
};
