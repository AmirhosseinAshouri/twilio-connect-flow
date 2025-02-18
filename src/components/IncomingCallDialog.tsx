
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallDialogProps {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
  phoneNumber: string;
}

export function IncomingCallDialog({
  open,
  onAccept,
  onReject,
  phoneNumber,
}: IncomingCallDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Incoming Call</h2>
            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              className="w-12 h-12 rounded-full p-0"
              onClick={onReject}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              className="w-12 h-12 rounded-full p-0 bg-green-500 hover:bg-green-600"
              onClick={onAccept}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
