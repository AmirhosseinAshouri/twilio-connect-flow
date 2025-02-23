
import { useState, useEffect, Fragment } from "react";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm, ContactFormValues } from "@/components/ContactForm";
import { Plus, Search, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallFormDialog } from "@/components/CallFormDialog";
import { SendSMSDialog } from "@/components/SendSMSDialog";
import { SendEmailDialog } from "@/components/SendEmailDialog";
import { useNavigate } from "react-router-dom";
import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Lead, Contact } from "@/types";

// Mapping of timezone regions to flag emojis
const timezoneFlags: { [key: string]: string } = {
  'America': '🇺🇸',
  'Europe': '🇪🇺',
  'Asia': '🇯🇵',
  'Australia': '🇦🇺',
  'Pacific': '🌏',
  'UTC': '🌍',
};

interface ContactWithLead extends Contact {
  leadInfo?: {
    stage: string;
  };
  note?: string;
}

const Contacts = () => {
  const { contacts, loading, addContact, removeContact } = useContacts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactsWithLeads, setContactsWithLeads] = useState<ContactWithLead[]>([]);
  const navigate = useNavigate();

  // Move filteredContacts definition before its usage
  const filteredContacts = contactsWithLeads.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.company?.toLowerCase() || '').includes(searchLower)
    );
  });

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
        <div className="font-medium flex items-center gap-2">
          {row.getValue("name")}
          {getContactLabel(row.original)}
        </div>
      ),
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
              handleRemoveContact(e, row.original.id);
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => Boolean(row.original.note),
    getExpandedRowModel: getExpandedRowModel(),
  });

  useEffect(() => {
    const fetchLeadsForContacts = async () => {
      try {
        const { data: leads } = await supabase
          .from('deals')
          .select('contact_id, stage');

        const contactsWithLeadInfo: ContactWithLead[] = contacts.map(contact => ({
          ...contact,
          leadInfo: undefined
        }));

        leads?.forEach((lead) => {
          const contact = contactsWithLeadInfo.find(c => c.id === lead.contact_id);
          if (contact) {
            contact.leadInfo = { stage: lead.stage };
          }
        });

        setContactsWithLeads(contactsWithLeadInfo);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    if (contacts.length > 0) {
      fetchLeadsForContacts();
    } else {
      setContactsWithLeads([]);
    }
  }, [contacts]);

  const getContactLabel = (contact: ContactWithLead) => {
    if (contact.leadInfo) {
      const stage = contact.leadInfo.stage.charAt(0).toUpperCase() + contact.leadInfo.stage.slice(1);
      return (
        <Badge variant="secondary" className="ml-2">
          Lead - {stage}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="ml-2">
        Customer
      </Badge>
    );
  };

  const handleAddContact = async (values: ContactFormValues) => {
    const contactData = {
      name: values.name || '',
      company: values.company || '',
      email: values.email || '',
      phone: values.phone || '',
      timezone: values.timezone || 'UTC'
    };
    const newContact = await addContact(contactData);
    if (newContact) {
      setOpen(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleRemoveContact = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeContact(id);
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

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Contacts</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <ContactForm onSubmit={handleAddContact} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow 
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => handleRowClick(row.original.id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && row.original.note && (
                        <TableRow>
                          <TableCell colSpan={row.getVisibleCells().length}>
                            <div className="flex items-start py-2 text-primary/80">
                              <span className="me-3 mt-0.5 flex w-7 shrink-0 justify-center" aria-hidden="true">
                                <Info className="opacity-60" size={16} strokeWidth={2} />
                              </span>
                              <p className="text-sm">{row.original.note}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
