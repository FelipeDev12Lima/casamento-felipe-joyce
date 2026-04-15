document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    // NAVBAR: scroll + menu mobile + active link
    // ===================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinksContainer.classList.toggle('open');
    });

    navLinksContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            navToggle.classList.remove('open');
            navLinksContainer.classList.remove('open');
        }
    });

    // Destaca o link ativo conforme a seção visível
    const sections = document.querySelectorAll('section[id]');
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => activeObserver.observe(s));

    // ===================================
    // PARALLAX NO HERO (apenas desktop/mouse)
    // ===================================
    const heroContent = document.querySelector('.hero .content');
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (heroContent && !isTouch) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroH = window.innerHeight;
            if (scrollY < heroH) {
                heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
                heroContent.style.opacity = 1 - (scrollY / heroH) * 1.6;
            }
        }, { passive: true });
    }

    // ===================================
    // FADE-IN AO ROLAR (Intersection Observer)
    // ===================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    
    // ===================================
    // PARTE 1: CONTAGEM REGRESSIVA
    // ===================================
    const countdownElement = document.getElementById("countdown");
    if (countdownElement) {
        const weddingDate = new Date("May 29, 2026 19:00:00").getTime();

        const countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = "<h3>O grande dia chegou!</h3>";
                return;
            }

            document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000);
        }, 1000);
    }

    // ===================================
    // PARTE 2: FORMULÁRIO DE RSVP
    // ===================================
    const rsvpForm = document.getElementById('rsvp-form');

if (rsvpForm) {
    const formStatus = document.getElementById('form-status');

    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formStatus.textContent = 'Enviando...';
        formStatus.style.color = 'white';

        const formData = new FormData(rsvpForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("https://formspree.io/f/meopqydb", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                formStatus.textContent = 'Obrigado por confirmar!';
                formStatus.style.color = '#121212';
                rsvpForm.reset();
            } else {
                throw new Error('Falha no envio.');
            }
        } catch (error) {
            formStatus.textContent = 'Erro ao enviar. Tente novamente.';
            formStatus.style.color = '#F44336';
        }
    });
}


    // =======================================================
    // PARTE 3: NOVA LÓGICA DE PRESENTES + PIX SIMPLES
    // =======================================================
    const giftButtons = document.querySelectorAll('.btn-presentear');
    const freeDonationBtn = document.getElementById('free-donation-btn');
    const pixModal = document.getElementById('pix-modal');

    if (pixModal && (giftButtons.length > 0 || freeDonationBtn)) {
        const closeModalBtn = pixModal.querySelector('.close-modal');
        const copyKeyBtn = document.getElementById('copy-key-button');
        const suggestedValueEl = document.getElementById('suggested-value');
        const referenceInput = document.getElementById('reference-input');
        const useGiftRefBtn = document.getElementById('use-gift-reference');
        const refPreview = document.getElementById('ref-preview');

        let currentGiftName = '';
        let currentValue = 0;

        // Função para abrir modal
        const openModal = (value = 0, giftName = '') => {
            currentValue = value;
            currentGiftName = giftName;

            suggestedValueEl.textContent = value > 0 ? `R$ ${value.toFixed(2).replace('.', ',')}` : 'Qualquer valor';
            referenceInput.value = giftName ? (giftName.length > 25 ? giftName.substring(0, 22) + '...' : giftName) : '';
            refPreview.textContent = referenceInput.value || '(vazio)';
            pixModal.classList.add('active');
        };

        // Botões de presentes
        giftButtons.forEach(button => {
            button.addEventListener('click', () => {
                const giftItem = button.closest('.gift-item');
                const value = parseFloat(giftItem.dataset.value);
                const giftName = giftItem.querySelector('h4').textContent;
                openModal(value, giftName);
            });
        });

        // Botão de doação livre
        if (freeDonationBtn) {
            freeDonationBtn.addEventListener('click', () => {
                openModal(0, '');
            });
        }

        // Atualizar preview da referência
        referenceInput.addEventListener('input', () => {
            refPreview.textContent = referenceInput.value || '(vazio)';
        });

        // Usar nome do presente
        useGiftRefBtn.addEventListener('click', () => {
            referenceInput.value = currentGiftName.length > 25 ? currentGiftName.substring(0, 22) + '...' : currentGiftName;
            refPreview.textContent = referenceInput.value;
        });

        // Copiar chave
        copyKeyBtn.addEventListener('click', () => {
            const keyInput = document.getElementById('static-pix-key');
            keyInput.select();
            navigator.clipboard.writeText(keyInput.value).then(() => {
                copyKeyBtn.textContent = 'Copiado!';
                setTimeout(() => copyKeyBtn.textContent = 'Copiar Chave', 2000);
            }).catch(() => {
                copyKeyBtn.textContent = 'Erro';
            });
        });

        // Fechar modal
        const closeModal = () => {
            pixModal.classList.remove('active');
        };
        closeModalBtn.addEventListener('click', closeModal);
        pixModal.addEventListener('click', (e) => {
            if (e.target === pixModal) closeModal();
        });
    }
});