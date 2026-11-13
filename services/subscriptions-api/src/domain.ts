export type SubscriptionStatus = 'trialing'|'active'|'past_due'|'canceled'|'expired';
const transitions: Record<SubscriptionStatus,SubscriptionStatus[]> = {
 trialing:['active','canceled','expired'], active:['past_due','canceled','expired'],
 past_due:['active','canceled','expired'], canceled:[], expired:[]
};
export function canTransition(from:SubscriptionStatus,to:SubscriptionStatus):boolean { return transitions[from]?.includes(to) ?? false; }
export function calculateMRR(items:{status:string;interval:string;price_minor:number|string}[]):number {
 return items.filter(x=>x.status==='active').reduce((sum,x)=>sum+Number(x.price_minor)/(x.interval==='yearly'?12:1),0);
}
