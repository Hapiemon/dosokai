import { prisma } from '@/lib/prisma';

export type UnifiedResponse = {
  id: string;
  lastName: string;
  firstName: string;
  maidenName: string | null;
  phone: string | null;
  class: string;
  eventMay3?: number;
  eventSep20?: number;
  notAttending?: number;
  participationStatus?: string;
  companionStatus: string;
  companionAdults: number | null;
  companionChildren: number | null;
  settlementAmount?: number;
  paymentMethod?: string | null;
  settlementStatus?: string | null;
  hasAllergy: boolean;
  allergyDetails: string | null;
  remarks: string | null;
  createdAt: Date;
};

export async function getResponsesByForm(formId: string): Promise<UnifiedResponse[]> {
  if (formId === 'form2') {
    return prisma.responseForm2.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.response.findMany({
    where: { formId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteResponsesByForm(formId: string, ids: string[]) {
  if (formId === 'form2') {
    return prisma.responseForm2.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  return prisma.response.deleteMany({
    where: {
      id: { in: ids },
      formId,
    },
  });
}
