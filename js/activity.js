const modal = new bootstrap.Modal(document.getElementById('gameModal'));
        const canvas = document.getElementById('gameCanvas');
        const title = document.getElementById('gameTitle');
        let activeTimers = [];
        let animationFrames = [];
        let audioCtx;

        function stopAllEngines(){
            activeTimers.forEach(clearInterval);
            activeTimers.forEach(clearTimeout);
            animationFrames.forEach(cancelAnimationFrame);
            activeTimers = [];
            animationFrames = [];
            canvas.innerHTML = '';
            canvas.style.padding = '26px';
        }

        function openGame(type){
            stopAllEngines();
            modal.show();
            switch(type){
                case 'memory': initMemory(); break;
                case 'simon': initSimon(); break;
                case 'puzzle': initPuzzle(); break;
                case 'scramble': initScramble(); break;
                case 'rocks': initRocks(); break;
                case 'mandala': initMandala(); break;
                case 'clouds': initClouds(); break;
                case 'catch': initCatch(); break;
                case 'chimes': initChimes(); break;
                case 'bubble': initBubble(); break;
                case 'pond': initPond(); break;
                case 'blobs': initBlobs(); break;
                case 'sand': initSand(); break;
                case 'stars': initStars(); break;
                case 'rain': initRain(); break;
            }
        }

        function playTone(freq, type, duration){
            try{
                if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            }catch(e){}
        }

        function initBubble(){
            title.innerHTML = '<i class="fas fa-ellipsis-h"></i> Bubble Wrap Pop';
            let h = `<h3 class="text-secondary mb-4 text-center">Pop away the stress!</h3><div style="display:grid;grid-template-columns:repeat(6,60px);gap:12px;justify-content:center">`;
            for(let i=0;i<42;i++){
                h += `<div onclick="popBubble(this)" style="width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 30% 30%, #ffffff, #cfe6e0);box-shadow:2px 2px 8px rgba(0,0,0,0.06), inset -3px -3px 8px rgba(0,0,0,0.06);cursor:pointer"></div>`;
            }
            h += `</div><div class="text-center mt-4"><button class="btn btn-success" onclick="initBubble()">Refresh Sheet</button></div>`;
            canvas.innerHTML = h;
            window.popBubble = (el)=>{
                if(!el.classList.contains('popped')){
                    el.classList.add('popped');
                    el.style.transform='scale(.92)';
                    el.style.background='#eef7f5';
                    playTone(700+Math.random()*200,'sine',0.08);
                }
            };
        }

        function initPond(){
            title.innerHTML = '<i class="fas fa-water"></i> Serene Ripple Pond';
            canvas.style.padding = "0";
            canvas.innerHTML = `<div id="pondArea" style="position:relative;width:100%;height:520px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#aee1f0,#dff6fb)"><h3 style="position:relative;z-index:10;text-align:center;margin-top:18px;color:#083b36">Click the water to create ripples</h3></div>`;
            let pond = document.getElementById('pondArea');
            pond.addEventListener('click', (e)=>{
                let rect = pond.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                let ripple = document.createElement('div');
                ripple.style.position='absolute';
                ripple.style.left=x+'px';
                ripple.style.top=y+'px';
                ripple.style.width='0px';
                ripple.style.height='0px';
                ripple.style.border='3px solid rgba(255,255,255,0.7)';
                ripple.style.borderRadius='50%';
                ripple.style.transform='translate(-50%,-50%)';
                ripple.style.pointerEvents='none';
                pond.appendChild(ripple);
                ripple.animate([{width:'0px',height:'0px',opacity:1},{width:'300px',height:'300px',opacity:0}],{duration:1400,easing:'ease-out'}).onfinish=()=>ripple.remove();
                playTone(260+Math.random()*80,'triangle',0.45);
            });
        }

        function initBlobs(){
            title.innerHTML = '<i class="fas fa-shapes"></i> Lava Glow Blobs';
            canvas.style.padding = "0";
            let h = `<div style="position:relative;width:100%;height:520px;border-radius:12px;overflow:hidden;background:#fff;">`;
            for(let i=0;i<8;i++){
                let size = 90 + Math.random()*160;
                let top = Math.random()*80;
                let left = Math.random()*80;
                let delay = Math.random()*5;
                let duration = 8 + Math.random()*7;
                h += `<div style="position:absolute;border-radius:50%;background:linear-gradient(90deg, rgba(13,115,101,0.9), rgba(20,145,128,0.6)); width:${size}px;height:${size}px; top:${top}%; left:${left}%; filter: blur(18px); opacity:0.85; animation: floatBlob ${duration}s ${delay}s infinite alternate ease-in-out"></div>`;
            }
            h += `</div>`;
            canvas.innerHTML = h;
            let style = document.createElement('style');
            style.innerHTML = `@keyframes floatBlob {0%{transform:translate(0,0) scale(1)}100%{transform:translate(140px,-140px) scale(1.4)}}`;
            document.head.appendChild(style);
        }

        function initSand(){
            title.innerHTML = '<i class="fas fa-pen-nib"></i> Zen Sand Garden';
            canvas.innerHTML = `<canvas id="sandCanvas" width="1000" height="520" style="width:100%;height:520px;border-radius:12px;display:block;background:#efe0c9;cursor:crosshair;"></canvas><div class="text-center mt-3"><button class="btn btn-success" onclick="initSand()">Smooth Sand</button></div>`;
            let cvs = document.getElementById('sandCanvas');
            let ctx = cvs.getContext('2d');
            ctx.lineCap='round';
            ctx.lineJoin='round';
            ctx.strokeStyle='#b99b6a';
            ctx.lineWidth=14;
            let drawing=false;
            cvs.onpointerdown = (e)=>{ drawing=true; let r=cvs.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo((e.clientX-r.left)*(cvs.width/r.width),(e.clientY-r.top)*(cvs.height/r.height)); }
            cvs.onpointermove = (e)=>{ if(!drawing) return; let r=cvs.getBoundingClientRect(); ctx.lineTo((e.clientX-r.left)*(cvs.width/r.width),(e.clientY-r.top)*(cvs.height/r.height)); ctx.stroke(); }
            cvs.onpointerup = ()=>drawing=false;
            cvs.onpointerout = ()=>drawing=false;
        }

        function initStars(){
            title.innerHTML = '<i class="fas fa-star"></i> Connect the Stars';
            canvas.innerHTML = `<canvas id="starCanvas" width="1000" height="520" style="width:100%;height:520px;border-radius:12px;background:#071620;display:block"></canvas><p class="text-muted mt-2">Click on stars to connect them.</p>`;
            let cvs = document.getElementById('starCanvas');
            let ctx = cvs.getContext('2d');
            cvs.width = 1000;
            cvs.height = 520;
            let stars = [];
            let connections = [];
            let last = null;
            for(let i=0;i<25;i++) stars.push({x:50+Math.random()*900,y:50+Math.random()*420,r:3+Math.random()*4});
            function draw(){
                ctx.clearRect(0,0,cvs.width,cvs.height);
                ctx.strokeStyle='rgba(255,255,255,0.25)';
                ctx.lineWidth=1;
                connections.forEach(l=>{
                    ctx.beginPath();
                    ctx.moveTo(l.x1,l.y1);
                    ctx.lineTo(l.x2,l.y2);
                    ctx.stroke();
                });
                stars.forEach(s=>{
                    ctx.beginPath();
                    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
                    ctx.fillStyle = (s===last)?'#ffd54d':'#ffffff';
                    ctx.fill();
                });
            }
            draw();
            cvs.addEventListener('click',(e)=>{
                let rect=cvs.getBoundingClientRect();
                let x=e.clientX-rect.left;
                let y=e.clientY-rect.top;
                let clicked = stars.find(s=>Math.hypot(s.x-x,s.y-y)<12);
                if(clicked){
                    if(last && last!==clicked){
                        connections.push({x1:last.x,y1:last.y,x2:clicked.x,y2:clicked.y});
                        playTone(800,'sine',0.18);
                    }
                    last = clicked;
                    draw();
                }
            });
        }

        function initRain(){
            title.innerHTML = '<i class="fas fa-cloud-showers-heavy"></i> Piano Raindrops';
            canvas.style.padding = "0";
            canvas.innerHTML = `<div id="rainArea" style="position:relative;width:100%;height:520px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#2c3e50,#1f2b33)"><h3 style="position:relative;z-index:10;text-align:center;margin-top:18px;color:rgba(255,255,255,0.85)">Catch the drops to play a melody</h3></div>`;
            let area = document.getElementById('rainArea');
            let notes = [261.63,293.66,329.63,349.23,392.00,440.00,493.88,523.25];
            function spawnDrop(){
                let drop = document.createElement('div');
                drop.style.position='absolute';
                drop.style.width='14px';
                drop.style.height='24px';
                drop.style.left=(5+Math.random()*90)+'%';
                drop.style.top='-40px';
                drop.style.borderRadius='50%/60%';
                drop.style.background='rgba(255,255,255,0.85)';
                drop.style.zIndex=5;
                area.appendChild(drop);
                let speed = 1.5 + Math.random()*3;
                let pos = -40;
                let note = notes[Math.floor(Math.random()*notes.length)];
                drop.onmouseenter = drop.onclick = function(){
                    playTone(note,'sine',0.7);
                    drop.style.transform='scale(1.8)';
                    drop.style.opacity='0';
                    setTimeout(()=>drop.remove(),220);
                };
                function fall(){
                    if(!drop.parentElement) return;
                    pos += speed;
                    drop.style.top = pos + 'px';
                    if(pos > area.clientHeight + 40) drop.remove();
                    else{
                        let f = requestAnimationFrame(fall);
                        animationFrames.push(f);
                    }
                }
                fall();
            }
            let spawner = setInterval(spawnDrop,420);
            activeTimers.push(spawner);
        }

        function initMemory(){
            title.innerHTML = '<i class="fas fa-clone"></i> Cognitive Memory Match';
            const icons = ['??','??','??','??','???','?','??','??'];
            let deck = [...icons,...icons].sort(()=>0.5-Math.random());
            canvas.innerHTML = `<div id="mGrid" style="display:grid;grid-template-columns:repeat(4,90px);gap:12px;justify-content:center"></div><div class="text-center mt-4"><button class="btn btn-success" onclick="initMemory()">Restart</button></div>`;
            const grid = document.getElementById('mGrid');
            deck.forEach(icon=>{
                let card = document.createElement('div');
                card.className='memory-card';
                card.dataset.icon = icon;
                card.style.width='90px';
                card.style.height='90px';
                card.style.cursor='pointer';
                card.style.position='relative';
                card.style.transformStyle='preserve-3d';
                card.style.transition='transform .6s';
                card.innerHTML = `<div style="position:absolute;inset:0;border-radius:12px;background:linear-gradient(135deg,rgba(13,115,101,0.12),rgba(20,145,128,0.06));backface-visibility:hidden"></div><div style="position:absolute;inset:0;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2rem;transform:rotateY(180deg);backface-visibility:hidden;background:#fff;border:1px solid rgba(13,115,101,0.08)">${icon}</div>`;
                grid.appendChild(card);
            });
            let first=null, lock=false;
            document.querySelectorAll('.memory-card').forEach(card=>{
                card.addEventListener('click', function(){
                    if(lock || this===first) return;
                    this.style.transform='rotateY(180deg)';
                    if(!first){ first=this; return; }
                    let second=this;
                    lock=true;
                    if(first.dataset.icon === second.dataset.icon){
                        first=null;
                        lock=false;
                    }else{
                        setTimeout(()=>{
                            first.style.transform='rotateY(0deg)';
                            second.style.transform='rotateY(0deg)';
                            first=null;
                            lock=false;
                        },900);
                    }
                });
            });
        }

        function initSimon(){
            title.innerHTML = '<i class="fas fa-circle-notch"></i> Color Harmony Sequence';
            canvas.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:16px"><div style="display:grid;grid-template-columns:repeat(2,140px);gap:14px"><div id="s-green" style="width:140px;height:140px;border-radius:50%;background:#00c46b;opacity:.6;cursor:pointer" onclick="handleSimon('green')"></div><div id="s-red" style="width:140px;height:140px;border-radius:50%;background:#ff6b6b;opacity:.6;cursor:pointer" onclick="handleSimon('red')"></div><div id="s-yellow" style="width:140px;height:140px;border-radius:50%;background:#ffd56b;opacity:.6;cursor:pointer" onclick="handleSimon('yellow')"></div><div id="s-blue" style="width:140px;height:140px;border-radius:50%;background:#4fc3f7;opacity:.6;cursor:pointer" onclick="handleSimon('blue')"></div></div><button id="simStart" class="btn btn-success">Start</button><p id="simStatus" style="font-weight:700"></p></div>`;
            let seq=[], userSeq=[], colors=['green','red','yellow','blue'];
            document.getElementById('simStart').onclick = function(){ seq=[]; userSeq=[]; this.style.display='none'; nextSimonTurn(); };
            function nextSimonTurn(){
                userSeq=[];
                document.getElementById('simStatus').innerText="Memorizing...";
                seq.push(colors[Math.floor(Math.random()*4)]);
                let i=0;
                let intv = setInterval(()=>{
                    flash(seq[i]);
                    i++;
                    if(i>=seq.length){
                        clearInterval(intv);
                        document.getElementById('simStatus').innerText="Your turn!";
                    }
                },700);
                activeTimers.push(intv);
            }
            window.handleSimon = (color)=>{
                if(seq.length===0) return;
                flash(color);
                userSeq.push(color);
                let idx = userSeq.length-1;
                if(userSeq[idx] !== seq[idx]){
                    document.getElementById('simStatus').innerHTML="<span style='color:#d64545'>Try again!</span>";
                    document.getElementById('simStart').style.display='block';
                    seq=[];
                }else if(userSeq.length === seq.length){
                    document.getElementById('simStatus').innerHTML="<span style='color:#2e7d32'>Good! Next...</span>";
                    let t=setTimeout(nextSimonTurn,1100);
                    activeTimers.push(t);
                }
            };
            function flash(c){
                let el = document.getElementById('s-'+c);
                el.style.opacity='1';
                setTimeout(()=>el.style.opacity='.6',350);
                playTone(320,'sine',0.16);
            }
        }

        function initPuzzle(){
            title.innerHTML = '<i class="fas fa-border-all"></i> Zen Number Slide';
            let arr = [1,2,3,4,5,6,7,8,""].sort(()=>0.5-Math.random());
            function render(){
                let h = `<div style="display:grid;grid-template-columns:repeat(3,120px);gap:8px;justify-content:center">`;
                arr.forEach((n,i)=>{
                    h += `<div style="width:120px;height:120px;background:${n===""?"transparent":"#ffffff"};display:flex;align-items:center;justify-content:center;font-size:2.6rem;border-radius:10px;border:1px solid rgba(12,40,36,0.04);cursor:pointer" onclick="slide(${i})">${n}</div>`;
                });
                h += `</div>`;
                canvas.innerHTML = h;
            }
            window.slide = (i)=>{
                let e = arr.indexOf("");
                let valid=[e-1,e+1,e-3,e+3];
                if(e%3===0 && i===e-1) return;
                if(e%3===2 && i===e+1) return;
                if(valid.includes(i)){
                    arr[e]=arr[i];
                    arr[i]="";
                    render();
                }
            };
            render();
        }

        function initScramble(){
            title.innerHTML = '<i class="fas fa-spell-check"></i> Mindful Words';
            const dict = ["BREATHE","HARMONY","SERENITY"];
            let current = dict[Math.floor(Math.random()*dict.length)];
            let scrambled = current.split('').sort(()=>0.5-Math.random()).join('');
            canvas.innerHTML = `<div style="text-align:center"><div style="font-size:2.8rem;letter-spacing:8px;font-weight:700;color:var(--primary)">${scrambled}</div><input id="wInput" style="margin-top:18px;padding:12px;border-radius:40px;border:3px solid var(--primary);text-align:center;text-transform:uppercase;font-size:1.1rem"/><div style="margin-top:12px"><button class="btn btn-success" onclick="if(document.getElementById('wInput').value.toUpperCase()==='${current}') initScramble(); else alert('Try again')">Verify</button></div></div>`;
        }

        function initRocks(){
            title.innerHTML = '<i class="fas fa-layer-group"></i> Stone Balancer';
            canvas.innerHTML = `<div id="rockArea" style="width:100%;height:320px;border-radius:12px;background:linear-gradient(180deg,#fff8f0,#fffdfb);display:flex;flex-direction:column-reverse;align-items:center;padding:12px;overflow:hidden"></div><div class="text-center mt-3"><button class="btn btn-success me-3" onclick="dropStone()">Drop Stone</button><button class="btn btn-outline-secondary" onclick="initRocks()">Clear</button></div>`;
            let w=280, count=0, colors=['#5d4037','#795548','#8d6e63','#a1887f'];
            window.dropStone = ()=>{
                if(w < 60) return;
                let rock = document.createElement('div');
                rock.style.width = w+'px';
                rock.style.height='40px';
                rock.style.borderRadius='40px';
                rock.style.marginBottom='-10px';
                rock.style.background = colors[count%colors.length];
                rock.style.boxShadow='inset 0 -5px 0 rgba(0,0,0,0.18)';
                document.getElementById('rockArea').appendChild(rock);
                w -= 25;
                count++;
            };
            dropStone();
        }

        function initMandala(){
            title.innerHTML = '<i class="fas fa-paint-brush"></i> Mandala Canvas';
            let colors = ['#0d7365','#ff7043','#ffca28','#42a5f5','#ab47bc'];
            let h = `<div style="display:flex;gap:22px;align-items:center;justify-content:center"><div style="display:flex;flex-direction:column;gap:12px">`;
            colors.forEach((c)=>{
                h += `<div style="width:46px;height:46px;border-radius:50%;background:${c};border:3px solid white;cursor:pointer" onclick="window.activeColor='${c}'"></div>`;
            });
            h += `</div><svg width="420" height="420" viewBox="0 0 200 200" style="border-radius:12px;background:linear-gradient(180deg,#fff,#fbfffe)"><circle cx="100" cy="100" r="95" class="m-path" style="stroke:#cfe6e0;stroke-width:2;fill:#fff"></circle><circle cx="100" cy="100" r="60" class="m-path" style="stroke:#cfe6e0;stroke-width:2;fill:#fff"></circle><circle cx="100" cy="100" r="25" class="m-path" style="stroke:#cfe6e0;stroke-width:2;fill:#fff"></circle></svg></div>`;
            canvas.innerHTML = h;
            window.activeColor = colors[0];
            setTimeout(()=>{
                document.querySelectorAll('.m-path').forEach(p=>p.addEventListener('click', function(){ this.style.fill = window.activeColor; }));
            },50);
        }

        function initClouds(){
            title.innerHTML = '<i class="fas fa-cloud-sun"></i> Cloud Pop';
            canvas.innerHTML = `<div style="position:relative;width:100%;height:520px;border-radius:12px;background:linear-gradient(180deg,#e6f8f6,#ffffff);overflow:hidden"></div>`;
            let wrapper = canvas.querySelector('div');
            function spawn(){
                let el = document.createElement('div');
                el.innerHTML='??';
                el.style.fontSize='3.8rem';
                el.style.position='absolute';
                el.style.left=(Math.random()*80+5)+'%';
                el.style.top='100%';
                wrapper.appendChild(el);
                let pos = wrapper.clientHeight;
                let speed = Math.random()*2+1;
                function up(){
                    if(!el.parentElement) return;
                    pos -= speed;
                    el.style.top = pos + 'px';
                    if(pos < -120) el.remove();
                    else{
                        let f=requestAnimationFrame(up);
                        animationFrames.push(f);
                    }
                }
                up();
                el.onclick = function(){ playTone(420,'sine',0.12); this.remove(); };
            }
            activeTimers.push(setInterval(spawn,900));
        }

        function initCatch(){
            title.innerHTML = '<i class="fas fa-leaf"></i> Catch Leaves';
            canvas.style.padding = "0";
            canvas.innerHTML = `<div id="catchArea" style="position:relative;width:100%;height:520px;border-radius:12px;background:linear-gradient(180deg,#e8fbf7,#ffffff);overflow:hidden"><div id="basket" style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:120px;height:48px;border-radius:12px;background:linear-gradient(135deg,#a1887f,#5d4037)"></div></div>`;
            let area = document.getElementById('catchArea');
            let basket = document.getElementById('basket');
            area.addEventListener('mousemove',(e)=>{ let rect=area.getBoundingClientRect(); basket.style.left = (e.clientX-rect.left) + 'px'; });
            function drop(){
                let l=document.createElement('div');
                l.innerText='??';
                l.style.position='absolute';
                l.style.left=(Math.random()*(area.clientWidth-80))+'px';
                l.style.top='-80px';
                l.style.fontSize='2.4rem';
                area.appendChild(l);
                let pos=-80, speed=Math.random()*4+2;
                function fall(){
                    if(!l.parentElement) return;
                    pos += speed;
                    l.style.top = pos + 'px';
                    if(pos>area.clientHeight+80) l.remove();
                    else{
                        let f=requestAnimationFrame(fall);
                        animationFrames.push(f);
                    }
                }
                fall();
            }
            activeTimers.push(setInterval(drop,800));
        }

        function initChimes(){
            title.innerHTML = '<i class="fas fa-wind"></i> Rhythmic Chimes';
            let freqs = [261.63,293.66,329.63,392.00,440.00];
            let h = `<div style="display:flex;gap:18px;align-items:flex-end;height:300px;border-top:5px solid #e1e0dd;padding-top:18px;justify-content:center">`;
            [250,220,190,160,130].forEach((ht,i)=>{
                h += `<div class="chime-bar" style="width:60px;height:${ht}px;background:linear-gradient(to right,#bfeae5,#0d7365,#bfeae5);border-radius:0 0 18px 18px;cursor:pointer" onclick="strike(this,${freqs[i]})"></div>`;
            });
            h += `</div>`;
            canvas.innerHTML = h;
            window.strike = (el,f)=>{
                el.style.transform='rotate(0deg)';
                el.classList.remove('swing');
                void el.offsetWidth;
                el.classList.add('swing');
                playTone(f,'sine',1.8);
                setTimeout(()=>el.classList.remove('swing'),1100);
            };
        }

        (function heroGlow(){
            const hero = document.getElementById('heroArea');
            hero.addEventListener('mousemove', (e)=>{
                let bx = (e.clientX / window.innerWidth - .5) * 30;
                let by = (e.clientY / window.innerHeight - .5) * 30;
                document.querySelectorAll('.blob').forEach((b,i)=> b.style.transform = `translate3d(${bx*(i+0.3)}px, ${by*(i+0.6)}px, 0)`);
            });
        })();