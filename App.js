// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, PermissionsAndroid, Platform } from 'react-native';
import BluetoothService from './src/services/BluetoothService';
import MAVLinkParser from './src/mavlinks/MavlinkParser';
import { Buffer } from 'buffer';
global.Buffer = Buffer;


const mavParser = new MAVLinkParser();

export default function App() {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }

      BluetoothService.startScan(async (device) => {
        setConnectedDevice(device);

        await BluetoothService.connectToDevice(device, (buffer) => {
          const msg = mavParser.parse(buffer);
          if (msg && msg.name === 'HEARTBEAT') {
            console.log('❤️ HEARTBEAT:', msg);
            setMessage(`HEARTBEAT received: system_status = ${msg.data.system_status}`);
          }
        });
      });
    };

    init();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Connected to: hi {connectedDevice ? connectedDevice.name : 'Scanning...'}
      </Text>
      <Text style={{ fontSize: 16 }}>{message || 'Waiting for heartbeat...'}</Text>
    </View>
  );
}
