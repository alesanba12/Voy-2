export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface OrganizerVerificationRes {
  userExternalId: string;
  userEmail: string;
  status: VerificationStatus;
  dniFrontUrl: string;
  dniBackUrl: string;
  additionalInfo: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface OrganizerRejectReq {
  reason: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface OrganizerQueryParams {
  status: VerificationStatus | 'ALL';
  page: number;
  size: number;
}
