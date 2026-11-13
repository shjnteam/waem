'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpLeft, Bell, CheckCircle2, CircleDollarSign, ClipboardList, Clock3, LayoutDashboard, Settings, ShieldCheck, Users } from 'lucide-react';
import { coreTasks, demoMetrics } from '@/lib/demo-data';

export default function Dashboard() {
  const [today, setToday] = useState('');
  useEffect(() => setToday(new Intl.DateTimeFormat('ar-SA', { dateStyle: 'full' }).format(new Date())), []);
  const icons = [ClipboardList, CheckCircle2, Activity, AlertTriangle];
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">و</div><div><h1>وائم</h1><p>WAEM · SMART MANAGEMENT</p></div></div>
      <div><p className="nav-label">القائمة الرئيسية</p><nav className="nav">
        <Link className="active" href="/"><LayoutDashboard size={17}/><span>لوحة القيادة</span></Link>
        <a href="#tasks"><ClipboardList size={17}/><span>إدارة المشروع والمهام</span></a>
        <a href="#schedule"><Clock3 size={17}/><span>الجدول الزمني</span></a>
        <a href="#finance"><CircleDollarSign size={17}/><span>التكاليف والإيرادات</span></a>
        <a href="#reports"><Activity size={17}/><span>التقارير والمؤشرات</span></a>
      </nav></div>
      <div><p className="nav-label">الإدارة والنظام</p><nav className="nav">
        <Link href="/users"><Users size={17}/><span>المستخدمون والصلاحيات</span></Link>
        <a href="#audit"><ShieldCheck size={17}/><span>سجل التدقيق</span></a>
        <a href="#settings"><Settings size={17}/><span>الإعدادات</span></a>
      </nav></div>
      <div className="sidebar-foot">نسخة تأسيسية · MVP 0.1.0<br/>بيئة تجريبية وليست إنتاجية</div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">وائم 360° / لوحة القيادة</div><div className="top-actions"><Bell size={18} color="#718096"/><div className="avatar">م</div><span style={{fontSize:12}}>مدير المنصة</span></div></header>
      <div className="content">
        <div className="page-head"><div><div className="eyebrow">مساحة العمل الرئيسية</div><h2>مرحبًا بك في وائم</h2><p>{today || 'لوحة متابعة المشروع والإدارة المالية'}</p></div><button className="btn secondary" onClick={() => window.print()}>طباعة اللوحة</button></div>
        <div className="grid metrics">{demoMetrics.map((m,i)=>{const Icon=icons[i];return <section className="panel metric" key={m.label}><div className="metric-top"><span>{m.label}</span><span className="metric-icon"><Icon size={17}/></span></div><div className="metric-value">{m.value}</div><div className="metric-detail">{m.detail}</div></section>})}</div>
        <div className="grid section-grid">
          <section className="panel" id="tasks"><div className="panel-title"><h3>المهام الأساسية المعتمدة</h3><span>8 مهام · حسب وثيقة المتطلبات</span></div>{coreTasks.slice(0,5).map(t=><div className="task-row" key={t.id}><div><div className="task-name">{t.title}</div><div className="task-meta">{t.id} · موعد التسليم: {new Date(t.due+'T12:00:00').toLocaleDateString('ar-SA')}</div></div><span className="pill">{t.priority}</span></div>)}<div style={{marginTop:12,fontSize:11}}><a href="#tasks" style={{color:'#1d3857',textDecoration:'none'}}>عرض جميع المهام <ArrowUpLeft size={12} style={{verticalAlign:'middle'}}/></a></div></section>
          <section className="panel"><div className="panel-title"><h3>ملخص الجاهزية</h3><span>المرحلة الأولى</span></div><div className="empty"><ShieldCheck size={28} style={{margin:'0 auto 8px',display:'block',color:'#9aabbb'}}/>لم تُسجل بعد نتائج تنفيذ أو اعتماد.<br/>ستظهر المؤشرات بعد إدخال البيانات الفعلية.</div><div className="notice"><AlertTriangle size={18} style={{flexShrink:0,marginTop:2}}/><div><b>تنبيه بشأن البيانات</b><br/>الأرقام والمهام المعروضة هنا بيانات تأسيسية/تجريبية. لا توجد تكاليف أو إيرادات أو نسب إنجاز فعلية معتمدة حتى الآن.</div></div></section>
        </div>
        <div className="grid section-grid">
          <section className="panel" id="schedule"><div className="panel-title"><h3>المواعيد القادمة</h3><span>وفق المواعيد المحددة</span></div>{coreTasks.filter(t=>['W-002','W-003','W-004'].includes(t.id)).map(t=><div className="task-row" key={t.id}><div className="task-name">{t.title}</div><span className="pill gray">{new Date(t.due+'T12:00:00').toLocaleDateString('ar-SA')}</span></div>)}</section>
          <section className="panel" id="finance"><div className="panel-title"><h3>المؤشرات المالية</h3><span>بانتظار البيانات</span></div><div className="empty"><CircleDollarSign size={28} style={{margin:'0 auto 8px',display:'block',color:'#9aabbb'}}/>لم يتم إدخال افتراضات مالية بعد.<br/>لن يتم احتساب أرباح أو تدفقات نقدية دون مدخلات موثقة.</div></section>
        </div>
        <p className="footer-note">WAEM 360° · إصدار تأسيسي تجريبي · لا يمثل هذا الإصدار نظامًا محاسبيًا أو بيئة إنتاجية.</p>
      </div>
    </main>
  </div>;
}
