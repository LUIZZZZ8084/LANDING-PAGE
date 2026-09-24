(function(){
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var whatsDigits = document.getElementById('whatsapp-number').textContent.replace(/\D/g, '');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var text = 'Olá, PALU! Meu nome é ' + document.getElementById('f-name').value.trim() + '.\n' +
      'Contato: ' + document.getElementById('f-contact').value.trim() + '\n\n' +
      document.getElementById('f-msg').value.trim();
    var url = 'https://wa.me/' + whatsDigits + '?text=' + encodeURIComponent(text);
    if(!window.open(url, '_blank', 'noopener')) window.location.href = url;
    success.classList.add('show');
  });
})();

(function(){
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

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

  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el){ el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el){ io.observe(el); });
  }

  if(!reducedMotion && canHover){
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
})();
