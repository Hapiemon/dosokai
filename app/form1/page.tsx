import ResponseForm from '@/app/components/ResponseForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Form1Page() {
  const form = await prisma.form.findUnique({ where: { formId: 'form1' } });

  if (form && form.status !== '実施中') {
    redirect('/form-end');
  }

  return <ResponseForm formId="form1" />;
}
