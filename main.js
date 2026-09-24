(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  // iOS Safari only applies :active styles when a touch listener exists
  document.addEventListener('touchstart', function(){}, { passive:true });

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if(!('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* tilt */
  if(!reduced && canHover){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform .12s ease';
        card.style.transform = 'perspective(900px) rotateY(' + (x*5).toFixed(2) + 'deg) rotateX(' + (-y*5).toFixed(2) + 'deg) translateY(-3px)';
        card.style.borderColor = 'rgba(0,230,118,0.35)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transition = 'transform .35s ease';
        card.style.transform = '';
        card.style.borderColor = '';
      });
    });
  }

  /* mobile menu */
  var header = document.querySelector('header.nav');
  var menuBtn = header.querySelector('.menu-btn');
  function setMenu(open){
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  menuBtn.addEventListener('click', function(){ setMenu(!header.classList.contains('open')); });
  header.querySelectorAll('nav.links a').forEach(function(a){
    a.addEventListener('click', function(){ setMenu(false); });
  });

  /* stacked cards on touch: tap to bring forward, auto-cycle while visible */
  var stackCards = Array.prototype.slice.call(document.querySelectorAll('.stack-card'));
  if(!canHover && stackCards.length){
    var order = [stackCards[2], stackCards[1], stackCards[0]];
    var idx = -1, timer = null, userTook = false;
    function activate(card){
      stackCards.forEach(function(c){ c.classList.toggle('active', c === card); });
    }
    function step(){
      idx = (idx + 1) % order.length;
      activate(order[idx]);
    }
    function start(){ if(!timer && !userTook){ step(); timer = setInterval(step, 2800); } }
    function stop(){ clearInterval(timer); timer = null; }
    stackCards.forEach(function(card){
      card.addEventListener('click', function(){
        userTook = true; stop();
        activate(card.classList.contains('active') ? null : card);
      });
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting) start(); else stop(); });
      }, { threshold:0.3 }).observe(document.querySelector('.stack'));
    }
  }

  /* reading progress + end-of-page highlight */
  var topFill = document.querySelector('.progress-top-fill');
  var sideFill = document.querySelector('.progress-side-fill');
  var sideLabel = document.querySelector('.progress-side-label');
  var pctEl = document.querySelector('.progress-pct');
  var endPill = document.querySelector('.end-pill');
  var submitBtn = document.getElementById('submit-btn');
  var atEnd = false;

  function onScroll(){
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var r = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var pct = Math.round(r * 100);
    topFill.style.transform = 'scaleX(' + r + ')';
    sideFill.style.transform = 'scaleY(' + r + ')';
    sideLabel.style.top = (r * 100) + '%';
    pctEl.textContent = pct + '%';
    var now = pct >= 99;
    if(now !== atEnd){
      atEnd = now;
      document.body.classList.toggle('reached-end', atEnd);
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  onScroll();

  endPill.addEventListener('click', function(){
    var y = submitBtn.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
    window.scrollTo({ top:y, behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(function(){ submitBtn.focus(); }, 500);
  });

  /* contact form -> FormSubmit */
  var form = document.getElementById('contact-form');
  var btnLabel = submitBtn.querySelector('.btn-label');
  var status = document.getElementById('form-status');
  var statusText = status.querySelector('.form-status-text');
  var sending = false;

  function showStatus(msg){
    statusText.textContent = msg;
    status.hidden = false;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(sending) return;
    var fd = new FormData(form);
    if(fd.get('_honey')) return;
    var data = {
      name: String(fd.get('name') || '').trim(),
      contact: String(fd.get('contact') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      _subject: 'Novo contato pelo site — PALU',
      _template: 'table',
      _captcha: 'false'
    };
    sending = true;
    submitBtn.disabled = true;
    btnLabel.textContent = 'Enviando...';
    status.hidden = true;

    fetch('https://formsubmit.co/ajax/palusolucoes@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(data)
    })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(String(j.success) !== 'true') throw new Error('fail');
        showStatus('Mensagem enviada! Retornamos em até 48h.');
        form.reset();
      })
      .catch(function(){
        showStatus('Não foi possível enviar agora — abrimos seu e-mail para concluir.');
        var body = 'Nome: ' + data.name + '\nContato: ' + data.contact + '\n\n' + data.message;
        window.location.href = 'mailto:palusolucoes@gmail.com?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body);
      })
      .finally(function(){
        sending = false;
        submitBtn.disabled = false;
        btnLabel.textContent = 'Enviar mensagem';
      });
  });
})();
