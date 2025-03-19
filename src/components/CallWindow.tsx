
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Timer, PhoneCall, PhoneForwarded } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CallWindowProps {
  open: boolean;
  onClose: () => void;
  status: 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  phoneNumber: string;
  onHangUp: () => void;
}

export function CallWindow({ open, onClose, status, phoneNumber, onHangUp }: CallWindowProps) {
  const [duration, setDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Ensure component is visible when open is true
  const [isVisible, setIsVisible] = useState(false);

  // Set visibility based on open prop
  useEffect(() => {
    console.log(`CallWindow - Setting visibility based on open prop:`, { 
      open, 
      status, 
      phoneNumber 
    });
    
    if (open) {
      setIsVisible(true);
    }
  }, [open, status, phoneNumber]);

  // Handle call status changes
  useEffect(() => {
    console.log(`CallWindow - Current status: ${status}, Open: ${open}, Visible: ${isVisible}`);
    
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
        setDuration(0);
        // Don't hide immediately, wait for animation
        setTimeout(() => setIsVisible(false), 300);
      }, 2000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [status, timerInterval, onClose, open, isVisible]);

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
        return <PhoneForwarded className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'ringing':
        return <PhoneCall className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'in-progress':
        return <Phone className="w-8 h-8 text-green-600" />;
      case 'completed':
        return <Phone className="w-8 h-8 text-gray-600" />;
      case 'failed':
      case 'canceled':
      case 'busy':
      case 'no-answer':
        return <PhoneOff className="w-8 h-8 text-red-500" />;
      default:
        return <Phone className="w-8 h-8 text-gray-600" />;
    }
  };

  // Don't render anything if not visible
  if (!open && !isVisible) {
    console.log("CallWindow - Not rendering: not open and not visible");
    return null;
  }

  console.log("CallWindow - Rendering dialog with open:", open);

  return (
    <Dialog open={open} onOpenChange={(value) => {
      console.log("Dialog onOpenChange:", value);
      if (!value) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] fixed bottom-4 right-4 p-0 max-h-[300px] shadow-lg border-2 border-primary">
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              status === 'in-progress' ? "bg-green-100" : 
              status === 'connecting' || status === 'ringing' || status === 'initiated' ? "bg-blue-100" :
              status === 'failed' || status === 'busy' || status === 'no-answer' || status === 'canceled' ? "bg-red-100" :
              "bg-gray-100"
            )}>
              {getStatusIcon()}
            </div>
            <h2 className="text-lg font-semibold">{phoneNumber}</h2>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground font-medium">{getStatusDisplay()}</p>
            {status === 'in-progress' && (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          {(status === 'connecting' || status === 'ringing' || status === 'in-progress' || status === 'initiated') && (
            <Button
              variant="destructive"
              className="w-12 h-12 rounded-full p-0"
              onClick={onHangUp}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
