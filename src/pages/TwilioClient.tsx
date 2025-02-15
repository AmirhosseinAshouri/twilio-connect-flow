
import React, { useEffect, useState } from "react";
import { Device, Codec } from "@twilio/voice-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const TwilioClient = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const response = await fetch("/api/twilio/token");
        const data = await response.json();
        
        if (!data.token) {
          throw new Error("Failed to get token");
        }

        const newDevice = new Device(data.token, {
          codecPreferences: [Codec.Opus, Codec.Pcmu],
          fakeLocalDTMF: true,
          enableRingingState: true,
        });

        await newDevice.register();
        setDevice(newDevice);

        // Set up event listeners
        newDevice.on('error', (error) => {
          console.error('Twilio device error:', error);
          toast({
            title: "Error",
            description: error.message || "An error occurred with the call device",
            variant: "destructive",
          });
        });

        newDevice.on('registered', () => {
          console.log('Twilio device registered');
        });

        newDevice.on('unregistered', () => {
          console.log('Twilio device unregistered');
        });

      } catch (error) {
        console.error("Failed to initialize Twilio device:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize call device",
          variant: "destructive",
        });
      }
    };

    initializeDevice();

    return () => {
      // Cleanup
      if (device) {
        device.destroy();
      }
    };
  }, [toast]);

  const makeCall = async () => {
    if (!device) {
      toast({
        title: "Error",
        description: "Call device not initialized",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const connection = await device.connect({
        params: { To: "+1234567890" } // Replace with recipient number
      });

      connection.on('accept', () => {
        console.log('Call accepted');
        toast({
          title: "Success",
          description: "Call connected",
        });
      });

      connection.on('disconnect', () => {
        console.log('Call disconnected');
        setIsConnecting(false);
        toast({
          title: "Call Ended",
          description: "Call has been disconnected",
        });
      });

    } catch (error) {
      console.error("Call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make call",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Twilio Voice Call</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={makeCall} 
          disabled={!device || isConnecting}
          className="w-full"
        >
          {isConnecting ? "Connecting..." : "Make Call"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TwilioClient;
