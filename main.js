/* global gsap */

// ✅ Your Messenger thread link
const MESSENGER_THREAD_URL = "https://www.facebook.com/messages/e2ee/t/9965602883471455";

// ✅ Places with map links (UPDATED)
const PLACES = [
  {
    id: "place1",
    name: "Ulaanbaatar coffee culture",
    meta: "Кофе + яриа = perfect ☕️",
    tag: "UBCC",
    locationUrl: "https://maps.app.goo.gl/KeazRP87mdvNgg8a8",
  },
  {
    id: "place2",
    name: "Matcha café & dining",
    meta: "Cute vibe 💗 matcha time",
    tag: "Matcha",
    locationUrl: "https://maps.app.goo.gl/tNCEuELuS1kCvbUa6",
  },
  {
    id: "place3",
    name: "Lahaul",
    meta: "Тайван, гоё сууцгаая ✨",
    tag: "Lahaul",
    locationUrl: "https://maps.app.goo.gl/7Lvd4RtRD9cYzZ9NA",
  },
];

const screens = {
  start: document.getElementById("screenStart"),
  chat: document.getElementById("screenChat"),
  game: document.getElementById("screenGame"),
  final: document.getElementById("screenFinal"),
};

const heartsLayer = document.getElementById("heartsLayer");

// START
const btnStart = document.getElementById("btnStart");

// CHAT
const chatBody = document.getElementById("chatBody");
const chatActions = document.getElementById("chatActions");

// GAME
const arena = document.getElementById("arena");
const timeLeftEl = document.getElementById("timeLeft");
const scoreEl = document.getElementById("score");
const btnRestart = document.getElementById("btnRestart");

// FINAL
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");
const btnSendMsg = document.getElementById("btnSendMsg");
const datePick = document.getElementById("datePick");
const timePick = document.getElementById("timePick");
const result = document.getElementById("result");
const placeGrid = document.getElementById("placeGrid");

const STATE = {
  score: 0,
  target: 7,
  seconds: 12,
  timer: null,
  playing: false,
  selectedPlaceId: null,
};

// ---------- helpers ----------
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("screen--active"));
  const el = screens[name];
  el.classList.add("screen--active");

  gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
}

function nowTimeLabel() {
  const d = new Date();
  return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
}

