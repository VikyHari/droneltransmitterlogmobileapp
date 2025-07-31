// src/services/BluetoothService.js
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';

const UART_SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
const TX_CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
const RX_CHARACTERISTIC_UUID = '49535343-1e4d-4bd9-ba61-23c647249616';

class BluetoothService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.rxSubscription = null;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);
      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  }

  async startScan(onDeviceFound) {
    const permissionGranted = await this.requestPermissions();
    if (!permissionGranted) {
      console.warn('Bluetooth permission denied');
      return;
    }

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }

      if (device && device.name && device.name.includes('T12')) {
        console.log('Found device:', device.name);
        this.manager.stopDeviceScan();
        onDeviceFound(device);
      }
    });
  }

  async connectToDevice(device, onDataReceived) {
    try {
      this.device = await device.connect();
      console.log('Connected to', this.device.name);
      await this.device.discoverAllServicesAndCharacteristics();

      this.rxSubscription = this.device.monitorCharacteristicForService(
        UART_SERVICE_UUID,
        RX_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }

          const buffer = Buffer.from(characteristic.value, 'base64');
          console.log('Raw base64:', characteristic.value); // ✅ Add this
          console.log('Raw buffer:', buffer);
          onDataReceived(buffer);
        },
      );
    } catch (err) {
      console.error('Connection error:', err);
    }
  }

  async sendData(data) {
    if (!this.device) {
      console.warn('Device not connected');
      return;
    }

    const base64Data = Buffer.from(data).toString('base64');

    try {
      await this.device.writeCharacteristicWithResponseForService(
        UART_SERVICE_UUID,
        TX_CHARACTERISTIC_UUID,
        base64Data,
      );
      console.log('Sent:', data);
    } catch (error) {
      console.error('Send error:', error);
    }
  }

  async disconnect() {
    if (this.rxSubscription) {
      this.rxSubscription.remove();
      this.rxSubscription = null;
    }

    if (this.device) {
      await this.device.cancelConnection();
      console.log('Disconnected');
    }
  }
}

export default new BluetoothService();
