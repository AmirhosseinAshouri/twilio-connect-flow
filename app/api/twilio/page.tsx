"use client"; // Mark as Client Component

import React from "react";
import { Button, View, Text } from "react-native";

export default function TwilioClient() {
  return (
    <View>
      <Text>Twilio Calling</Text>
      <Button title="Call" onPress={() => alert("Calling...")} />
    </View>
  );
}
