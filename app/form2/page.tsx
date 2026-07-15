import ResponseForm from '@/app/components/ResponseForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '第2回アンケート',
};

export default async function Form2Page() {
  const form = await prisma.form.findUnique({ where: { formId: 'form2' } });

  if (!form) {
    redirect('/');
  }

  if (form.status !== '実施中') {
    redirect('/form-end');
  }

  return <ResponseForm formId="form2" />;
}