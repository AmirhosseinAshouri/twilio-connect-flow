
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, ArrowLeft, Building2, Calendar, PenSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useContact } from "@/hooks/useContact";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { NewCallDialog } from "@/components/NewCallDialog";
import { CommunicationHistory } from "@/components/CommunicationHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm, ContactFormValues } from "@/components/ContactForm";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contact, loading, error, updateContact } = useContact(id || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleUpdateContact = async (values: ContactFormValues) => {
    if (contact && updateContact) {
      await updateContact({
        ...values,
        id: contact.id,
      });
      setEditDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!contact) {
    return (
      <div className="p-8">
        <h1>Contact not found</h1>
        <Link to="/contacts" className="text-blue-500 hover:underline">
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/contacts"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">{contact.name}</h1>
          </div>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <PenSquare className="h-4 w-4 mr-2" />
            Edit Contact
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NewCallDialog 
                contact={contact}
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                }
              />
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>No recent activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <CommunicationHistory contactId={contact.id} />

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
            </DialogHeader>
            <ContactForm 
              onSubmit={handleUpdateContact}
              defaultValues={{
                name: contact.name,
                email: contact.email || '',
                phone: contact.phone || '',
                company: contact.company || '',
                job_title: contact.job_title || '',
                birth_date: contact.birth_date || '',
                notes: contact.notes || '',
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
