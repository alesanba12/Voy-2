export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface OrganizerVerificationResDTO {
  id: number;
  userExternalId: string;
  userEmail: string;
  status: VerificationStatus;
  dniFrontUrl: string;
  dniBackUrl: string;
  additionalInfo: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface OrganizerRejectReqDTO {
  reason: string;
}