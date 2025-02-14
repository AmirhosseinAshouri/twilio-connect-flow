
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (status === 'in-progress' && !timerInterval) {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (status !== 'in-progress' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (status === 'completed' || status === 'failed' || status === 'canceled') {
      setTimeout(() => {
        onClose();
        setDuration(0);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              status === 'in-progress' ? "bg-green-100" : "bg-gray-100"
            )}>
              <Phone className={cn(
                "w-8 h-8",
                status === 'in-progress' ? "text-green-600" : "text-gray-600"
              )} />
            </div>
            <h2 className="text-lg font-semibold">{phoneNumber}</h2>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">{getStatusDisplay()}</p>
            {status === 'in-progress' && (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          {(status === 'connecting' || status === 'ringing' || status === 'in-progress') && (
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
