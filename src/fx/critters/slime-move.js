import {base,jelly,ground,drops,curve,smooth} from './_slime-animation.js';
export const meta={...base,name:'Slime move',desc:'A seamless in-place travel hop: crouch, push off, lean forward through the air and squash on landing. Translate the actor in the game.',tags:['critter','slime','movement','hop','loop'],duration:.8,loop:true};
export function draw(p,t,o) {
 const q=t/.8, airborne=q>.18&&q<.78, u=(q-.18)/.6;
 const s=curve(q,[[0,0],[.14,-.35],[.22,.3],[.45,.02],[.7,.15],[.8,-.42],[.91,.12],[1,0]]);
 const y=airborne?-18*4*u*(1-u):0;
 ground(p,o,0,17,airborne?.35:1);
 jelly(p,o,{s,y,t,period:meta.duration,round:airborne?.8:.1,lean:airborne?.18:0,face:q>.77&&q<.85?'shut':'normal'});
 drops(p,o,t-.64,{y:-1,speed:25,life:.16,count:4});
}
