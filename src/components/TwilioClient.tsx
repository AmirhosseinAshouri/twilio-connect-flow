
import { Device, Call } from '@twilio/voice-sdk';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const TwilioClient = () => {
  const [token, setToken] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/token');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
        toast({
          title: "Error",
          description: "Failed to fetch Twilio token",
          variant: "destructive",
        });
      }
    };

    fetchToken();
  }, [toast]);

  useEffect(() => {
    if (!token) return;

    try {
      const newDevice = new Device(token);
      
      // Handle incoming calls
      newDevice.on('incoming', (call) => {
        setCurrentCall(call);
        
        // Automatically accept incoming calls
        call.accept({
          codecPreferences: ['opus', 'pcmu'] as any[]
        });

        // Set up call event handlers
        setupCallHandlers(call);
      });

      newDevice.on('registered', () => {
        console.log('Device is ready to make calls');
        toast({
          title: "Ready",
          description: "Device is ready to make calls",
        });
      });

      newDevice.on('error', (error) => {
        console.error('Device error:', error);
        toast({
          title: "Error",
          description: error.message || "Device error occurred",
          variant: "destructive",
        });
      });

      // Register the device
      newDevice.register();
      setDevice(newDevice);

      // Cleanup on unmount
      return () => {
        newDevice.destroy();
      };
    } catch (error) {
      console.error('Error setting up device:', error);
      toast({
        title: "Error",
        description: "Failed to setup Twilio device",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const setupCallHandlers = (call: Call) => {
    call.on('accept', () => {
      console.log('Call accepted');
    });

    call.on('disconnect', () => {
      console.log('Call ended');
      setCurrentCall(null);
      toast({
        title: "Call Ended",
        description: "The call has been disconnected",
      });
    });

    call.on('error', (error) => {
      console.error('Call error:', error);
      toast({
        title: "Call Error",
        description: error.message || "An error occurred during the call",
        variant: "destructive",
      });
    });
  };

  const connect = async () => {
    try {
      if (!device) {
        console.error('No device available');
        return;
      }

      const params = {
        // Add any custom parameters you want to pass to your TwiML
        To: '+1234567890', // Replace with the actual number
      };

      const call = await device.connect({ params });
      setCurrentCall(call);
      setupCallHandlers(call);

      toast({
        title: "Connecting",
        description: "Initiating call...",
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Failed to connect call",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    if (currentCall) {
      currentCall.disconnect();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button 
          onClick={connect}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={!device || !!currentCall}
        >
          Make Call
        </button>
        {currentCall && (
          <button 
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            End Call
          </button>
        )}
      </div>
      {currentCall && (
        <div className="text-sm text-gray-600">
          Call in progress...
        </div>
      )}
    </div>
  );
};

export default TwilioClient;
