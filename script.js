
// Função para calcular CRC16-CCITT (padrão PIX)
function calculateCRC16(payload) {
    let crc = 0xFFFF; // Valor inicial (padrão CCITT-FALSE)
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
            crc &= 0xFFFF; // Manter em 16 bits
        }
    }

    // Retornar como string hex de 4 dígitos (maiúscula)
    return crc.toString(16).toUpperCase().padStart(4, '0');
}




document.addEventListener('DOMContentLoaded', () => {
    
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
                const response = await fetch('/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    formStatus.textContent = 'Obrigado por confirmar!';
                    formStatus.style.color = '#4CAF50';
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
// PARTE 3: LÓGICA DA GALERIA DE PRESENTES E MODAL DO PIX
// =======================================================
const giftButtons = document.querySelectorAll('.btn-presentear');
const pixModal = document.getElementById('pix-modal');

if (pixModal && giftButtons.length > 0) {
    const closeModalBtn = pixModal.querySelector('.close-modal');
    const copyPixBtn = document.getElementById('copy-pix-button');
    const pixCodeInput = document.getElementById('pix-code');
    const pixGiftValue = document.getElementById('pix-gift-value');
    const qrcodeContainer = document.getElementById('qrcode');

    // Função para calcular CRC16-CCITT (padrão PIX)
    function calculateCRC16(payload) {
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < payload.length; i++) {
            crc ^= (payload.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc = crc << 1;
                }
                crc &= 0xFFFF;
            }
        }

        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    // Função para gerar o código PIX dinâmico
    const generatePixCode = (key, amount, name, description) => {
        const payload = [
            "000201",
            "26" + ("58" + "BR.GOV.BCB.PIX01" + ("" + key.length).padStart(2, "0") + key).length,
            "0014BR.GOV.BCB.PIX",
            "01" + key.length + key,
            "52040000",
            "5303986",
            "54" + amount.toFixed(2).replace(".", "").length + amount.toFixed(2).replace(".", ""),
            "5802BR",
            "59" + name.length + name,
            "6009SAO PAULO",
            "61" + "05" + description.length + description,
            "6304"
        ].join("");

        const crc = calculateCRC16(payload);
        return payload + crc;
    };

    // Abrir o modal com o valor e QR Code corretos
    giftButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const giftItem = e.target.closest('.gift-item');
            const value = parseFloat(giftItem.dataset.value);
            const giftName = giftItem.querySelector('h4').textContent;

            pixGiftValue.textContent = `R$ ${value.toFixed(2).replace('.', ',')}`;

            const pixKey = "43055388810";
            const beneficiaryName = "Joyce e Felipe";
            const description = `Presente: ${giftName}`;
            const pixCode = generatePixCode(pixKey, value, beneficiaryName, description);

            pixCodeInput.value = pixCode;

            qrcodeContainer.innerHTML = '';
            new QRCode(qrcodeContainer, {
                text: pixCode,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            pixModal.classList.add('active');
        });
    });

    // Função para fechar o modal
    const closeModal = () => {
        pixModal.classList.remove('active');
        qrcodeContainer.innerHTML = '';
    };

    closeModalBtn.addEventListener('click', closeModal);
    pixModal.addEventListener('click', (e) => {
        if (e.target === pixModal) {
            closeModal();
        }
    });

    copyPixBtn.addEventListener('click', () => {
        pixCodeInput.select();
        pixCodeInput.setSelectionRange(0, 99999);

        try {
            navigator.clipboard.writeText(pixCodeInput.value);
            copyPixBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copyPixBtn.textContent = 'Copiar Código';
            }, 2000);
        } catch (err) {
            document.execCommand('copy');
            copyPixBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copyPixBtn.textContent = 'Copiar Código';
            }, 2000);
        }
    });
}
});
