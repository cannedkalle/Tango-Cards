import { cookies } from 'next/headers';
import { createGame, readGame, submitChoice } from '../../../lib/wild-guess/game.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
  try {const jar=await cookies();return respond({game:await readGame(jar.get('wg_session')?.value)});}
  catch {return respond({error:'The game database is unavailable. Please try again shortly.'},503);}
}
export async function POST(request){
  let sameOrigin=false;
  try {const origin=new URL(request.headers.get('origin'));sameOrigin=origin.host===request.headers.get('host') && ['http:','https:'].includes(origin.protocol);} catch {}
  if(!sameOrigin) return respond({error:'Please play from this website.'},403);
  if(Number(request.headers.get('content-length') || 0)>2048) return respond({error:'Request too large.'},413);
  let body;try {const text=await request.text();if(text.length>2048)return respond({error:'Request too large.'},413);body=JSON.parse(text);}catch{return respond({error:'Invalid request.'},400);}
  if(!body || !['start','choose'].includes(body.action))return respond({error:'Choose a game action.'},400);
  try {
    const jar=await cookies();let id=jar.get('wg_session')?.value;
    if(body.action==='start'){
      // Resume the endless game stored in this browser's session cookie.
      const prior=await readGame(id);
      if(prior && prior.pending===1)return respond({game:prior});
      id=await createGame();
      jar.set('wg_session',id,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/api/wild-guess',maxAge:604800});
      return respond({game:await readGame(id)});
    }
    if(!/^[a-f0-9]{64}$/.test(id || '')) return respond({error:'Start a game first.'},401);
    if(![0,1].includes(body.choice)||!Number.isInteger(body.position)||body.position<0)return respond({error:'Choose one of the two answers.'},400);
    return respond(await submitChoice(id,body.position,body.choice));
  }catch{return respond({error:'We could not save your game. Please try again.'},503);}
}
