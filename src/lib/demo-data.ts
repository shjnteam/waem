export const demoMetrics = [
  { label: 'إجمالي المهام', value: '8', detail: 'المهام الأساسية المعتمدة', icon: 'list' },
  { label: 'المهام المكتملة', value: '0', detail: 'لا توجد نتائج تنفيذ مسجلة', icon: 'check' },
  { label: 'المهام الجارية', value: '0', detail: 'بانتظار تحديث الحالة', icon: 'activity' },
  { label: 'المخاطر المفتوحة', value: 'غير محدد', detail: 'لم يُدخل سجل المخاطر بعد', icon: 'alert' },
];

export const initialUsers = [
  { id: 'USR-001', name: 'مدير المنصة التجريبي', email: 'admin@example.test', role: 'مدير المنصة', status: 'نشط' },
  { id: 'USR-002', name: 'مدير المشروع التجريبي', email: 'pm@example.test', role: 'مدير المشروع', status: 'نشط' },
  { id: 'USR-003', name: 'محاسب تجريبي', email: 'accountant@example.test', role: 'محاسب', status: 'معلق' },
];

export const roles = [
  'مدير المنصة', 'مدير المشروع', 'المدير المالي', 'محاسب', 'محلل الأعمال',
  'المطور', 'مختبر الجودة', 'المدقق', 'قراءة فقط',
];

export const coreTasks = [
  { id: 'W-001', title: 'إعداد النموذج المالي لمنصة وائم', due: '2026-11-29', priority: 'عالية' },
  { id: 'W-002', title: 'دراسة التكاليف ومصادر الإيرادات', due: '2026-11-18', priority: 'عاجلة' },
  { id: 'W-003', title: 'تحليل نماذج الاشتراكات', due: '2026-11-18', priority: 'عاجلة' },
  { id: 'W-004', title: 'تحليل بيانات التسعير والسوق والمنافسين', due: '2026-11-22', priority: 'عالية' },
  { id: 'W-005', title: 'المساهمة في تطوير نموذج العمل وآليات الإيرادات', due: '2026-11-29', priority: 'متوسطة' },
  { id: 'W-006', title: 'تحديد متطلبات النظام المحاسبي وتوثيقها', due: '2026-12-08', priority: 'متوسطة' },
  { id: 'W-007', title: 'اختبار النظام والتحقق من صحة مخرجاته', due: '2027-02-10', priority: 'متوسطة' },
  { id: 'W-008', title: 'المتابعة والتنسيق مع الفريق التقني', due: '2027-02-15', priority: 'مستمرة' },
];
