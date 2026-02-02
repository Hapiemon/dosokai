import ResponseForm from '@/app/components/ResponseForm';

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResponseForm />;
}
