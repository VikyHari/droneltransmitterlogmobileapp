// src/services/MAVLinkParser.js
import { MAVLink20Processor } from './generated'; // Fixed import
import { Buffer } from 'buffer';

export default class MAVLinkParser {
  constructor() {
    this.processor = new MAVLink20Processor();
  }

 parse(buffer) {
  const messages = [];

  for (let i = 0; i < buffer.length; i++) {
    const result = this.processor.parseChar(buffer[i]);
    console.log('Parsed byte:', buffer[i], '->', result); // ✅ Add this
    if (result && result.name === 'HEARTBEAT') {
      messages.push({
        id: result.msgid,
        name: result.name,
        data: result,
      });
    }
  }

  return messages.length > 0 ? messages[0] : null;
}


  fromBase64(base64Str) {
    const buffer = Buffer.from(base64Str, 'base64');
    return this.parse(buffer);
  }
}
