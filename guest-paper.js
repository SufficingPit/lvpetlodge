'use strict';
/* The New Guest form as paper: the same three pages as Ashley's original printout, redrawn
   sharp. guestPaper(data, base) returns the pages as HTML; with no data they're blank (that's
   what new-guest-forms.pdf is made from), and a filled-in form prints with its answers on the
   lines. Pages 1 and 2 repeat for each pet; the waiver is once at the end.
   base: where img/form/ lives (the app passes the website's address).
   Styles are in guestPaperCSS; the page adds them once. */
(function(){
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const PAW = '<path d="M12.1 11.2c-3.3 0-6.4 3.7-6.4 6.5 0 2.1 1.6 3.1 3.5 3.1 1.2 0 2-.7 2.9-.7s1.7.7 2.9.7c1.9 0 3.5-1 3.5-3.1 0-2.8-3.1-6.5-6.4-6.5z"/><ellipse cx="5.6" cy="9.3" rx="2.3" ry="2.9" transform="rotate(-18 5.6 9.3)"/><ellipse cx="9.7" cy="5.4" rx="2.3" ry="3" transform="rotate(-6 9.7 5.4)"/><ellipse cx="14.6" cy="5.4" rx="2.3" ry="3" transform="rotate(6 14.6 5.4)"/><ellipse cx="18.7" cy="9.3" rx="2.3" ry="2.9" transform="rotate(18 18.7 9.3)"/>';
const paw = (color, size, rot) => '<svg class="paw" viewBox="0 0 24 24" style="width:'+size+';height:'+size+';fill:'+color+(rot ? ';transform:rotate('+rot+'deg)' : '')+'">'+PAW+'</svg>';
// a little trail of black paw prints walking along a line
function trail(n){
  let g = '';
  for(let i = 0; i < n; i++){ const x = 6 + i*15, y = i % 2 ? 4 : 13;
    g += '<g transform="translate('+x+' '+y+') rotate('+(i % 2 ? 100 : 80)+' 5 5) scale(.42)">'+PAW+'</g>'; }
  return '<svg class="trail" viewBox="0 0 '+(n*15+8)+' 26" preserveAspectRatio="xMidYMid meet">'+g+'</svg>';
}
const fmtDate = v => { if(!v) return ''; const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(v); return m ? (+m[2])+'/'+(+m[3])+'/'+m[1] : v; };

function guestPaper(d, base){
  base = base || '';
  const img = (n, cls) => '<img class="'+(cls || 'art')+'" src="'+base+'img/form/'+n+'.png" alt="">';
  const D = d || {}, O = D.owner || {}, pets = (D.pets && D.pets.length) ? D.pets : [{}];
  // a label and its line; the answer (if any) sits on the line
  const ln = (label, v, cls) => '<div class="fl'+(cls ? ' '+cls : '')+'">'+(label ? '<span class="lb">'+label+'</span>' : '')+'<span class="ln">'+esc(v)+'</span></div>';
  const line = (v, cls) => '<div class="fl'+(cls ? ' '+cls : '')+'"><span class="ln">'+esc(v)+'</span></div>';
  const box = (on, label) => '<span class="cb"><i class="'+(on ? 'on' : '')+'"></i>'+label+'</span>';
  const yn = (v) => box(v==='yes', 'Yes')+box(v==='no', 'No');

  function page1(p){
    const meds = [0, 1].map(i => (p.meds || [])[i] || {});
    return '<section class="pg p1">'
      +'<div class="frame">'
      +'<div class="hd">'+img('corgi', 'art corgi')+'<div class="welcome">WELCOME</div>'+img('beagle', 'art beagle')+'</div>'
      +'<div class="lodge"><span>Little Village Pet Lodge</span>'+img('kitten', 'art kit')+'</div>'
      +'<p class="intro">Thank you for giving us the opportunity to care for your pet. To ensure the best care possible, please take the time to fill in this form completely.</p>'
      +'<div class="h-pet"><span>Pet Information</span><span class="paws">'+paw('#1f9a3a','.42in',-8)+paw('#e0261f','.42in',6)+paw('#111','.42in',-4)+paw('#e0261f','.42in',8)+paw('#f39200','.42in',-6)+'</span></div>'
      +'<div class="petbox"><div class="col">'
        +ln('Name of Pet:', p.name)+ln('Breed:', p.breed)+ln('Color:', p.color)+ln('Date of Birth:', fmtDate(p.dob))
      +'</div><div class="col kinds">'
        +'<div class="fl">'+box(p.species==='dog','Dog')+box(p.species==='cat','Cat')+box(p.species==='other','Small Mammal (Specify)')+'<span class="ln">'+esc(p.species==='other' ? p.other : '')+'</span></div>'
        +'<div class="fl two">'+box(p.sex==='m','Male')+box(p.sex==='m' && p.fixed==='yes','Neutered')+'</div>'
        +'<div class="fl two">'+box(p.sex==='f','Female')+box(p.sex==='f' && p.fixed==='yes','Spayed')+img('puppy', 'art pup')+'</div>'
      +'</div></div>'
      +'<div class="band">'+trail(9)+'<span class="h-reg">REGISTRATION</span>'+trail(9)+'</div>'
      +'<div class="reg"><div class="col sm">'
        +ln('First Name:', O.first)+ln('Last Name:', O.last)+ln('Email Address:', O.email)+ln('Cell Phone:', O.cell)+ln('Main Phone:', O.main)+ln('Work Phone:', O.work)
        +'<div class="gap"></div>'+ln('Spouse/Co-Owner:', O.coName)+ln('Main Phone:', O.coMain)+ln('Alt. Phone:', O.coAlt)
        +'<div class="gap"></div>'+ln('Emergency Contact Name:', O.emName)+ln('Main Phone:', O.emMain)+ln('Alt. Phone:', O.emAlt)
        +'<div class="gap"></div>'+ln('Veterinarian:', O.vet)+ln('Phone:', O.vetPhone)
      +'</div><div class="col md">'
        +ln('Date:', fmtDate(D.date))+ln('City:', O.city)+ln('State:', O.state)+ln('ZIP:', O.zip)
        +'<div class="pair">'+img('whitedog')+img('redcat')+'</div>'
      +'</div></div>'
      +'<div class="band">'+trail(9)+'<span class="h-med">Medication</span>'+trail(9)+'</div>'
      +'<div class="medbox">'
        +'<div class="cond"><div class="cq">I have the following allergies/medical conditions you should know about:</div>'+line([p.conditions].concat((p.meds || []).slice(2).map(m => 'Also: '+[m.name, m.dose, m.freq, m.instr].filter(Boolean).join(', '))).filter(Boolean).join('. '))+img('corgipup', 'art cpup')+'</div>'
        +'<div class="medh">I need to get the following medication(s):</div>'
        +'<div class="meds">'+meds.map(m => '<div class="col">'+ln('Name:', m.name)+ln('Dosage:', m.dose)+ln('Frequency:', m.freq)+ln('Dosing Instructions:', m.instr)+'</div>').join('')+'</div>'
      +'</div>'
      +'<div class="foot">'+paw('#1f6fb5','.3in')+'<b>See back &#8594;</b></div>'
      +'</div></section>';
  }

  function page2(p){
    const pers = ['Shy at First','Paw-fers Privacy','Playful Pup/Purrer','Cuddlebug','Love at First Lick'];
    const persKey = ['Shy at first','Paw-fers privacy','Playful','Cuddlebug','Love at first lick'];
    const along = ['Cats','Dogs','Humans','Everyone'];
    return '<section class="pg p2"><div class="frame">'
      +'<div class="h-diet">'+img('beagle2', 'art b2')+paw('#1f6fb5','.4in',-10)+paw('#e0261f','.4in',8)+'<span>Diet Information</span>'+paw('#111','.4in',-6)+paw('#1f9a3a','.4in',10)+img('siamese', 'art siam')+'</div>'
      +'<div class="diet">'
        +ln('Describe your pet’s diet:', p.diet)+line('')
        +ln('Type of Food/Brand Given:', p.food)+line('')
        +ln('How Many Times Per Day:', p.perDay, 'short')
        +ln('Any special instructions:', p.dietNotes)+line('')
        +'<div class="treats"><div class="tq">What about treats?</div>'
          +'<div class="fl">'+box(p.treats==='yes','Yes, please, I especially love:')+'<span class="ln">'+esc(p.treatFav)+'</span></div>'
          +'<div class="fl">'+box(p.treats==='no','No, thank you, I’m on a diet.')+'</div>'+img('sleepcat', 'art sleep')+'</div>'
      +'</div>'
      +'<div class="band">'+trail(8)+'<span class="h-add">Additional Information</span>'+trail(8)+'</div>'
      +'<div class="add">'
        +'<div class="q">My paw-sonality can be summed up as:</div>'
        +'<div class="fl spread">'+pers.map((l, i) => box((p.personality || []).includes(persKey[i]), l)).join('')+'</div>'
        +ln('You should also know:', p.alsoKnow)
        +'<div class="q">I get along with:</div>'
        +'<div class="fl">'+along.map(l => box((p.along || []).includes(l), l)).join('')+img('pug', 'art pug')+'</div>'
        +ln('Other things you should know about me:', p.notes)
        +'<hr>'
        +'<div class="fl beh"><span class="jump">I can JUMP FENCES!!!</span>'+yn(p.jumps)+'</div>'
        +'<div class="fl beh"><span class="bq">I have been known to bite:</span>'+yn(p.bites)+'</div>'
        +'<div class="fl beh"><span class="bq">I have been known to start a fight:</span>'+yn(p.fights)+paw('#f39200','.42in',12)+'</div>'
        +'<div class="likes"><div class="col">'+ln('Likes:', p.likes)+ln('Dislikes:', p.dislikes)+'</div>'+img('bulldog')+img('cat2')+'</div>'
        +ln('Items you brought along with you for this stay:', D.items)+line('')+line('')
        +'<div class="beds"><div class="fl"><b>Do I eat/chew up beds?</b>'+yn(p.chews)+'</div>'
        +'<b>If a bed is provided by L.V. Pet Lodge and I chew it up, my parents will be charged $10 to help replace the bed.</b></div>'
      +'</div>'
      +'</div></section>';
  }

  function page3(){
    const S = D.sign || {};
    return '<section class="pg p3"><div class="frame">'
      +'<div class="w-top">'+img('corgipup', 'art wt1')+img('dogbone', 'art wt2')+'</div>'
      +ln('My pet may be picked up and released to:', O.pickupBy)
      +'<p class="c caps">NOTE PICK UP AND DROP OFF TIMES! EXTRA CHARGE OF $10.00 IF NECESSARY</p>'
      +'<p class="c">Consent for Medical Care and Legal Waiver</p>'
      +'<p class="in">Little Village Pet Lodge cares about every pet! We will do everything possible to make their stay with us a happy, safe, and well cared for time. Pet owner specifically represents to kennel that pet has not been exposed to any contagious diseases within the last 30 days and that all vaccinations are up to date. It is understood that any animal found to be harboring any type of external parasite will be treated accordingly at the expense of the pet owner.</p>'
      +'<p class="in">Pet owner agrees to pay rate for boarding in effect on the date pet is checked into kennel plus any extra fees incurred. Pet owner further agrees to pay all costs and charges for our services before pet is released. ANY ANIMAL LEFT FOR 10 DAYS AFTER SCHEDULED PICK UP DATE, WITHOUT NOTIFICATION TO KENNEL, IS DEEMED ABANDONED AND WILL BE SUBJECT TO DISPOSAL AT LITTLE VILLAGE PET LODGE’S DISCRETION.</p>'
      +'<p class="in">Little Village Pet Lodge will exercise reasonable care for all pets. If the occasion should arise that pet becomes ill, or the state of animal’s health otherwise requires professional attention, Kennel will contact</p>'
      +'<div class="vet"><p>NORTH PARK ANIMAL HOSPITAL<br>1625 BURLINGTON ST<br>HOLDREGE, NE 68949<br>(308) 995-2419</p>'+img('puppy', 'art vp')+img('greycat', 'art vc')+'</div>'
      +'<p>All fees for emergency call to North Park Veterinarian will be paid by Pet Owner before pet’s release.</p>'
      +'<p class="in">Liability of kennel shall in no event exceed the lesser of the current value of a pet of same species, or the sum of $300 per pet while it is in the care of the kennel. Furthermore, Little Village Pet Lodge is NOT responsible if there is an unfortunate event or death of pet after all attempts are made to keep your pet safe and healthy. We are dedicated to ensuring you with Peace of Mind, Educated with Knowledge, and have our Hearts filled with love for all Furbabies!</p>'
      +'<p class="in">If your pet is scheduled for a pick up or drop off by our kennel vehicle, kennel/driver shall not be held responsible for vehicle accidents, injuries, natural disasters, or death. Pet owner further agrees to be solely responsible for any and all acts or behavior of said pet while it is in the care of the kennel.</p>'
      +'<div class="ack"><p class="in">I hereby acknowledge that the above information is correct and that I have read the above contract and agree as owner or representative of the animal to the foregoing terms.</p>'+img('cat2', 'art ackc')+'</div>'
      +'<div class="sign"><div class="fl s1"><span class="lb">SIGN</span><span class="ln">'+(S.img ? '<img class="sig" src="'+esc(S.img)+'" alt="">' : '')+(S.name ? '<span class="signame">'+esc(S.name)+'</span>' : '')+'</span></div>'
        +'<div class="fl s2"><span class="lb">DATE</span><span class="ln">'+esc(fmtDate(S.date))+'</span></div></div>'
      +'<p class="c bd">BOARDING DATES</p>'
      +'<div class="dates">'+[0,1,2,3].map(() => '<div class="fl"><span class="ln"></span><span class="lb to">to</span><span class="ln"></span></div>').join('')+'</div>'
      +'</div></section>';
  }
  return pets.map(p => page1(p) + page2(p)).join('') + page3();
}

const guestPaperCSS = `
.pg{width:8.5in;height:11in;background:#fff;color:#111;position:relative;overflow:hidden;font:10.5pt/1.25 Verdana,"DejaVu Sans","Noto Sans",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg *{box-sizing:border-box}
.pg .frame{position:absolute;inset:.5in .6in .45in;border:1px solid #d6d6d6;border-radius:4px;padding:.24in .32in .16in;display:flex;flex-direction:column}
.pg .frame>*{flex:none}
.pg .art{display:block;object-fit:contain}
.pg .paw{display:inline-block;flex:none}
.pg .trail{width:1.85in;height:.3in;flex:none}
.pg .fl{display:flex;align-items:flex-end;gap:5px;margin:0 0 .055in;min-width:0}
.pg .lb{white-space:nowrap;flex:none}
.pg .ln{flex:1;min-width:.4in;border-bottom:1px solid #444;min-height:1.2em;line-height:1.15;padding:0 3px 1px;color:#1d3c8c;font-family:Arimo,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg .cb{display:inline-flex;align-items:center;gap:3px;white-space:nowrap;margin-right:.14in;flex:none}
.pg .cb i{display:inline-block;width:.12in;height:.12in;border:1px solid #333;border-radius:2px;position:relative;flex:none}
.pg .cb i.on::after{content:"";position:absolute;left:.03in;top:-.02in;width:.04in;height:.09in;border:solid #1d3c8c;border-width:0 2px 2px 0;transform:rotate(40deg)}
.pg .col{flex:1;min-width:0}
.pg .band{display:flex;align-items:center;justify-content:space-between;gap:.1in;margin:.07in 0 .05in}
/* page 1 */
.p1 .hd{display:flex;align-items:center;gap:.12in;height:.98in}
.p1 .corgi{width:1.35in;height:1.05in}
.p1 .welcome{flex:1;text-align:center;font:58pt/1 "Alfa Slab One",Rockwell,serif;letter-spacing:.01em;background:linear-gradient(#ffd37a,#f7a531 45%,#e57e12 60%,#f6a43a);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:1.2px #b85f0a;filter:drop-shadow(1.5px 2px 0 rgba(140,70,0,.35))}
.p1 .beagle{width:.5in;height:.75in;align-self:flex-end}
.p1 .lodge{display:flex;align-items:flex-end;gap:.08in;margin:.02in 0 .06in .1in}
.p1 .lodge span{font:31pt/1.1 Caladea,Cambria,Georgia,serif;color:#1f4db5}
.p1 .kit{width:.45in;height:.6in}
.p1 .intro{font-size:8.6pt;margin:0 .1in .08in;line-height:1.3}
.p1 .h-pet{display:flex;align-items:center;gap:.22in;margin:0 0 .1in .05in}
.p1 .h-pet>span:first-child{font:30pt/1 Caladea,Cambria,Georgia,serif;color:#1d7a2e}
.p1 .h-pet .paws{display:flex;gap:.22in}
.p1 .petbox{display:flex;gap:.18in;font-size:11.5pt;padding:0 .05in}
.p1 .petbox .col:first-child{flex:0 0 3.05in}
.p1 .kinds{position:relative}
.p1 .kinds .cb{font-size:10pt;margin-right:.1in}
.p1 .kinds .ln{min-width:.45in}
.p1 .kinds .fl{margin-bottom:.06in}
.p1 .kinds .two .cb:first-child{width:1.05in}
.p1 .pup{position:absolute;right:0;bottom:-.08in;width:.85in;height:.62in}
.p1 .h-reg{white-space:nowrap;font:15pt/1 Cinzel,"Times New Roman",serif;letter-spacing:.06em;color:#333}
.p1 .reg{display:flex;gap:.3in;padding:0 .05in}
.p1 .reg .sm{flex:1.5;font-size:8.4pt}
.p1 .reg .sm .fl{margin-bottom:.035in}
.p1 .reg .md{flex:1;font-size:11.5pt}
.p1 .reg .md .fl{margin-bottom:.07in}
.p1 .gap{height:.09in}
.p1 .pair{display:flex;justify-content:space-around;margin-top:.3in}
.p1 .pair img{height:.95in;width:.85in}
.p1 .h-med{white-space:nowrap;font:20pt/1 "Alfa Slab One",Georgia,serif;color:#5b7fa6;-webkit-text-stroke:.6px #2c4a6e;letter-spacing:.02em}
.p1 .medbox{padding:0 .25in;font-size:11.5pt}
.p1 .cond{position:relative;padding-right:.8in;font-size:10pt}
.p1 .cq{margin-bottom:.03in}
.p1 .cond .cpup{position:absolute;right:0;top:-.1in;width:.72in;height:.75in}
.p1 .medh{font:italic 700 12pt/1.2 Verdana,"DejaVu Sans",sans-serif;margin:.06in 0 .04in}
.p1 .meds{display:flex;gap:.25in}
.p1 .meds .fl{margin-bottom:.05in}
.p1 .foot{margin-top:auto;align-self:flex-end;display:flex;align-items:center;gap:.25in;font:700 12pt Arimo,Arial,sans-serif;padding-top:.04in}
/* page 2 */
.p2 .h-diet{display:flex;align-items:center;gap:.12in;height:1.2in;margin-bottom:.05in}
.p2 .h-diet span{font:22pt/1 Questrial,"Century Gothic",sans-serif;color:#222;margin:0 .06in}
.p2 .b2{width:.85in;height:.8in;align-self:flex-start}
.p2 .siam{width:.95in;height:1.25in;margin-left:auto}
.p2 .diet{padding:0 .1in 0 .2in;font-size:10pt;margin-right:.7in}
.p2 .diet>.fl{margin-bottom:.1in}
.p2 .diet .short .ln{flex:0 0 2.2in}
.p2 .treats{position:relative;margin-top:.12in}
.p2 .tq{margin-bottom:.1in}
.p2 .treats .fl{margin-bottom:.07in}
.p2 .treats .fl:nth-of-type(2) .ln{flex:0 0 2in}
.p2 .sleep{position:absolute;right:-.6in;top:.05in;width:.8in;height:.75in}
.p2 .h-add{white-space:nowrap;font:20pt/1 Questrial,"Century Gothic",sans-serif;color:#222}
.p2 .add{padding:0 .05in;font-size:11.5pt}
.p2 .add .q{margin:.06in 0 .02in}
.p2 .spread{justify-content:space-between;font-size:9.4pt}
.p2 .spread .cb{margin-right:0}
.p2 .add .fl{margin-bottom:.08in;position:relative}
.p2 .add .fl .cb{font-size:9.6pt}
.p2 .pug{position:absolute;right:.05in;bottom:-.08in;width:.75in;height:.7in}
.p2 hr{border:0;border-top:1px solid #999;margin:.08in 0 .06in}
.p2 .jump{font:700 12pt "Courier Prime","Courier New",monospace;width:3.05in;flex:none}
.p2 .bq{width:3.05in;flex:none}
.p2 .beh .paw{position:absolute;right:.15in;bottom:0}
.p2 .likes{display:flex;align-items:center;gap:.15in;margin:.04in 0 .06in}
.p2 .likes .col{flex:0 0 3.95in}
.p2 .likes img{height:.72in;width:.72in}
.p2 .beds{font:12pt/1.3 Arimo,Arial,sans-serif;margin-top:.16in}
.p2 .beds .fl{gap:.2in;margin-bottom:.03in}
.p2 .beds .cb{font-weight:700;font-size:12pt}
/* page 3: the waiver */
.p3{font:10.5pt/1.36 Carlito,Calibri,"Segoe UI",sans-serif}
.p3 .frame{padding-top:.18in}
.p3 .w-top{display:flex;gap:.6in;height:.72in;margin:0 0 .06in .05in}
.p3 .wt1{width:.75in;height:.8in}.p3 .wt2{width:.85in;height:.7in}
.p3 .fl{font-size:10.5pt}
.p3 p{margin:0 0 .075in}
.p3 .c{text-align:center}
.p3 .caps{margin-top:.08in}
.p3 .in{text-indent:.45in}
.p3 .vet{display:flex;align-items:center;gap:.4in;margin:.04in 0 .1in}
.p3 .vet p{margin:0}
.p3 .vp{width:.65in;height:.65in;margin-left:.5in}.p3 .vc{width:.85in;height:.7in}
.p3 .ack{display:flex;align-items:flex-end;gap:.1in}
.p3 .ackc{width:.8in;height:.62in;flex:none}
.p3 .sign{display:flex;gap:.35in;margin:.14in 0 .08in}
.p3 .s1{flex:2.4}.p3 .s2{flex:1}
.p3 .s1 .ln{height:.42in;position:relative;overflow:visible}
.p3 .sig{position:absolute;left:.1in;bottom:1px;height:.48in;max-width:2.6in;object-fit:contain}
.p3 .signame{position:absolute;right:4px;bottom:2px;font-size:8.5pt;color:#555}
.p3 .bd{margin-bottom:.12in}
.p3 .dates{display:grid;grid-template-columns:1fr 1fr;gap:.1in .45in;padding:0 .2in}
.p3 .dates .to{margin:0 .04in}
@media screen{.pg{box-shadow:0 2px 14px rgba(0,0,0,.18);margin:0 auto 18px}}
@media print{@page{size:letter;margin:0}.pg{break-after:page;page-break-after:always;margin:0;box-shadow:none}.pg:last-child{break-after:auto;page-break-after:auto}}
`;
const GUEST_FONTS = 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Arimo:wght@400;700&family=Caladea&family=Carlito&family=Cinzel:wght@500&family=Courier+Prime:wght@700&family=Questrial&display=swap';
window.guestPaper = guestPaper; window.guestPaperCSS = guestPaperCSS; window.GUEST_FONTS = GUEST_FONTS;
})();
