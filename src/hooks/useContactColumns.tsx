
import { ColumnDef } from "@tanstack/react-table";
import { ContactWithLead } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CallFormDialog } from "@/components/CallFormDialog";
import { SendSMSDialog } from "@/components/SendSMSDialog";
import { SendEmailDialog } from "@/components/SendEmailDialog";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatInTimeZone } from "date-fns-tz";

interface UseContactColumnsProps {
  onRemove: (id: string) => void;
  onRowClick: (id: string) => void;
}

const timezoneFlags: { [key: string]: string } = {
  'America': '🇺🇸',
  'Europe': '🇪🇺',
  'Asia': '🇯🇵',
  'Australia': '🇦🇺',
  'Pacific': '🌏',
  'UTC': '🌍',
};

export const useContactColumns = ({ onRemove, onRowClick }: UseContactColumnsProps) => {
  const getContactLabel = (contact: ContactWithLead) => {
    if (contact.leadInfo) {
      const stage = contact.leadInfo.stage.charAt(0).toUpperCase() + contact.leadInfo.stage.slice(1);
      return (
        <Badge variant="secondary">
          Lead - {stage}
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        Customer
      </Badge>
    );
  };

  const getTimezoneFlag = (timezone: string) => {
    const region = timezone.split('/')[0];
    return timezoneFlags[region] || '🌍';
  };

  const getCurrentTime = (timezone: string) => {
    try {
      const time = formatInTimeZone(new Date(), timezone || 'UTC', 'h:mm a');
      const flag = getTimezoneFlag(timezone);
      return `${flag} ${time}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '🌍 Invalid timezone';
    }
  };

  const columns: ColumnDef<ContactWithLead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? "indeterminate" : false)}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium" onClick={() => onRowClick(row.original.id)}>
          {row.getValue("name")}
        </div>
      ),
    },
    {
      header: "Type",
      id: "type",
      cell: ({ row }) => getContactLabel(row.original),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Local Time",
      accessorKey: "timezone",
      cell: ({ row }) => getCurrentTime(row.getValue("timezone")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1 sm:gap-2">
          <CallFormDialog contact={row.original} variant="ghost" size="icon" />
          <SendSMSDialog contact={row.original} variant="ghost" size="icon" />
          <SendEmailDialog contact={row.original} variant="ghost" size="icon" />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(row.original.id);
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};
