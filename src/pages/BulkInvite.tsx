
import { InvitationHelper } from "@/components/InvitationHelper";

const BulkInvite = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bulk User Invitations
          </h1>
          <p className="text-gray-600">
            Send invitations to multiple users at once
          </p>
        </div>
        <InvitationHelper />
      </div>
    </div>
  );
};

export default BulkInvite;
