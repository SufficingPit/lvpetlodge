'use strict';
/* The New Guest form as paper, in the style of Ashley's original printout (same art, fonts and
   wording), laid out as:
   - a family page (welcome, registration, contacts, vet, who may pick up, items brought),
   - one page per pet (everything about that pet: details, medication, diet, personality),
   - the waiver (tick to agree, sign, printed name, date).
   Used three ways:
   - blank: new-guest-forms.pdf is printed from it (one pet page; copy it for more pets),
   - filled in, to print someone's answers (the website's "Print" and the kennel app's Print),
   - fillable on screen (opts.edit): the lines are inputs and the boxes can be ticked. Every
     field carries data-k, the path of its answer in the form data, so the page can keep the
     paper form and the simple form in step.
   guestPaper(data, base, opts) returns the pages as HTML. base: where img/form/ lives.
   guestPaperFit(root) lines up the first line of each multi-line answer after its label;
   call it while the pages are laid out (not display:none). Styles: guestPaperCSS (gp- classes). */
(function(){
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const PAW = '<path d="M12.1 11.2c-3.3 0-6.4 3.7-6.4 6.5 0 2.1 1.6 3.1 3.5 3.1 1.2 0 2-.7 2.9-.7s1.7.7 2.9.7c1.9 0 3.5-1 3.5-3.1 0-2.8-3.1-6.5-6.4-6.5z"/><ellipse cx="5.6" cy="9.3" rx="2.3" ry="2.9" transform="rotate(-18 5.6 9.3)"/><ellipse cx="9.7" cy="5.4" rx="2.3" ry="3" transform="rotate(-6 9.7 5.4)"/><ellipse cx="14.6" cy="5.4" rx="2.3" ry="3" transform="rotate(6 14.6 5.4)"/><ellipse cx="18.7" cy="9.3" rx="2.3" ry="2.9" transform="rotate(18 18.7 9.3)"/>';
// LINES: the ink-saving outline version (outline pictures, paws drawn as outlines)
let LINES = false;
const paw = (color, size, rot) => '<svg class="gp-paw" viewBox="0 0 24 24" style="width:'+size+';height:'+size+';'+(LINES ? 'fill:none;stroke:'+color+';stroke-width:1.2' : 'fill:'+color)+(rot ? ';transform:rotate('+rot+'deg)' : '')+'">'+PAW+'</svg>';
// a little trail of black paw prints walking along a line
function trail(n, back){
  let g = '';
  for(let i = 0; i < n; i++){ const x = 6 + i*15, y = i % 2 ? 4 : 13;
    g += '<g transform="translate('+x+' '+y+') rotate('+(i % 2 ? 100 : 80)+' 5 5) scale(.42)">'+PAW+'</g>'; }
  const w = n*15+8;   // back: the right-hand trail walks left, toward the title
  return '<svg class="gp-trail"'+(LINES ? ' style="fill:none;stroke:#222;stroke-width:2.6"' : '')+' viewBox="0 0 '+w+' 26" preserveAspectRatio="xMidYMid meet">'+(back ? '<g transform="translate('+w+' 0) scale(-1 1)">'+g+'</g>' : g)+'</svg>';
}
const band = (title, cls, n) => '<div class="gp-band">'+trail(n || 8)+'<span class="'+cls+'">'+title+'</span>'+trail(n || 8, true)+'</div>';
const fmtDate = v => { if(!v) return ''; const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(v); return m ? (+m[2])+'/'+(+m[3])+'/'+m[1] : v; };
const get = (o, path) => path.split('.').reduce((a, k) => a == null ? undefined : a[k], o);

function guestPaper(d, base, opts){
  base = base || ''; opts = opts || {};
  // art: 'outline' = our line tracing of the colour pictures, 'lineart' = drawn-as-line-art clip art
  const ART = opts.lineart ? 'lineart/' : opts.outline ? 'outline/' : '';
  LINES = !!ART;
  const E = !!opts.edit, D = d || {}, pets = (D.pets && D.pets.length) ? D.pets : [{}];
  const img = (n, cls) => '<img class="gp-art'+(cls ? ' gp-'+cls : '')+'" src="'+base+'img/form/'+ART+n+'.png" alt="">';
  // the answer on a line: an input when filling in on screen, text when printing
  const val = (k, f) => { const v = get(D, k); return f==='date' ? fmtDate(v) : v; };
  const ans = (k, f) => E && k
    ? '<input class="gp-ln gp-in" data-k="'+k+'"'+(f ? ' data-f="'+f+'"' : '')+' value="'+esc(val(k, f))+'"'+(f==='date' ? ' inputmode="numeric" placeholder="MM/DD/YYYY" maxlength="10"' : f==='tel' ? ' inputmode="tel"' : '')+' autocomplete="off">'
    : '<span class="gp-ln">'+esc(k ? val(k, f) : '')+'</span>';
  const ln = (label, k, f, cls) => '<div class="gp-fl'+(cls ? ' '+cls : '')+'">'+(label ? '<span class="gp-lb">'+label+'</span>' : '')+ans(k, f)+'</div>';
  // an answer that runs over ruled lines, starting right after its label
  const multi = (label, k, lines) => '<div class="gp-multi" style="--n:'+lines+'"><div class="gp-rules">'+'<i></i>'.repeat(lines)+'</div>'+(label ? '<span class="gp-ml">'+label+'</span>' : '')
    +(E ? '<textarea class="gp-ta" data-k="'+k+'" rows="'+lines+'">'+esc(get(D, k))+'</textarea>' : '<div class="gp-ta">'+esc(get(D, k))+'</div>')+'</div>';
  // a tick box: t is how ticking it changes the answer (one value, a list, spayed/neutered, yes/no)
  const box = (label, k, v, t, on) => (E ? '<button type="button" class="gp-cb" data-k="'+k+'" data-v="'+esc(v)+'" data-t="'+(t || 'one')+'" aria-pressed="'+(on ? 'true' : 'false')+'">' : '<span class="gp-cb">')
    +'<i class="'+(on ? 'gp-on' : '')+'"></i>'+label+(E ? '</button>' : '</span>');
  const one = (label, k, v) => box(label, k, v, 'one', get(D, k)===v);
  const yn = k => '<span class="gp-yn">'+one('Yes', k, 'yes')+one('No', k, 'no')+'</span>';
  const sub = t => '<div class="gp-sub">'+t+'</div>';

  // ---------- the family: once, however many pets
  function familyPage(){
    return '<section class="gp-pg gp-fam"><div class="gp-frame">'
      +'<div class="gp-hd">'+img('corgi', 'corgi')+'<div class="gp-ttl"><span class="gp-welcome">Welcome to</span><span class="gp-lodge">Little Village Pet Lodge</span></div>'+img('beagle', 'beagle')+'</div>'
      +'<p class="gp-intro">Thank you for giving us the opportunity to care for your pet. To ensure the best care possible, please take the time to fill in this form completely.</p>'
      +band('REGISTRATION', 'gp-h-reg', 9)
      +'<div class="gp-reg"><div class="gp-col gp-own">'
        +ln('First Name:', 'owner.first')+ln('Last Name:', 'owner.last')+ln('Email Address:', 'owner.email')
        +ln('Cell Phone:', 'owner.cell', 'tel')+ln('Main Phone:', 'owner.main', 'tel')+ln('Work Phone:', 'owner.work', 'tel')
      +'</div><div class="gp-col gp-addr">'
        +'<div class="gp-fl"><span class="gp-lb">Date:</span><span class="gp-ln">'+esc(fmtDate(D.date))+'</span></div>'
        +ln('City:', 'owner.city')+ln('State:', 'owner.state')+ln('ZIP:', 'owner.zip')
      +'</div></div>'
      +'<div class="gp-contacts">'
        +'<div class="gp-col">'+sub('Spouse / Co-Owner')+ln('Name:', 'owner.coName')+ln('Main Phone:', 'owner.coMain', 'tel')+ln('Alt. Phone:', 'owner.coAlt', 'tel')+'</div>'
        +'<div class="gp-col">'+sub('Emergency Contact')+ln('Name:', 'owner.emName')+ln('Main Phone:', 'owner.emMain', 'tel')+ln('Alt. Phone:', 'owner.emAlt', 'tel')+'</div>'
      +'</div>'
      +'<div class="gp-vetrow">'+sub('Veterinarian')+'<div class="gp-fl2">'+ln('Name:', 'owner.vet')+ln('Phone:', 'owner.vetPhone', 'tel', 'gp-vph')+'</div></div>'
      +band('Pick Up &amp; Belongings', 'gp-h-sm', 8)
      +ln('My pet may be picked up and released to:', 'owner.pickupBy')
      +multi('Items you brought along with you for this stay:', 'items', 2)
      +'<div class="gp-famart">'+img('whitedog')+img('redcat')+img('puppy', 'fpup')+'</div>'
      +'<div class="gp-foot">'+paw('#1f6fb5','.3in')+'<b>Pet pages next &#8594;</b></div>'
      +'</div></section>';
  }

  // ---------- one pet, all on one page
  function petPage(p, i){
    const P = 'pets.'+i+'.';
    const pers = [['Shy at First','Shy at first'],['Paw-fers Privacy','Paw-fers privacy'],['Playful Pup/Purrer','Playful'],['Cuddlebug','Cuddlebug'],['Love at First Lick','Love at first lick']];
    const along = ['Cats','Dogs','Humans','Everyone'];
    // up to four medications, one per ruled row (the simple form allows four too)
    const meds = '<div class="gp-mth">Medication</div><div class="gp-mth">Dosage</div><div class="gp-mth">How often</div><div class="gp-mth">Instructions</div>'
      + [0, 1, 2, 3].map(j => { const M = P+'meds.'+j+'.';
        return '<span class="gp-mn">'+(j+1)+'</span>'+ans(M+'name')+ans(M+'dose')+ans(M+'freq')+ans(M+'instr'); }).join('');
    return '<section class="gp-pg gp-pet"><div class="gp-frame">'
      +'<div class="gp-pethd">'+img('beagle2', 'beag2')+'<div class="gp-pt"><span>Pet Information</span><span class="gp-paws">'+paw('#1f9a3a','.34in',-8)+paw('#e0261f','.34in',6)+paw('#111','.34in',-4)+paw('#e0261f','.34in',8)+paw('#f39200','.34in',-6)+'</span></div>'+img('siamese', 'siam')+'</div>'
      +'<div class="gp-petbox"><div class="gp-col gp-petl">'
        +ln('Name of Pet:', P+'name')+ln('Breed:', P+'breed')+ln('Color:', P+'color')+ln('Date of Birth:', P+'dob', 'date')
      +'</div><div class="gp-col gp-kinds">'
        +'<div class="gp-fl">'+one('Dog', P+'species', 'dog')+one('Cat', P+'species', 'cat')+'</div>'
        +'<div class="gp-fl">'+one('Small Mammal (Specify)', P+'species', 'other')+ans(P+'other')+'</div>'
        +'<div class="gp-fl gp-two">'+one('Male', P+'sex', 'm')+box('Neutered', P+'fixed', 'm', 'fixed', p.sex==='m' && p.fixed==='yes')+'</div>'
        +'<div class="gp-fl gp-two">'+one('Female', P+'sex', 'f')+box('Spayed', P+'fixed', 'f', 'fixed', p.sex==='f' && p.fixed==='yes')+'</div>'
      +'</div></div>'
      +band('Medication', 'gp-h-med', 9)
      +'<div class="gp-medbox">'
        +'<div class="gp-cond">'+multi('Allergies or medical conditions you should know about:', P+'conditions', 2)+img(ART==='lineart/' ? 'bulldog' : 'corgipup', 'cpup')+'</div>'
        +'<div class="gp-medh">I need to get the following medication(s):</div>'
        +'<div class="gp-meds">'+meds+'</div>'
      +'</div>'
      +band('Diet Information', 'gp-h-diet', 8)
      +'<div class="gp-diet">'
        +multi('Describe your pet’s diet:', P+'diet', 2)
        +'<div class="gp-fl2">'+ln('Type of Food/Brand Given:', P+'food')+ln('Times Per Day:', P+'perDay', '', 'gp-per')+'</div>'
        +ln('Any special instructions:', P+'dietNotes')
        +'<div class="gp-fl gp-treat"><span class="gp-lb">Treats?</span>'+one('Yes, please, I especially love:', P+'treats', 'yes')+ans(P+'treatFav')+one('No, thank you, I’m on a diet.', P+'treats', 'no')+'</div>'
        +img('sleepcat', 'sleep')
      +'</div>'
      +band('Additional Information', 'gp-h-add', 8)
      +'<div class="gp-add">'
        +'<div class="gp-q">My paw-sonality can be summed up as:</div>'
        +'<div class="gp-fl gp-spread">'+pers.map(([l, v]) => box(l, P+'personality', v, 'pick', (p.personality || []).includes(v))).join('')+'</div>'
        +'<div class="gp-fl"><span class="gp-lb">I get along with:</span>'+along.map(l => box(l, P+'along', l, 'many', (p.along || []).includes(l))).join('')+'</div>'
        +ln('You should also know:', P+'alsoKnow')
        +ln('Other things you should know about me:', P+'notes')
        +'<div class="gp-fl2">'+ln('Likes:', P+'likes')+ln('Dislikes:', P+'dislikes')+'</div>'
        +'<div class="gp-behs">'
          +'<div class="gp-fl gp-beh"><span class="gp-bq">I can jump fences:</span>'+yn(P+'jumps')+'</div>'
          +'<div class="gp-fl gp-beh"><span class="gp-bq">I have been known to bite:</span>'+yn(P+'bites')+'</div>'
          +'<div class="gp-fl gp-beh"><span class="gp-bq">I have been known to start a fight:</span>'+yn(P+'fights')+'</div>'
          +'<div class="gp-fl gp-beh"><span class="gp-bq">I eat or chew up beds:</span>'+yn(P+'chews')+'</div>'
          +'<div class="gp-behart'+(ART==='lineart/' ? ' gp-behart1' : '')+'">'+(ART==='lineart/' ? '' : img('bulldog'))+img('cat2')+'</div>'
        +'</div>'
        +'<p class="gp-bednote">If a bed is provided by L.V. Pet Lodge and I chew it up, my parents will be charged $10 to help replace the bed.</p>'
      +'</div>'
      +'<div class="gp-foot gp-petfoot">'+(E || D.pets ? '' : '<span>More than one pet? Fill out a copy of this page for each one.</span>')+paw('#f39200','.3in', 12)+'</div>'
      +'</div></section>';
  }

  // ---------- the waiver, once
  function waiverPage(){
    const S = D.sign || {};
    const signed = S.img ? '<img class="gp-sig" src="'+esc(S.img)+'" alt="">' : '';
    return '<section class="gp-pg gp-waiver"><div class="gp-frame">'
      +'<div class="gp-wtop">'+img('wcat', 'wt1')+'<div class="gp-wt"><span>Consent for Medical Care and Legal Waiver</span></div>'+img('dogbone', 'wt2')+'</div>'
      +'<p class="gp-c gp-caps">NOTE PICK UP AND DROP OFF TIMES! EXTRA CHARGE OF $10.00 IF NECESSARY</p>'
      +'<p class="gp-in1">Little Village Pet Lodge cares about every pet! We will do everything possible to make their stay with us a happy, safe, and well cared for time. Pet owner specifically represents to kennel that pet has not been exposed to any contagious diseases within the last 30 days and that all vaccinations are up to date. It is understood that any animal found to be harboring any type of external parasite will be treated accordingly at the expense of the pet owner.</p>'
      +'<p class="gp-in1">Pet owner agrees to pay rate for boarding in effect on the date pet is checked into kennel plus any extra fees incurred. Pet owner further agrees to pay all costs and charges for our services before pet is released. ANY ANIMAL LEFT FOR 10 DAYS AFTER SCHEDULED PICK UP DATE, WITHOUT NOTIFICATION TO KENNEL, IS DEEMED ABANDONED AND WILL BE SUBJECT TO DISPOSAL AT LITTLE VILLAGE PET LODGE’S DISCRETION.</p>'
      +'<p class="gp-in1">Little Village Pet Lodge will exercise reasonable care for all pets. If the occasion should arise that pet becomes ill, or the state of animal’s health otherwise requires professional attention, Kennel will contact</p>'
      +'<div class="gp-vet"><p>BEEBOUT VETERINARY MEDICAL CENTER<br>1625 BURLINGTON ST<br>HOLDREGE, NE 68949<br>(308) 995-2419</p></div>'
      +'<p>All fees for emergency call to Beebout Veterinary will be paid by Pet Owner before pet’s release.</p>'
      +'<p class="gp-in1">Liability of kennel shall in no event exceed the lesser of the current value of a pet of same species, or the sum of $300 per pet while it is in the care of the kennel. Furthermore, Little Village Pet Lodge is NOT responsible if there is an unfortunate event or death of pet after all attempts are made to keep your pet safe and healthy. We are dedicated to ensuring you with Peace of Mind, Educated with Knowledge, and have our Hearts filled with love for all Furbabies!</p>'
      +'<p class="gp-in1">If your pet is scheduled for a pick up or drop off by our kennel vehicle, kennel/driver shall not be held responsible for vehicle accidents, injuries, natural disasters, or death. Pet owner further agrees to be solely responsible for any and all acts or behavior of said pet while it is in the care of the kennel.</p>'
      +'<div class="gp-ack">'+box('', 'agree', 'yes', 'bool', !!D.agree)+'<p>I hereby acknowledge that the above information is correct and that I have read the above contract and agree as owner or representative of the animal to the foregoing terms.</p>'+img('wblack', 'ackc')+'</div>'
      +'<div class="gp-sign">'
        +'<div class="gp-fl gp-s1"><span class="gp-lb">SIGN</span>'
          +(E ? '<button type="button" class="gp-ln gp-signbtn" data-sign="1">'+(signed || '<span class="gp-tap">Tap here to sign</span>')+'</button>' : '<span class="gp-ln">'+signed+'</span>')+'</div>'
        +'<div class="gp-fl gp-s2"><span class="gp-lb">DATE</span><span class="gp-ln">'+esc(fmtDate(S.date))+'</span></div></div>'
      +ln('PRINTED NAME', 'sign.name', '', 'gp-pname')
      +'</div></section>';
  }
  return familyPage() + pets.map((p, i) => '<div class="gp-petpages" data-pet="'+i+'">'+petPage(p, i)+'</div>').join('') + waiverPage();
}

// the first line of each multi-line answer starts after its label
function guestPaperFit(root){
  (root || document).querySelectorAll('.gp-multi').forEach(m => {
    const l = m.querySelector('.gp-ml'), t = m.querySelector('.gp-ta');
    if(l && t && l.offsetWidth) t.style.textIndent = (l.offsetWidth + 4)+'px';
  });
}

const guestPaperCSS = `
.gp-pg{width:8.5in;height:11in;background:#fff;color:#111;position:relative;overflow:hidden;font:10.5pt/1.25 Verdana,"DejaVu Sans","Noto Sans",sans-serif;text-align:left;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-scheme:light}
.gp-pg *{box-sizing:border-box}
.gp-pg p{margin:0}
.gp-frame{position:absolute;inset:.45in .55in .4in;border:1px solid #d6d6d6;border-radius:4px;padding:.22in .32in .16in;display:flex;flex-direction:column}
.gp-frame>*{flex:none}
.gp-art{display:block;object-fit:contain;border:0;background:none;padding:0;margin:0}
.gp-paw{display:inline-block;flex:none}
.gp-trail{width:1.75in;height:.28in;flex:none}
.gp-fl{display:flex;align-items:flex-end;gap:5px;margin:0 0 .07in;min-width:0;position:relative}
.gp-fl2{display:flex;gap:.25in}.gp-fl2>.gp-fl{flex:1}
.gp-lb{white-space:nowrap;flex:none}
.gp-ln{flex:1;min-width:.4in;border:0;border-bottom:1px solid #444;border-radius:0;background:none;min-height:1.2em;height:auto;line-height:1.15;padding:0 3px 1px;margin:0;color:#1d3c8c;font:inherit;font-family:Arimo,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;outline:0;box-shadow:none;width:auto;text-align:left}
input.gp-ln{min-height:0;font-size:inherit}
.gp-in:hover{background:rgba(60,110,255,.06)}
.gp-in:focus{background:rgba(60,110,255,.12)}
.gp-pg input:focus,.gp-pg textarea:focus{outline:0;border-color:#444;box-shadow:none}
.gp-cb{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;margin:0 .16in 0 0;flex:none;font:inherit;color:inherit;background:none;border:0;padding:0;min-height:0;border-radius:0;cursor:default;line-height:1.25}
button.gp-cb{cursor:pointer}
button.gp-cb:hover i{background:#e8f0ff}
.gp-cb i{display:inline-block;width:.13in;height:.13in;border:1px solid #333;border-radius:2px;position:relative;flex:none;background:#fff}
.gp-cb i.gp-on::after{content:"";position:absolute;left:.035in;top:-.02in;width:.04in;height:.09in;border:solid #1d3c8c;border-width:0 2px 2px 0;transform:rotate(40deg)}
.gp-col{flex:1;min-width:0}
.gp-band{display:flex;align-items:center;justify-content:space-between;gap:.1in;margin:.1in 0 .07in}
.gp-sub{font:700 9pt/1.2 Verdana,"DejaVu Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#1d7a2e;margin:0 0 .05in}
.gp-multi{position:relative;margin:0 0 .07in;--lh:1.36em}
.gp-rules{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;pointer-events:none}
.gp-rules i{display:block;height:var(--lh);border-bottom:1px solid #444}
.gp-ml{position:absolute;left:0;top:0;z-index:2;line-height:var(--lh);height:calc(var(--lh) + 1px);padding-right:3px;background:#fff;white-space:nowrap;pointer-events:none}
.gp-ta{display:block;width:100%;height:calc(var(--n) * var(--lh));line-height:var(--lh);padding:0 3px;margin:0;border:0;border-radius:0;resize:none;overflow:hidden;color:#1d3c8c;font:inherit;font-family:Arimo,Arial,sans-serif;outline:0;box-shadow:none;min-height:0;position:relative;z-index:1;background:transparent;white-space:pre-wrap;word-wrap:break-word}
textarea.gp-ta:hover{background-color:rgba(60,110,255,.06)}
textarea.gp-ta:focus{background-color:rgba(60,110,255,.1)}
.gp-foot{margin-top:auto;align-self:flex-end;display:flex;align-items:center;gap:.2in;font:700 12pt Arimo,Arial,sans-serif;padding-top:.04in}
.gp-foot span{font:italic 400 9.5pt Verdana,"DejaVu Sans",sans-serif;color:#555}
/* family page */
.gp-hd{display:flex;align-items:center;gap:.15in;height:1.05in;margin-bottom:.06in}
.gp-corgi{width:1.15in;height:.95in}
.gp-beagle{width:1.05in;height:1in}
.gp-ttl{flex:1;display:flex;flex-direction:column;align-items:center;gap:.03in}
.gp-welcome{font:22pt/1 "Alfa Slab One",Rockwell,serif;color:#f39200;letter-spacing:.03em}
.gp-lodge{font:31pt/1.05 Caladea,Cambria,Georgia,serif;color:#1f4db5;white-space:nowrap}
.gp-intro{font-size:9pt;margin:0 .1in .04in!important;line-height:1.35}
.gp-h-reg{white-space:nowrap;font:16pt/1 Cinzel,"Times New Roman",serif;letter-spacing:.06em;color:#333}
.gp-h-sm{white-space:nowrap;font:16pt/1 Questrial,"Century Gothic",sans-serif;color:#222}
.gp-reg{display:flex;gap:.35in;padding:0 .05in;font-size:11pt}
.gp-own{flex:1.45}.gp-addr{flex:1}
.gp-reg .gp-fl{margin-bottom:.13in}
.gp-fam .gp-band{margin:.16in 0 .12in}
.gp-contacts{display:flex;gap:.35in;padding:.1in .05in 0;font-size:10.5pt}
.gp-contacts .gp-fl,.gp-vetrow .gp-fl{margin-bottom:.1in}
.gp-vetrow{padding:.1in .05in 0;font-size:10.5pt}
.gp-vph{flex:0 0 2.4in!important}
.gp-fam .gp-multi,.gp-fam .gp-frame>.gp-fl{font-size:10.5pt;margin-left:.05in;margin-right:.05in}
.gp-fam .gp-frame>.gp-fl{margin-bottom:.12in}
.gp-famart{display:flex;justify-content:center;align-items:flex-end;gap:.6in;margin-top:.3in}
.gp-famart img{height:1.2in;width:1.1in}
.gp-famart .gp-fpup{width:1.35in;height:1in}
/* pet page */
.gp-pethd{display:flex;align-items:center;gap:.1in;height:.95in;margin-bottom:.04in}
.gp-beag2{width:.85in;height:.8in}
.gp-pt{flex:1;display:flex;flex-direction:column;align-items:center;gap:.04in}
.gp-pt>span:first-child{font:30pt/1 Caladea,Cambria,Georgia,serif;color:#1d7a2e}
.gp-paws{display:flex;gap:.2in}
.gp-siam{width:.8in;height:1in}
.gp-petbox{display:flex;gap:.25in;font-size:11pt;padding:0 .05in}
.gp-petl{flex:0 0 3.05in}
.gp-kinds{font-size:10pt}
.gp-kinds .gp-fl{margin-bottom:.075in}
.gp-kinds .gp-two .gp-cb:first-child{width:1.05in}
.gp-kinds .gp-ln{min-width:.6in}
.gp-h-med{white-space:nowrap;font:19pt/1 "Alfa Slab One",Georgia,serif;color:#5b7fa6;-webkit-text-stroke:.6px #2c4a6e;letter-spacing:.02em}
.gp-h-diet,.gp-h-add{white-space:nowrap;font:19pt/1 Questrial,"Century Gothic",sans-serif;color:#222}
.gp-medbox{padding:0 .05in;font-size:10.5pt}
.gp-cond{position:relative;padding-right:.85in;font-size:10pt}
.gp-cond .gp-multi{margin-bottom:.03in}
.gp-cpup{position:absolute;right:0;top:-.12in;width:.72in;height:.72in}
.gp-medh{font:italic 700 11pt/1.2 Verdana,"DejaVu Sans",sans-serif;margin:.03in 0 .05in}
.gp-meds{display:grid;grid-template-columns:.16in 1.9fr 1fr 1.15fr 2.3fr;column-gap:.1in;row-gap:.055in;align-items:end;font-size:10pt}
.gp-mth{grid-column:auto;font:700 8.5pt/1 Verdana,"DejaVu Sans",sans-serif;color:#2c4a6e;padding-left:3px}
.gp-mth:first-child{grid-column:2}
.gp-mn{font:700 9pt/1 Verdana,"DejaVu Sans",sans-serif;color:#2c4a6e;text-align:right;padding-bottom:2px}
.gp-meds .gp-ln{min-width:0;width:100%;min-height:1.25em}
.gp-diet{position:relative;padding:0 .95in 0 .05in;font-size:10pt}
.gp-per{flex:0 0 1.75in!important}
.gp-treat .gp-ln{flex:0 0 1.3in;margin-right:.16in}
.gp-treat .gp-cb{margin-right:.06in}
.gp-treat .gp-lb{margin-right:.06in}
.gp-sleep{position:absolute;right:0;top:.05in;width:.82in;height:.78in}
.gp-add{position:relative;padding:0 .05in;font-size:10.5pt}
.gp-add .gp-q{margin:0 0 .04in}
.gp-spread{justify-content:space-between;font-size:9.4pt}
.gp-spread .gp-cb{margin-right:0}
.gp-add .gp-fl .gp-cb{font-size:9.6pt}
.gp-add .gp-fl .gp-lb + .gp-cb{margin-left:.08in}
.gp-behs{position:relative;margin-top:.04in;padding-right:1.7in}
.gp-beh{align-items:center;margin-bottom:.045in}
.gp-yn .gp-cb{width:.6in;margin-right:.08in}
.gp-bq{width:3.1in;flex:none}
.gp-behart{position:absolute;right:0;top:.02in;display:flex;gap:.08in}
.gp-behart img{height:.75in;width:.75in}
.gp-behart1{width:1.58in;justify-content:center}.gp-behart1 img{width:1.1in}
.gp-bednote{font:700 9pt/1.3 Arimo,Arial,sans-serif;margin-top:.04in!important}
.gp-petfoot{justify-content:flex-end;gap:.15in}
/* the waiver */
.gp-waiver{font:10.5pt/1.36 Carlito,Calibri,"Segoe UI",sans-serif}
.gp-wtop{display:flex;align-items:center;gap:.2in;height:.85in;margin:0 0 .04in}
.gp-wt1{width:.8in;height:.9in}.gp-wt2{width:.85in;height:.72in}
.gp-wt{flex:1;text-align:center}
.gp-wt span{font:17pt/1.15 Caladea,Cambria,Georgia,serif;color:#1f4db5}
.gp-waiver p{margin:0 0 .075in}
.gp-c{text-align:center}
.gp-in1{text-indent:.45in}
.gp-vet{display:flex;align-items:center;gap:.4in;margin:.02in 0 .08in}
.gp-vet p{margin:0!important}

.gp-ack{display:flex;align-items:flex-start;gap:.08in;margin-top:.04in}
.gp-ack .gp-cb{margin:.03in 0 0}
.gp-ack .gp-cb i{width:.16in;height:.16in}
.gp-ack p{flex:1;margin:0!important;font-weight:700}
.gp-ackc{width:1in;height:.72in;flex:none}
.gp-sign{display:flex;gap:.35in;margin:.18in 0 .06in}
.gp-s1{flex:2.4}.gp-s2{flex:1}
.gp-s1 .gp-ln{height:.45in;position:relative;overflow:visible}
button.gp-signbtn{cursor:pointer;display:block}
.gp-tap{position:absolute;left:.1in;bottom:4px;color:#1d3c8c;font-family:Arimo,Arial,sans-serif;font-size:10.5pt;font-weight:700}
.gp-sig{position:absolute;left:.1in;bottom:1px;height:.5in;max-width:3in;object-fit:contain}
.gp-pname{margin:.06in 0 .12in}
.gp-pname .gp-ln{flex:0 0 3.9in}
.gp-bd{margin:.02in 0 .1in!important}
.gp-dates{display:grid;grid-template-columns:1fr 1fr;gap:.1in .45in;padding:0 .2in}
.gp-to{margin:0 .04in}
@media screen{.gp-pg{box-shadow:0 2px 14px rgba(0,0,0,.18);margin:0 auto 18px}}
@media print{@page{size:letter;margin:0}.gp-pg{break-after:page;page-break-after:always;margin:0!important;box-shadow:none}.gp-waiver{break-after:auto;page-break-after:auto}
  .gp-in:hover,.gp-in:focus,textarea.gp-ta:hover,textarea.gp-ta:focus{background-color:transparent}}
`;
const GUEST_FONTS = 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Arimo:wght@400;700&family=Caladea&family=Carlito&family=Cinzel:wght@500&family=Courier+Prime:wght@700&family=Questrial&display=swap';
window.guestPaper = guestPaper; window.guestPaperFit = guestPaperFit; window.guestPaperCSS = guestPaperCSS; window.GUEST_FONTS = GUEST_FONTS;
})();
