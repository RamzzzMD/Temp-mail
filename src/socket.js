import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;
let currentAddress = null;

export function connectSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  return socket;
}

export function watchAddress(address, onNewMail) {
  const s = connectSocket();

  if (currentAddress && currentAddress !== address) {
    s.emit('leave', currentAddress);
  }
  currentAddress = address;

  const join = () => s.emit('join', address);
  if (s.connected) join();
  s.on('connect', join);

  s.off('new_mail');
  s.on('new_mail', onNewMail);
}

export function getSocket() {
  return socket;
}
