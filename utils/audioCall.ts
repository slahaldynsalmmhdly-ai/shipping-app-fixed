import Peer from 'peerjs';

class PeerManager {
  private static instance: PeerManager;
  public peer: Peer | null = null;

  private constructor() {}

  public static getInstance(): PeerManager {
    if (!PeerManager.instance) {
      PeerManager.instance = new PeerManager();
    }
    return PeerManager.instance;
  }

  public initialize(userId: string): Peer {
    // If a peer instance exists for a different user, destroy it first.
    if (this.peer && this.peer.id !== userId) {
      this.destroy();
    }

    // If a peer instance already exists and is connected for the same user, return it.
    if (this.peer && !this.peer.destroyed) {
      return this.peer;
    }

    // Create a new Peer instance with the provided server configuration.
    this.peer = new Peer(userId, {
      host: 'shipping-app-backend-fxkl.onrender.com',
      port: 443,
      path: '/peerjs',
      secure: true,
      debug: 2, // Helps with debugging connection issues
    });

    return this.peer;
  }

  public destroy(): void {
    if (this.peer) {
      if (!this.peer.destroyed) {
        this.peer.destroy();
      }
      this.peer = null;
    }
  }
}

export const peerManager = PeerManager.getInstance();
