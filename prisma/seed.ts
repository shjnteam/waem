import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const roles = [
  ['PLATFORM_ADMIN', 'مدير المنصة'], ['PROJECT_MANAGER', 'مدير المشروع'],
  ['FINANCE_MANAGER', 'المدير المالي'], ['ACCOUNTANT', 'محاسب'],
  ['BUSINESS_ANALYST', 'محلل الأعمال'], ['DEVELOPER', 'المطور'],
  ['QA_TESTER', 'مختبر الجودة'], ['AUDITOR', 'المدقق'], ['READ_ONLY', 'قراءة فقط'],
] as const;

const permissions = [
  ['dashboard.read', 'dashboard', 'عرض لوحة القيادة'],
  ['users.read', 'users', 'عرض المستخدمين'], ['users.manage', 'users', 'إدارة المستخدمين'],
  ['roles.manage', 'access', 'إدارة الأدوار والصلاحيات'],
  ['projects.read', 'projects', 'عرض المشاريع'], ['projects.manage', 'projects', 'إدارة المشاريع'],
  ['audit.read', 'audit', 'عرض سجل التدقيق'], ['settings.manage', 'settings', 'إدارة الإعدادات'],
] as const;

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'waem-demo' }, update: {}, create: { name: 'وائم - بيئة تجريبية', slug: 'waem-demo' },
  });
  for (const [key, nameAr] of roles) await prisma.role.upsert({ where: { key }, update: { nameAr }, create: { key, nameAr } });
  for (const [key, module, description] of permissions) await prisma.permission.upsert({ where: { key }, update: { module, description }, create: { key, module, description } });
  await prisma.project.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'WAEM-360' } },
    update: {}, create: { organizationId: org.id, code: 'WAEM-360', name: 'تأسيس منصة وائم 360°', description: 'مشروع تجريبي أولي؛ التواريخ والبيانات التشغيلية تحتاج اعتمادًا.' },
  });
  console.log('Seed completed for WAEM demo organization, roles, permissions and project.');
}
main().finally(async () => prisma.$disconnect());
