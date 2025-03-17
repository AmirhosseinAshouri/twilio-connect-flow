
import React from 'react';
import { TwilioDeviceProvider } from '@/components/phone/TwilioDeviceProvider';
import { PhoneUI } from '@/components/phone/PhoneUI';

const PhonePage: React.FC = () => {
  return (
    <TwilioDeviceProvider>
      <PhoneUI />
    </TwilioDeviceProvider>
  );
};

export default PhonePage;
