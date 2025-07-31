export const createHeartbeatMessage = () => {
  const HEADER = [0xfe]; // v1.0
  const PAYLOAD_LENGTH = 9;
  const SEQ = 0; // just an example
  const SYS_ID = 1;
  const COMP_ID = 1;
  const MSG_ID = 0; // heartbeat
  const PAYLOAD = new Uint8Array(PAYLOAD_LENGTH).fill(0);

  const msg = [
    ...HEADER,
    PAYLOAD_LENGTH,
    SEQ,
    SYS_ID,
    COMP_ID,
    MSG_ID,
    ...PAYLOAD,
  ];

  const checksum = calculateChecksum(msg);
  return [...msg, ...checksum];
};

function calculateChecksum(msg) {
  // Simple XOR checksum as placeholder — not MAVLink compliant
  let sum = 0;
  for (let i = 1; i < msg.length; i++) {
    sum ^= msg[i];
  }
  return [sum & 0xff];
}
