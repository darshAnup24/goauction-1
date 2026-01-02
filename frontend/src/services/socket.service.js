import { io } from 'socket.io-client';
import API_CONFIG from '../config/api.config';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Connect to socket server
  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(API_CONFIG.SOCKET_URL, {
      auth: {
        token: token || localStorage.getItem('token')
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Join auction room
  joinAuction(listingId) {
    this.emit('join-auction', { listingId });
  }

  // Leave auction room
  leaveAuction(listingId) {
    this.emit('leave-auction', { listingId });
  }

  // Place bid via socket
  placeBid(bidData) {
    this.emit('place-bid', bidData);
  }

  // Listen for new bids
  onNewBid(callback) {
    this.on('new-bid', callback);
  }

  // Listen for auction end
  onAuctionEnd(callback) {
    this.on('auction-end', callback);
  }

  // Listen for notifications
  onNotification(callback) {
    this.on('notification', callback);
  }

  // Check connection status
  isConnected() {
    return this.connected;
  }
}

const socketService = new SocketService();
export default socketService;
