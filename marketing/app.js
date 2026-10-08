
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  // Enhance only when supported; all content remains available without JS.
  if(!reduced && 'IntersectionObserver' in window){
    const targets=[...document.querySelectorAll('.personal-page-card, .work, .notebook, .writing-card, .lab-project, .thread-grid article')];
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
      });
    },{threshold:.04});
    targets.forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)targets.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)el.classList.add('in-view');});
    });
  }

  // Copy, strategy and evidence tabs share the same keyboard behavior.
  document.querySelectorAll('[role="tablist"]').forEach(list=>{
    const tabs=[...list.querySelectorAll('[role="tab"]')];
    const select=(tab,focus)=>{
      tabs.forEach(t=>{
        const selected=t===tab;
        t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;
        const panel=document.getElementById(t.getAttribute('aria-controls'));
        if(panel)panel.hidden=!selected;
      });
      if(focus)tab.focus();
    };
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>select(tab,false));
      tab.addEventListener('keydown',e=>{
        let next;
        if(e.key==='ArrowRight')next=(i+1)%tabs.length;
        if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
        if(e.key==='Home')next=0;
        if(e.key==='End')next=tabs.length-1;
        if(next!==undefined){e.preventDefault();select(tabs[next],true);}
      });
    });
  });

  document.addEventListener('click',e=>{
    const a=e.target.closest('a');
    if(!a || reduced || e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download') || a.hasAttribute('data-lightbox'))return;
    const url=new URL(a.href,location.href);
    if(url.protocol!==location.protocol || url.host!==location.host || !url.pathname.endsWith('.html') || url.pathname===location.pathname)return;
    e.preventDefault();document.body.classList.add('is-leaving');
    setTimeout(()=>{location.href=url.href;},240);
  });
  addEventListener('pageshow',()=>document.body.classList.remove('is-leaving'));

  const sections=document.querySelectorAll('.case-section');
  if(sections.length && 'IntersectionObserver' in window){
    const indexObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting)document.querySelectorAll('.case-index a').forEach(a=>{
          const active=a.getAttribute('href')==='#'+entry.target.id;
          a.classList.toggle('active',active);
          if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
        });
      });
    },{rootMargin:'-8% 0px -62% 0px',threshold:0});
    sections.forEach(el=>indexObserver.observe(el));
  }

  const noteButton=document.getElementById('note-button');
  if(noteButton){
    const notes=['简历只有一页，这里可以多翻几页。','写文案时，连“立即使用”放在哪儿，都值得想一想。','看达人，评论区值得多逛两圈。','AI 实验室里有两个工具，别客气，点进去试试。'];
    let index=0;
    noteButton.addEventListener('click',()=>{
      index=(index+1)%notes.length;
      document.getElementById('note-message').textContent=notes[index];
      document.getElementById('note-counter').textContent=String(index+1).padStart(2,'0')+' / 04';
      if(!reduced){const card=noteButton.closest('.little-note');card.classList.remove('is-flipping');requestAnimationFrame(()=>requestAnimationFrame(()=>card.classList.add('is-flipping')));}
    });
  }

  const stage=document.querySelector('.personal-stage');
  if(stage && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches){
    let frame;
    stage.addEventListener('pointermove',e=>{
      const r=stage.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)/r.width*9;
      const y=(e.clientY-r.top-r.height/2)/r.height*7;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{stage.style.setProperty('--art-x',x.toFixed(2)+'px');stage.style.setProperty('--art-y',y.toFixed(2)+'px');});
    });
    stage.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);stage.style.setProperty('--art-x','0px');stage.style.setProperty('--art-y','0px');});
  }

  const viewer=document.getElementById('image-viewer');
  if(viewer && typeof viewer.showModal==='function'){
    const image=document.getElementById('viewer-image');
    const title=document.getElementById('viewer-title');
    const zoom=document.getElementById('viewer-zoom');
    const scroller=document.getElementById('viewer-scroll');
    let trigger;
    document.querySelectorAll('[data-lightbox]').forEach(a=>a.addEventListener('click',e=>{
      if(e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)return;
      e.preventDefault();trigger=a;
      title.textContent=a.dataset.imageLabel||'作品原图';
      image.alt=title.textContent;image.src=a.href;image.hidden=false;
      viewer.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='放大细读';
      viewer.showModal();document.body.classList.add('viewer-open');scroller.scrollTo(0,0);
    }));
    document.getElementById('viewer-close').addEventListener('click',()=>viewer.close());
    zoom.addEventListener('click',()=>{
      const enlarged=viewer.classList.toggle('is-zoomed');
      zoom.setAttribute('aria-pressed',String(enlarged));zoom.textContent=enlarged?'恢复宽度':'放大细读';
    });
    viewer.addEventListener('click',e=>{
      if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close();}
    });
    viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');trigger?.focus();});
  }
})();

(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu=document.querySelector('.menu-toggle');
  if(menu){
    document.body.classList.add('nav-ready');
    const close=focus=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');if(focus)menu.focus();};
    menu.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && document.body.classList.contains('menu-open'))close(true);});
    document.addEventListener('click',e=>{if(document.body.classList.contains('menu-open') && !e.target.closest('header'))close(false);});
    document.querySelectorAll('#site-menu a').forEach(a=>a.addEventListener('click',()=>close(false)));
    const mobile=matchMedia('(max-width: 720px)');
    mobile.addEventListener('change',()=>close(false));
  }

  const switcher=document.getElementById('portrait-switch');
  if(switcher){
    let photo=false;
    switcher.addEventListener('click',()=>{
      photo=!photo;
      document.getElementById('portrait-drawing').hidden=photo;
      document.getElementById('portrait-photo').hidden=!photo;
      switcher.setAttribute('aria-pressed',String(photo));
      switcher.textContent=photo?'翻回手绘那面':'翻到照片那面';
      document.getElementById('portrait-caption').textContent=photo?'本人，证件照版本。':'本人，手绘版本。';
    });
  }

  const progress=document.querySelector('.reading-progress');
  const article=document.querySelector('.case-body');
  let scheduled=false;
  const update=()=>{
    scheduled=false;
    document.body.classList.toggle('is-scrolled',scrollY>620);
    if(progress && article){
      const start=article.getBoundingClientRect().top+scrollY-innerHeight*.15;
      const distance=Math.max(1,article.offsetHeight-innerHeight*.7);
      const fraction=Math.max(0,Math.min(1,(scrollY-start)/distance));
      progress.style.setProperty('--reading',fraction.toFixed(4));
      progress.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
    }
  };
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('load',schedule);
  if('ResizeObserver' in window && article)new ResizeObserver(schedule).observe(article);
  update();
})();
