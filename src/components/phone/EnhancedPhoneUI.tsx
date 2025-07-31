import React, { useState } from 'react';
import { useEnhancedTwilio } from './EnhancedTwilioProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Pause, 
  Play,
  Circle,
  Square,
  Volume2,
  VolumeX,
  Users,
  Clock,
  Activity
} from 'lucide-react';

interface EnhancedPhoneUIProps {
  contactId?: string;
  contactName?: string;
}

export const EnhancedPhoneUI: React.FC<EnhancedPhoneUIProps> = ({ 
  contactId, 
  contactName 
}) => {
  const {
    device,
    call,
    incomingCall,
    callStatus,
    isInitializing,
    isRecording,
    audioQuality,
    isMuted,
    isOnHold,
    makeCall,
    answerCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleHold,
    sendDTMF,
    startRecording,
    stopRecording
  } = useEnhancedTwilio();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [enableRecording, setEnableRecording] = useState(false);
  const [enableTranscription, setEnableTranscription] = useState(false);

  const getStatusColor = () => {
    switch (callStatus.status) {
      case 'ready': return 'bg-green-500';
      case 'connecting': case 'ringing': return 'bg-yellow-500';
      case 'connected': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'initializing': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getQualityColor = () => {
    switch (audioQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const handleCall = async () => {
    if (!phoneNumber && !contactId) return;
    
    await makeCall(phoneNumber, {
      enableRecording,
      enableTranscription,
      contactId,
      notes: callNotes
    });
  };

  const dtmfPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            Enhanced Phone System
            {audioQuality && (
              <Badge variant="outline" className={getQualityColor()}>
                {audioQuality}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Status: <span className="font-medium capitalize">{callStatus.status}</span>
            {callStatus.message && ` - ${callStatus.message}`}
          </div>
          {callStatus.duration && (
            <div className="text-sm text-muted-foreground mt-1">
              Duration: {Math.floor(callStatus.duration / 60)}:{(callStatus.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Call Alert */}
      {incomingCall && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium">Incoming Call</span>
              </div>
              <div className="text-lg font-semibold">
                {incomingCall.parameters.From || 'Unknown'}
              </div>
              <div className="flex gap-3">
                <Button onClick={answerCall} className="flex-1" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Answer
                </Button>
                <Button onClick={rejectCall} variant="destructive" className="flex-1" size="lg">
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Form */}
      {!call && !incomingCall && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Make Call
              {contactName && (
                <Badge variant="secondary">{contactName}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isInitializing || !!call}
              />
            </div>

            <div>
              <Label htmlFor="notes">Call Notes</Label>
              <Input
                id="notes"
                placeholder="Purpose of call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                disabled={isInitializing || !!call}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="recording">Enable Recording</Label>
                <Switch
                  id="recording"
                  checked={enableRecording}
                  onCheckedChange={setEnableRecording}
                  disabled={isInitializing || !!call}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="transcription">Enable Transcription</Label>
                <Switch
                  id="transcription"
                  checked={enableTranscription}
                  onCheckedChange={setEnableTranscription}
                  disabled={isInitializing || !!call}
                />
              </div>
            </div>

            <Button 
              onClick={handleCall}
              disabled={!device || !phoneNumber || callStatus.status !== 'ready'}
              className="w-full"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              {isInitializing ? 'Initializing...' : 'Call'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Call Controls */}
      {call && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Active Call
              {callStatus.callSid && (
                <Badge variant="outline" className="text-xs">
                  {callStatus.callSid.slice(-8)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Call Status */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Status: <span className="font-medium capitalize">{callStatus.status}</span>
              </div>
              {audioQuality && (
                <Badge variant="outline" className={getQualityColor()}>
                  <Activity className="h-3 w-3 mr-1" />
                  {audioQuality}
                </Badge>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <Circle className="h-3 w-3 fill-current animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}

            <Separator />

            {/* Primary Controls */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button
                onClick={toggleHold}
                variant={isOnHold ? "secondary" : "outline"}
                size="lg"
              >
                {isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isOnHold ? 'Resume' : 'Hold'}
              </Button>
            </div>

            {/* Recording Controls */}
            <div className="flex gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} variant="outline" size="sm">
                  <Circle className="h-3 w-3 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="outline" size="sm">
                  <Square className="h-3 w-3 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* DTMF Pad */}
            <div>
              <Label className="text-sm font-medium">DTMF Keypad</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {dtmfPad.flat().map((digit) => (
                  <Button
                    key={digit}
                    onClick={() => sendDTMF(digit)}
                    variant="outline"
                    size="sm"
                    className="aspect-square"
                  >
                    {digit}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Hang Up */}
            <Button
              onClick={hangUp}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Hang Up
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connection Issues */}
      {callStatus.status === 'error' && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <div className="font-medium">Connection Error</div>
              <div className="text-sm mt-1">{callStatus.message}</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};