function addMsg(text, who = "me") {
  const div = document.createElement("div");
  div.className = `msg ${who === "me" ? "msg--me" : ""}`;
  div.innerHTML = `${text}<small>${nowTimeLabel()}</small>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;

  gsap.fromTo(div, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
}

function setActions(buttons) {
  chatActions.innerHTML = "";
  buttons.forEach(({ label, onClick, variant }) => {
    const b = document.createElement("button");
    b.className = `btn ${variant || "btn--ghost"}`;
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    chatActions.appendChild(b);
  });
  gsap.fromTo(chatActions.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.06 });
}

function popConfetti(x, y, count = 18) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "10px";
    p.style.height = "10px";
    p.style.borderRadius = "6px";
    p.style.background = `rgba(255, 79, 184, ${0.35 + Math.random() * 0.5})`;
    p.style.border = "1px solid rgba(255,255,255,0.22)";
    p.style.zIndex = 9999;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 180;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    gsap.to(p, {
      x: dx,
      y: dy + 160,
      rotation: (Math.random() * 720 - 360),
      opacity: 0,
      duration: 1.1 + Math.random() * 0.5,
      ease: "power3.out",
      onComplete: () => p.remove(),
    });
  }
}

// ---------- floating background hearts ----------
function spawnFloatingHeart() {
  const h = document.createElement("div");
  h.className = "float-heart";
  h.textContent = Math.random() > 0.5 ? "💗" : "🤍";
  h.style.left = `${Math.random() * 100}%`;
  h.style.transform = `scale(${0.8 + Math.random() * 1.2})`;
  heartsLayer.appendChild(h);

  gsap.to(h, {
    y: -(window.innerHeight + 100),
    x: (Math.random() * 120 - 60),
    opacity: 0,
    duration: 5 + Math.random() * 4,
    ease: "none",
    onComplete: () => h.remove(),
  });
}
setInterval(spawnFloatingHeart, 420);

// ---------- Places UI (with map link shown next to tag) ----------
function renderPlaces() {
  if (!placeGrid) return;
  placeGrid.innerHTML = "";

  PLACES.forEach((p) => {
    const card = document.createElement("div");
    card.className = "placeCard";
    card.dataset.placeId = p.id;

    // Tag + Location link (shown after tag)
    card.innerHTML = `
        <div class="left">
            <div class="placeName">${p.name}</div>
            <div class="placeMeta">${p.meta}</div>
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
            <div class="placeTag">${p.tag}</div>

            <a href="${p.locationUrl}" target="_blank" rel="noopener noreferrer"
            aria-label="Open map"
            title="Map"
            style="
                width:34px; height:34px;
                display:grid; place-items:center;
                border-radius:12px;
                background: rgba(255,255,255,0.08);
                border:1px solid rgba(255,255,255,0.12);
                text-decoration:none;
                font-weight:1000;
                line-height:1;
                cursor:pointer;
                transition: transform .12s ease, background .12s ease, border-color .12s ease;
            "
            onmouseenter="this.style.transform='translateY(-1px)'; this.style.background='rgba(255,79,184,0.14)'; this.style.borderColor='rgba(255,79,184,0.28)'"
            onmouseleave="this.style.transform='none'; this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.12)'"
            >📍</a>
        </div>
    `;


    card.addEventListener("click", (e) => {
      // If clicked the link, let it open; don't change selection
      if (e.target && e.target.tagName === "A") return;

      STATE.selectedPlaceId = p.id;
      placeGrid.querySelectorAll(".placeCard").forEach(el => el.classList.remove("placeCard--active"));
      card.classList.add("placeCard--active");
      gsap.fromTo(card, { scale: 0.98 }, { scale: 1, duration: 0.18, ease: "back.out(2)" });
    });

    placeGrid.appendChild(card);
  });
}

function getSelectedPlace() {
  return PLACES.find(p => p.id === STATE.selectedPlaceId) || null;
}

// ---------- CHAT flow ----------
function startChatFlow() {
  chatBody.innerHTML = "";

  addMsg("Сайн уу Тунгалагтамир аа 🥺💖", "me");
  setTimeout(() => addMsg("Хөөе 👀 юу вэ?", "you"), 550);
  setTimeout(() => addMsg("Чамаас нэг cute асуулт асуух уу?", "me"), 1100);

  setTimeout(() => {
    setActions([
      {
        label: "Асуучих 😄",
        variant: "btn--primary",
        onClick: () => {
          addMsg("Асуучих 😄", "you");
          setActions([]);

          setTimeout(() => {
            addMsg("Энэ жил чамайг онцлох 3 үг: <b class='pink'>Аз жаргал 🤍 </b>, <b class='pink'>Мөнгөтэй 🖤</b>, <b class='pink'>Амжилттай 💗</b> ✨", "me");
          }, 420);

          setTimeout(() => addMsg("Яг үнэн шүү 😂", "you"), 1050);

          setTimeout(() => {
            addMsg("Тэгвэл… хамтдаа жижигхэн тоглоом тоглоод урилгаа unlock хийчих үү? 💗", "me");
          }, 1550);

          setTimeout(() => {
            setActions([
              {
                label: "Тоглоё 💘",
                variant: "btn--primary",
                onClick: () => {
                  addMsg("Тоглоё 💘", "you");
                  setActions([]);
                  setTimeout(() => {
                    showScreen("game");
                    startGame();
                  }, 400);
                },
              },
              {
                label: "Ямар тоглоом бэ? 😳",
                variant: "btn--ghost",
                onClick: () => {
                  addMsg("Ямар тоглоом бэ? 😳", "you");
                  setActions([]);

                  setTimeout(() => {
                    addMsg("Зүгээр л зүрхнүүд дээр дарах 😄 12 секундэд 7-г авбал болоо!", "me");
                  }, 350);

                  setTimeout(() => {
                    setActions([
                      {
                        label: "Ок тоглоё 💘",
                        variant: "btn--primary",
                        onClick: () => {
                          addMsg("Ок тоглоё 💘", "you");
                          setActions([]);
                          setTimeout(() => {
                            showScreen("game");
                            startGame();
                          }, 400);
                        },
                      },
                    ]);
                  }, 1100);
                },
              },
            ]);
          }, 2100);
        },
      },
      {
        label: "Хмм… юу юм бол? 🤨",
        variant: "btn--ghost",
        onClick: () => {
          addMsg("Хмм… юу юм бол? 🤨", "you");
          setActions([]);
          setTimeout(() => addMsg("Айх хэрэггүй ээ 😄 Хэтэрхий cute л юм байгаа 💕", "me"), 450);
          setTimeout(() => {
            setActions([
              {
                label: "За асуу 😄",
                variant: "btn--primary",
                onClick: () => {
                  setActions([]);
                  setTimeout(() => {
                    addMsg("За асуу 😄", "you");
                    setTimeout(() => {
                      addMsg("Эхлээд тоглоом тоглоод unlock хийе 💗", "me");
                      setTimeout(() => {
                        showScreen("game");
                        startGame();
                      }, 650);
                    }, 350);
                  }, 50);
                },
              },
            ]);
          }, 1000);
        },
      },
    ]);
  }, 1700);
}

// ---------- GAME ----------
function clearArena() {
  arena.querySelectorAll(".heart").forEach(el => el.remove());
}

function spawnClickableHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "💗" : "💖";

  const pad = 12;
  const xMax = arena.clientWidth - 44 - pad;
  const yMax = arena.clientHeight - 44 - pad;

  const x = pad + Math.random() * Math.max(1, xMax - pad);
  const y = pad + Math.random() * Math.max(1, yMax - pad);

  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;

  gsap.fromTo(heart, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(2)" });

  heart.addEventListener("click", (e) => {
    if (!STATE.playing) return;
    STATE.score += 1;
    scoreEl.textContent = String(STATE.score);

    popConfetti(e.clientX, e.clientY, 10);

    gsap.to(heart, {
      scale: 0,
      opacity: 0,
      duration: 0.12,
      ease: "power2.in",
      onComplete: () => heart.remove(),
    });

    if (STATE.score >= STATE.target) endGame(true);
  });

  arena.appendChild(heart);

  gsap.to(heart, {
    opacity: 0,
    duration: 1.3,
    delay: 0.7,
    ease: "power1.out",
    onComplete: () => heart.remove(),
  });
}

function startGame() {
  clearArena();
  STATE.score = 0;
  STATE.playing = true;
  STATE.seconds = 12;

  scoreEl.textContent = "0";
  timeLeftEl.textContent = String(STATE.seconds);

  if (STATE.timer) clearInterval(STATE.timer);

  const spawn = () => {
    if (!STATE.playing) return;
    spawnClickableHeart();
    if (Math.random() > 0.55) spawnClickableHeart();
  };

  spawn();
  const spawnInterval = setInterval(() => {
    if (!STATE.playing) return clearInterval(spawnInterval);
    spawn();
  }, 420);

  STATE.timer = setInterval(() => {
    if (!STATE.playing) return;
    STATE.seconds -= 1;
    timeLeftEl.textContent = String(STATE.seconds);
    if (STATE.seconds <= 0) endGame(false);
  }, 1000);
}

function endGame(win) {
  STATE.playing = false;
  if (STATE.timer) clearInterval(STATE.timer);

  arena.querySelectorAll(".heart").forEach(el => {
    gsap.to(el, { opacity: 0, scale: 0.8, duration: 0.2, onComplete: () => el.remove() });
  });

  const center = arena.getBoundingClientRect();
  popConfetti(center.left + center.width / 2, center.top + 40, win ? 28 : 14);

  setTimeout(() => {
    if (win) {
      showScreen("final");
      animateFinalIntro();
    } else {
      gsap.fromTo(arena, { x: -6 }, { x: 6, duration: 0.08, yoyo: true, repeat: 5, clearProps: "x" });
    }
  }, 550);
}

btnRestart.addEventListener("click", () => startGame());

// ---------- FINAL / Messenger sending ----------
function animateFinalIntro() {
  result.style.display = "none";
  result.textContent = "";
  btnSendMsg.disabled = false;

  renderPlaces();

  gsap.fromTo(".final .ribbon", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2)" });
  gsap.fromTo(".final .h2", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, delay: 0.06 });
  gsap.fromTo(".final .dateBox", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, delay: 0.14 });
  gsap.fromTo(".final .ctaRow", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, delay: 0.20 });
}

function formatPickedDate() {
  const date = datePick.value;
  if (!date) return null;
  return new Date(date + "T00:00:00").toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildInviteMessage() {
  const nice = formatPickedDate() || "Чиний сонгосон өдөр";
  const time = timePick.value || "—";
  const place = getSelectedPlace();

  const placeText = place
    ? `${place.name}\n📍 ${place.locationUrl}`
    : `Чиний сонгосон газар`;

  return `Тийм ээ 💖
Болзоо: ${nice}, ${time}
Газар: ${placeText}
Кофе ууж, тайван ярилцъя ☕️✨`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }
}

btnYes.addEventListener("click", (e) => {
  const nice = formatPickedDate();
  const time = timePick.value || "—";
  const place = getSelectedPlace();

  const placeText = place
    ? `${place.name} (<a href="${place.locationUrl}" target="_blank" rel="noopener noreferrer">map</a>)`
    : "Чиний сонгосон газар";

  result.style.display = "block";
  result.innerHTML = `
    <b class="pink">Тийм ээ 💖</b><br/>
    Тэгвэл: <b>${nice ? nice : "Чиний сонгох өдөр"}</b> өдөр, <b>${time}</b> цагт<br/>
    Газар: <b>${placeText}</b><br/>
    <span style="opacity:.9">кофе ууж, тайван ярилцъя ☕️✨</span><br/>
    <span style="opacity:.75; font-size:13px">PS: Энэ “тийм” нь миний өдөрийг аз жаргалтай болголоо 🥺</span>
    <br/><br/>
    <b>📩 Дараагийн алхам:</b> <span style="opacity:.9">“Messenger дээр явуулах” товч дар → paste → Send</span>
  `;

  popConfetti(e.clientX, e.clientY, 30);
  gsap.fromTo(result, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28 });
});

let noDodges = 0;
btnNo.addEventListener("mouseenter", () => {
  noDodges += 1;
  const card = document.querySelector(".final");
  const rect = card.getBoundingClientRect();

  const maxX = rect.width - btnNo.offsetWidth - 28;
  const maxY = rect.height - btnNo.offsetHeight - 28;

  const x = 14 + Math.random() * Math.max(1, maxX);
  const y = 14 + Math.random() * Math.max(1, maxY);

  btnNo.style.position = "absolute";
  btnNo.style.left = `${x}px`;
  btnNo.style.top = `${y}px`;

  gsap.fromTo(btnNo, { scale: 0.96 }, { scale: 1, duration: 0.18, ease: "back.out(2)" });

  if (noDodges === 3) {
    result.style.display = "block";
    result.innerHTML = `😄 <b class="pink">Зүгээр ээ</b>, хүсэхгүй бол би хүндэтгэнэ.<br/>
      Гэхдээ “тийм” гэж хэлэхэд чинь би их баярлана 🥺💗`;
    gsap.fromTo(result, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28 });
  }
});

btnSendMsg.addEventListener("click", async () => {
  const msg = buildInviteMessage();
  const ok = await copyToClipboard(msg);

  result.style.display = "block";
  result.innerHTML = `
    <b class="pink">Бэлэн боллоо ✨</b><br/>
    ${ok ? "Мессежийг clipboard-д хууллаа ✅" : "Автоматаар хуулах боломжгүй байна ⚠️ Доорх текстийг гараар хуулна уу:"}
    <div style="margin-top:10px; white-space:pre-line; opacity:.95; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); padding:10px 12px; border-radius:14px;">
      ${msg.replaceAll("<","&lt;").replaceAll(">","&gt;")}
    </div>
    <div style="margin-top:10px; opacity:.85; font-size:13px;">
      Одоо Messenger нээгдэнэ → <b>paste</b> → <b>Send</b> 💗
    </div>
  `;

  window.open(MESSENGER_THREAD_URL, "_blank", "noopener,noreferrer");
});

// ---------- Start ----------
btnStart.addEventListener("click", () => {
  showScreen("chat");
  startChatFlow();
});

// initial hero animation
gsap.fromTo("#screenStart .hero", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });
