const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

document.getElementById("year").textContent = new Date().getFullYear();

const menu = $(".menu-toggle"), nav = $(".nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", open);
  menu.innerHTML = open ? "CLOSE <b>×</b>" : "MENU <b>+</b>";
});
$$(".nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menu.setAttribute("aria-expanded","false"); menu.innerHTML="MENU <b>+</b>";
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$(".skill", entry.target).forEach(skill => {
      $(".meter i", skill).style.width = skill.dataset.level + "%";
    });
  });
}, {threshold:.25});
const skills = $(".skills-section");
if (skills) observer.observe(skills);

$$(".filter").forEach(btn => btn.addEventListener("click", () => {
  $$(".filter").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  const filter = btn.dataset.filter;
  $$(".project-card").forEach(card => {
    card.classList.toggle("hide", filter !== "all" && card.dataset.category !== filter);
  });
}));

const modal = $("#projectModal");
const modalTitle = $("#modalTitle"), modalDesc = $("#modalDesc"), modalStack = $("#modalStack");
const galleryTrack = $("#galleryTrack"), galleryCounter = $("#galleryCounter"), galleryViewport = $("#galleryViewport");
const galleryPrev = $(".gallery-prev"), galleryNext = $(".gallery-next");

// Gambar proyek dibaca langsung dari HTML melalui data-images.
// Contoh sekarang memakai image/foto_profil.jpg.
// Nanti cukup ganti nilai data-images pada masing-masing .project-card.
function getProjectImages(card) {
  return (card.dataset.images || "image/foto_profil.jpg")
    .split(",")
    .map(src => src.trim())
    .filter(Boolean);
}

let galleryIndex = 0;
let activeImages = [];

function renderGallery() {
  if (!activeImages.length) {
    galleryTrack.innerHTML = `<div class="gallery-slide"><p>Tidak ada gambar proyek.</p></div>`;
    galleryCounter.textContent = "00 / 00";
    galleryPrev.disabled = true;
    galleryNext.disabled = true;
    return;
  }

  galleryTrack.innerHTML = activeImages.map((src, index) => `
    <div class="gallery-slide">
      <img src="${src}" alt="${modalTitle.textContent} - gambar ${index + 1}" loading="lazy"
           onerror="this.style.display='none'; this.parentElement.classList.add('image-error');">
    </div>
  `).join("");

  galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
  updateGalleryControls();
}

function updateGalleryControls() {
  if (!activeImages.length) return;
  galleryCounter.textContent = `${String(galleryIndex + 1).padStart(2, "0")} / ${String(activeImages.length).padStart(2, "0")}`;
  galleryPrev.disabled = galleryIndex === 0;
  galleryNext.disabled = galleryIndex === activeImages.length - 1;
}

function moveGallery(direction) {
  if (!activeImages.length) return;
  galleryIndex = Math.max(0, Math.min(activeImages.length - 1, galleryIndex + direction));
  galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;
  updateGalleryControls();
}

$$('.project-card').forEach(card => {
  const open = () => {
    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent = card.dataset.desc;
    modalStack.textContent = card.dataset.stack;
    activeImages = getProjectImages(card);
    galleryIndex = 0;
    renderGallery();
    modal.showModal();
  };
  card.addEventListener('click', open);
});

galleryPrev.addEventListener('click', () => moveGallery(-1));
galleryNext.addEventListener('click', () => moveGallery(1));

// Swipe gambar di HP / touchpad.
let touchStartX = 0;
galleryViewport.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
galleryViewport.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 45) moveGallery(delta < 0 ? 1 : -1);
}, {passive:true});

$(".modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if(e.target === modal) modal.close(); });

const form = document.getElementById("contactForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const button = form.querySelector("button");
  const originalText = button.textContent;

  button.textContent = "MENGIRIM...";

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      showSuccessAnimation();

      form.reset();
      button.textContent = originalText;
    } else {
      throw new Error("Gagal mengirim");
    }

  } catch (error) {
    button.textContent = "GAGAL MENGIRIM";

    setTimeout(() => {
      button.textContent = originalText;
    }, 3000);
  }
});

const cursor = $(".cursor-dot");
window.addEventListener("pointermove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add("revealed"); reveal.unobserve(e.target); }
  });
},{threshold:.12});
$$(".project-card, .timeline article, .facts div").forEach(el => {
  el.style.opacity="0"; el.style.transform="translateY(20px)";
  el.style.transition="opacity .6s ease, transform .6s ease";
  reveal.observe(el);
});
document.addEventListener("scroll", () => {
  $$(".revealed").forEach(el => { el.style.opacity="1"; el.style.transform="translateY(0)"; });
},{passive:true});

function showSuccessAnimation() {
  const message = document.getElementById("successMessage");
  message.classList.add("show");
}

function closeSuccess() {
  const message = document.getElementById("successMessage");
  message.classList.remove("show");
}