import Link from 'next/link';
export default function HealthPage() {
  return <main dir="rtl" style={{fontFamily:'Arial, sans-serif',padding:32}}>
    <h1>وائم — حالة الواجهة</h1><p>الواجهة الثابتة متاحة.</p>
    <p>هذه الصفحة لا تتحقق من قاعدة بيانات أو خادم API.</p>
    <Link href="/">العودة إلى لوحة القيادة</Link>
  </main>;
}
