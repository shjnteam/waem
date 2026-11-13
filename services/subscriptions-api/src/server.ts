import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import {z} from 'zod';
import {calculateMRR,canTransition, type SubscriptionStatus} from './domain.js';
const app=express(); app.use(express.json({limit:'100kb'}));
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const adminKey=process.env.ADMIN_API_KEY;
if(!adminKey || adminKey==='replace-with-long-random-secret') throw new Error('Set a strong ADMIN_API_KEY');
app.use('/api', (req,res,next)=>{if(req.header('x-admin-api-key')!==adminKey)return res.status(401).json({error:'unauthorized'});next();});
const route=(fn:(req:express.Request,res:express.Response)=>Promise<void>)=>(req:express.Request,res:express.Response)=>{fn(req,res).catch(e=>{console.error(e);res.status(500).json({error:'internal_error'});});};
const id=z.string().uuid();
app.get('/api/dashboard',route(async(_req,res)=>{
 const [tenants,subs,unpaid]=await Promise.all([
 pool.query('SELECT count(*)::int AS n FROM waem.tenants'),
 pool.query('SELECT s.status,p.interval,s.price_minor FROM waem.subscriptions s JOIN waem.plans p ON p.id=s.plan_id'),
 pool.query("SELECT count(*)::int AS n FROM waem.invoices WHERE status='issued'")]);
 const items=subs.rows;res.json({tenants:tenants.rows[0].n,activeSubscriptions:items.filter(x=>x.status==='active').length,trialSubscriptions:items.filter(x=>x.status==='trialing').length,unpaidInvoices:unpaid.rows[0].n,mrrMinor:Math.round(calculateMRR(items)),currency:'SAR'});
}));
app.get('/api/tenants',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.tenants ORDER BY created_at DESC LIMIT 200')).rows);}));
app.post('/api/tenants',route(async(req,res)=>{
 const v=z.object({name:z.string().min(2).max(200),email:z.string().email()}).safeParse(req.body);
 if(!v.success){res.status(400).json(v.error.flatten());return;}
 const r=await pool.query('INSERT INTO waem.tenants(name,email) VALUES($1,$2) RETURNING *',[v.data.name,v.data.email]);res.status(201).json(r.rows[0]);
}));
app.get('/api/plans',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.plans ORDER BY created_at DESC')).rows);}));
app.post('/api/plans',route(async(req,res)=>{
 const v=z.object({name:z.string().min(2),priceMinor:z.number().int().nonnegative(),interval:z.enum(['monthly','yearly']),features:z.record(z.unknown()).default({})}).safeParse(req.body);
 if(!v.success){res.status(400).json(v.error.flatten());return;}
 const {name,priceMinor,interval,features}=v.data;
 const r=await pool.query('INSERT INTO waem.plans(name,price_minor,interval,features) VALUES($1,$2,$3,$4) RETURNING *',[name,priceMinor,interval,JSON.stringify(features)]);res.status(201).json(r.rows[0]);
}));
app.get('/api/subscriptions',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.subscriptions ORDER BY created_at DESC LIMIT 200')).rows);}));
app.post('/api/subscriptions',route(async(req,res)=>{
 const v=z.object({tenantId:id,planId:id,periodEnd:z.string().datetime(),status:z.enum(['trialing','active']).default('trialing')}).safeParse(req.body);
 if(!v.success){res.status(400).json(v.error.flatten());return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const plan=await c.query('SELECT price_minor,currency FROM waem.plans WHERE id=$1 AND active=true',[v.data.planId]);
 if(!plan.rowCount){await c.query('ROLLBACK');res.status(404).json({error:'plan_not_found'});return;}
 const r=await c.query('INSERT INTO waem.subscriptions(tenant_id,plan_id,current_period_end,status,price_minor,currency) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[v.data.tenantId,v.data.planId,v.data.periodEnd,v.data.status,plan.rows[0].price_minor,plan.rows[0].currency]);
 await c.query('INSERT INTO waem.audit_events(action,entity_type,entity_id) VALUES($1,$2,$3)',['subscription.created','subscription',r.rows[0].id]);await c.query('COMMIT');res.status(201).json(r.rows[0]);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
app.post('/api/subscriptions/:id/status',route(async(req,res)=>{
 const v=z.object({status:z.enum(['trialing','active','past_due','canceled','expired'])}).safeParse(req.body);
 if(!id.safeParse(req.params.id).success||!v.success){res.status(400).json({error:'invalid_input'});return;}
 const c=await pool.connect();try{await c.query('BEGIN');const prev=await c.query('SELECT status FROM waem.subscriptions WHERE id=$1 FOR UPDATE',[req.params.id]);
 if(!prev.rowCount){await c.query('ROLLBACK');res.status(404).json({error:'not_found'});return;}
 if(!canTransition(prev.rows[0].status as SubscriptionStatus,v.data.status)){await c.query('ROLLBACK');res.status(409).json({error:'invalid_transition'});return;}
 const r=await c.query('UPDATE waem.subscriptions SET status=$1 WHERE id=$2 RETURNING *',[v.data.status,req.params.id]);
 await c.query('INSERT INTO waem.audit_events(action,entity_type,entity_id,payload) VALUES($1,$2,$3,$4)',['subscription.status_changed','subscription',req.params.id,JSON.stringify({from:prev.rows[0].status,to:v.data.status})]);await c.query('COMMIT');res.json(r.rows[0]);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
app.get('/api/invoices',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.invoices ORDER BY created_at DESC LIMIT 200')).rows);}));
app.post('/api/invoices',route(async(req,res)=>{
 const v=z.object({subscriptionId:id,dueAt:z.string().datetime()}).safeParse(req.body);
 if(!v.success){res.status(400).json(v.error.flatten());return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const sub=await c.query('SELECT tenant_id,price_minor,currency FROM waem.subscriptions WHERE id=$1',[v.data.subscriptionId]);
 if(!sub.rowCount){await c.query('ROLLBACK');res.status(404).json({error:'subscription_not_found'});return;}
 const invoiceNo='W-'+crypto.randomUUID().slice(0,12).toUpperCase();
 const r=await c.query('INSERT INTO waem.invoices(tenant_id,subscription_id,invoice_no,amount_minor,currency,due_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[sub.rows[0].tenant_id,v.data.subscriptionId,invoiceNo,sub.rows[0].price_minor,sub.rows[0].currency,v.data.dueAt]);
 for(const days of [14,7,3,0])await c.query("INSERT INTO waem.reminders(invoice_id,kind,scheduled_at) VALUES($1,$2,$3::timestamptz - ($4 * interval '1 day'))",[r.rows[0].id,`due_minus_${days}`,v.data.dueAt,days]);
 await c.query('INSERT INTO waem.audit_events(action,entity_type,entity_id) VALUES($1,$2,$3)',['invoice.created','invoice',r.rows[0].id]);await c.query('COMMIT');res.status(201).json(r.rows[0]);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
app.get('/api/payments',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.payments ORDER BY created_at DESC LIMIT 200')).rows);}));
app.post('/api/payments/manual',route(async(req,res)=>{
 const v=z.object({invoiceId:id,amountMinor:z.number().int().positive(),reference:z.string().min(4).max(200)}).safeParse(req.body);
 if(!v.success){res.status(400).json(v.error.flatten());return;}
 const c=await pool.connect();try{await c.query('BEGIN');
 const invoice=await c.query('SELECT * FROM waem.invoices WHERE id=$1 FOR UPDATE',[v.data.invoiceId]);
 if(!invoice.rowCount){await c.query('ROLLBACK');res.status(404).json({error:'invoice_not_found'});return;}
 if(invoice.rows[0].status!=='issued'){await c.query('ROLLBACK');res.status(409).json({error:'invoice_not_payable'});return;}
 const sum=await c.query('SELECT COALESCE(sum(amount_minor),0)::bigint AS paid FROM waem.payments WHERE invoice_id=$1',[v.data.invoiceId]);
 if(BigInt(sum.rows[0].paid)+BigInt(v.data.amountMinor)>BigInt(invoice.rows[0].amount_minor)){await c.query('ROLLBACK');res.status(409).json({error:'overpayment'});return;}
 const r=await c.query("INSERT INTO waem.payments(invoice_id,amount_minor,provider,provider_reference) VALUES($1,$2,'manual',$3) ON CONFLICT(provider,provider_reference) DO NOTHING RETURNING *",[v.data.invoiceId,v.data.amountMinor,v.data.reference]);
 if(!r.rowCount){await c.query('ROLLBACK');res.status(409).json({error:'duplicate_reference'});return;}
 if(BigInt(sum.rows[0].paid)+BigInt(v.data.amountMinor)===BigInt(invoice.rows[0].amount_minor))await c.query("UPDATE waem.invoices SET status='paid' WHERE id=$1",[v.data.invoiceId]);
 await c.query('INSERT INTO waem.audit_events(action,entity_type,entity_id) VALUES($1,$2,$3)',['payment.recorded','payment',r.rows[0].id]);await c.query('COMMIT');res.status(201).json(r.rows[0]);
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}));
app.get('/api/reminders',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.reminders ORDER BY scheduled_at LIMIT 200')).rows);}));
app.get('/api/audit',route(async(_req,res)=>{res.json((await pool.query('SELECT * FROM waem.audit_events ORDER BY id DESC LIMIT 100')).rows);}));
app.listen(Number(process.env.PORT||3000),()=>console.log('WAEM P0 API listening'));
