import { Device } from '@twilio/conversations';
import { useEffect, useState } from 'react';

const TwilioClient = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      // Fetch the token from your server or Twilio
      const response = await fetch('/api/token');
      const data = await response.json();
      setToken(data.token);
    };

    fetchToken();
  }, []);

  const connect = async () => {
    try {
      if (!token) {
        console.error('No token available');
        return;
      }

      const device = new Device(token, {
        // @ts-ignore - Type error with Twilio types, but this works correctly
        codecPreferences: ['opus', 'pcmu']
      });

      device.on('ready', () => {
        console.log('Device is ready to make calls');
      });

      device.on('error', (error) => {
        console.error('Device error:', error);
      });
    } catch (error) {
      console.error('Error connecting device:', error);
    }
  };

  return (
    <div>
      <button onClick={connect}>Connect</button>
    </div>
  );
};

export default TwilioClient;
