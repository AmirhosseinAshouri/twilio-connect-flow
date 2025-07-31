import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Timer, PhoneCall, PhoneForwarded, Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MobileCallWindowProps {
  open: boolean;
  onClose: () => void;
  status: 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  phoneNumber: string;
  contactName?: string;
  onHangUp: () => void;
}

export function MobileCallWindow({ 
  open, 
  onClose, 
  status, 
  phoneNumber, 
  contactName,
  onHangUp 
}: MobileCallWindowProps) {
  const [duration, setDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  // Handle call status changes
  useEffect(() => {
    console.log(`MobileCallWindow - Status: ${status}, Open: ${open}`);
    
    if (status === 'in-progress' && !timerInterval) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      toast.success("Call connected");
    } else if (status !== 'in-progress' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (status === 'completed' || status === 'failed' || status === 'canceled') {
      const message = status === 'completed' ? "Call ended" : 
                      status === 'failed' ? "Call failed" : "Call canceled";
      toast.info(message);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [status, timerInterval, onClose]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'initiated':
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'in-progress':
        return 'Call in Progress';
      case 'completed':
        return 'Call Ended';
      case 'failed':
        return 'Call Failed';
      case 'busy':
        return 'Line Busy';
      case 'no-answer':
        return 'No Answer';
      case 'canceled':
        return 'Call Canceled';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initiated':
      case 'connecting':
        return <PhoneForwarded className="w-16 h-16 text-blue-500 animate-pulse" />;
      case 'ringing':
        return <PhoneCall className="w-16 h-16 text-blue-500 animate-pulse" />;
      case 'in-progress':
        return <Phone className="w-16 h-16 text-green-600" />;
      case 'completed':
        return <Phone className="w-16 h-16 text-gray-600" />;
      case 'failed':
      case 'canceled':
      case 'busy':
      case 'no-answer':
        return <PhoneOff className="w-16 h-16 text-red-500" />;
      default:
        return <Phone className="w-16 h-16 text-gray-600" />;
    }
  };

  const getBackgroundClass = () => {
    switch (status) {
      case 'in-progress':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'connecting':
      case 'ringing':
      case 'initiated':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      case 'failed':
      case 'busy':
      case 'no-answer':
      case 'canceled':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent className={cn(
        "max-w-md w-full h-[600px] p-0 rounded-3xl overflow-hidden border-0 shadow-2xl",
        getBackgroundClass()
      )}>
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <h3 className="text-sm text-muted-foreground font-medium mb-2">
            {getStatusDisplay()}
          </h3>
          <h2 className="text-2xl font-bold text-foreground">
            {contactName || phoneNumber}
          </h2>
          {contactName && (
            <p className="text-sm text-muted-foreground mt-1">{phoneNumber}</p>
          )}
        </div>

        {/* Avatar/Icon Section */}
        <div className="flex justify-center mb-8">
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
            status === 'in-progress' ? "bg-green-500" : 
            status === 'connecting' || status === 'ringing' || status === 'initiated' ? "bg-blue-500" :
            status === 'failed' || status === 'busy' || status === 'no-answer' || status === 'canceled' ? "bg-red-500" :
            "bg-gray-500"
          )}>
            {getStatusIcon()}
          </div>
        </div>

        {/* Call Duration */}
        {status === 'in-progress' && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2">
              <Timer className="w-5 h-5 text-muted-foreground" />
              <span className="text-xl font-mono font-semibold text-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex-1 flex flex-col justify-end p-8">
          {status === 'in-progress' && (
            <div className="flex justify-center gap-6 mb-8">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-16 h-16 rounded-full p-0",
                  isMuted ? "bg-red-100 border-red-300" : "bg-background"
                )}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-16 h-16 rounded-full p-0",
                  isSpeaker ? "bg-blue-100 border-blue-300" : "bg-background"
                )}
                onClick={() => setIsSpeaker(!isSpeaker)}
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Hang Up Button */}
          {(status === 'connecting' || status === 'ringing' || status === 'in-progress' || status === 'initiated') && (
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                className="w-20 h-20 rounded-full p-0 bg-red-500 hover:bg-red-600 shadow-lg"
                onClick={onHangUp}
              >
                <PhoneOff className="h-8 w-8" />
              </Button>
            </div>
          )}

          {/* End Call Message */}
          {(status === 'completed' || status === 'failed' || status === 'canceled') && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Call will close automatically</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}