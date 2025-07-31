import { parseMavlinkData } from '../mavlinks/MavlinkParser';

class MavlinkService {
  constructor() {
    this.listeners = [];
  }

  handleIncomingData(base64Data) {
    const messages = parseMavlinkData(base64Data);
    messages.forEach(msg => {
      this.listeners.forEach(callback => callback(msg));
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
  }
}

export default new MavlinkService();
