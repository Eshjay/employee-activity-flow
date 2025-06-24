
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmailManagement } from "@/hooks/useEmailManagement";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Invitation {
  id: string;
  email: string;
  invitation_token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  invited_by_profile: {
    name: string;
    email: string;
  };
}

export const EmailManagement = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { getInvitations } = useEmailManagement();
  const { profile } = useAuth();

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const getInvitationStatus = (invitation: Invitation) => {
    if (invitation.used_at) {
      return { status: 'used', label: 'Used', color: 'bg-green-100 text-green-700' };
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    
    return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading email management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Management
              </CardTitle>
              <CardDescription>
                Track user invitations and email communications
              </CardDescription>
            </div>
            <Button 
              onClick={loadInvitations}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">User Invitations</CardTitle>
          <CardDescription>
            {invitations.length} total invitations sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invitations found
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const statusInfo = getInvitationStatus(invitation);
                return (
                  <div
                    key={invitation.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 space-y-2 sm:space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invitation.email}</span>
                        <Badge className={statusInfo.color}>
                          {statusInfo.status === 'used' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {statusInfo.status === 'expired' && <XCircle className="w-3 h-3 mr-1" />}
                          {statusInfo.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Invited by: {invitation.invited_by_profile?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        {!invitation.used_at && (
                          <span className="ml-2">
                            • Expires: {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                          </span>
                        )}
                        {invitation.used_at && (
                          <span className="ml-2">
                            • Used: {formatDistanceToNow(new Date(invitation.used_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
