(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if(reduced || !('IntersectionObserver' in window)){
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
