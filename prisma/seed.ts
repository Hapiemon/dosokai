import { prisma } from './lib/prisma';

async function seed() {
  try {
    // 既存の form1 チェック
    const existingForm = await prisma.form.findUnique({
      where: { formId: 'form1' },
    });

    if (!existingForm) {
      // form1 を作成
      const form = await prisma.form.create({
        data: {
          formId: 'form1',
          title: '🌸 同窓会のご案内 🌸',
          status: '実施中',
        },
      });

      console.log('✅ Form1 が作成されました:', form);
    } else {
      console.log('✅ Form1 は既に存在します:', existingForm);
    }
  } catch (error) {
    console.error('❌ シード実行エラー:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
