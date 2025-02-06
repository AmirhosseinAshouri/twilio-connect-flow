import React, { useEffect, useState } from "react";
import { TwilioVoice } from "@twilio/voice-react-native-sdk";
import { Button, View, Text } from "react-native";

const TwilioClient = () => {
  const [token, setToken] = useState<string | null>(null);
  const [twilio, setTwilio] = useState<TwilioVoice | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("https://crm-six-black.vercel.app/api/twilio/token?identity=JohnDoe");
        const data = await res.json();
        setToken(data.token);

        // Initialize Twilio Client
        const client = new TwilioVoice();
        await client.initWithToken(data.token);
        setTwilio(client);
      } catch (error) {
        console.error("Failed to fetch Twilio token:", error);
      }
    };

    fetchToken();
  }, []);

  const makeCall = async () => {
    if (twilio) {
      try {
        const call = await twilio.connect({ params: { To: "+1234567890" } }); // Replace with recipient number
        console.log("Call started:", call);
      } catch (error) {
        console.error("Call error:", error);
      }
    }
  };

  return (
    <View>
      <Text>Twilio Voice Call</Text>
      <Button title="Call" onPress={makeCall} />
    </View>
  );
};

export default TwilioClient;
