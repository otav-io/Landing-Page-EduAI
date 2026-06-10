(function () {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".navbar__toggle");
  const collapse = document.querySelector(".navbar__collapse");
  const yearEl = document.getElementById("footer-year");

  function setMenuOpen(isOpen) {
    if (!collapse || !toggle) return;
    collapse.classList.toggle("navbar__collapse--open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  toggle?.addEventListener("click", function () {
    if (!collapse) return;
    const willOpen = !collapse.classList.contains("navbar__collapse--open");
    setMenuOpen(willOpen);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  collapse?.querySelectorAll(".navbar__link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Desafio extra: sombra da header após scroll (com histerese para evitar tremores) */
  let ticking = false;
  let isScrolled = false;
  window.addEventListener("scroll", function () {
    if (!header || ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      const scrollY = window.scrollY;
      if (!isScrolled && scrollY > 80) {
        header.classList.add("header--scrolled");
        isScrolled = true;
      } else if (isScrolled && scrollY < 30) {
        header.classList.remove("header--scrolled");
        isScrolled = false;
      }
      ticking = false;
    });
  });

  /* Rolagem suave para links internos */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* Controlador do Modal e Toast */
  const modal = document.getElementById("dynamic-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  const toastContainer = document.getElementById("toast-container");
  let lastActiveElement = null;

  // Templates de Conteúdo dos Modais
  const modalTemplates = {
    contact: {
      title: "Fale Conosco",
      html: `
        <form class="modal-form" id="contact-form">
          <div class="modal-form__group">
            <label class="modal-form__label" for="contact-name">Nome Completo</label>
            <input class="modal-form__input" type="text" id="contact-name" placeholder="Seu nome" required />
          </div>
          <div class="modal-form__group">
            <label class="modal-form__label" for="contact-email">E-mail Corporativo / Acadêmico</label>
            <input class="modal-form__input" type="email" id="contact-email" placeholder="seuemail@exemplo.com" required />
          </div>
          <div class="modal-form__group">
            <label class="modal-form__label" for="contact-message">Sua Mensagem</label>
            <textarea class="modal-form__textarea" id="contact-message" placeholder="Como podemos ajudar o seu projeto acadêmico ou instituição?" required></textarea>
          </div>
          <button class="btn btn--primary" type="submit" style="width: 100%; margin-top: 0.5rem; min-height: 44px;">Enviar Mensagem</button>
        </form>
      `
    },
    privacy: {
      title: "Política de Privacidade",
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p><strong>Última atualização: Junho de 2026</strong></p>
          <p>Esta política descreve como o EduAI coleta, utiliza e protege suas informações pessoais durante o uso da nossa landing page e protótipos acadêmicos.</p>
          <p><strong>1. Coleta de Dados:</strong> Coletamos apenas os dados fornecidos voluntariamente por você através de nossos canais de simulação (como nome e e-mail no formulário de contato).</p>
          <p><strong>2. Uso das Informações:</strong> Como este é um projeto estritamente acadêmico (TCC), os dados inseridos não são salvos em servidores de produção e servem apenas para simulação de interfaces interativas locais.</p>
          <p><strong>3. Segurança:</strong> Adotamos as melhores práticas de design e criptografia padrão no front-end para garantir que sua navegação seja segura.</p>
        </div>
      `
    },
    terms: {
      title: "Termos de Uso",
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p><strong>Última atualização: Junho de 2026</strong></p>
          <p>Ao navegar pelo site do EduAI, você concorda em cumprir e respeitar as diretrizes de uso acadêmico estabelecidas para esta plataforma de TCC.</p>
          <p><strong>1. Escopo do Software:</strong> O EduAI é um software simulador educacional em desenvolvimento. Suas marcas, textos e protótipos são propriedade intelectual dos desenvolvedores do TCC.</p>
          <p><strong>2. Limitação de Responsabilidade:</strong> Sendo uma ferramenta demonstrativa, os criadores não assumem qualquer responsabilidade por tomadas de decisões pedagógicas reais com base nas telas demonstradas.</p>
          <p><strong>3. Modificações:</strong> Os desenvolvedores reservam-se o direito de atualizar este portal de forma a cumprir os requisitos de entrega da faculdade.</p>
        </div>
      `
    },
    support: {
      title: "Suporte Técnico",
      html: `
        <form class="modal-form" id="support-form">
          <p style="margin-bottom: 0.5rem;">Precisa de ajuda com o protótipo do EduAI? Envie sua dúvida técnica e nossa equipe acadêmica responderá em breve.</p>
          <div class="modal-form__group">
            <label class="modal-form__label" for="support-email">Seu E-mail</label>
            <input class="modal-form__input" type="email" id="support-email" placeholder="seuemail@exemplo.com" required />
          </div>
          <div class="modal-form__group">
            <label class="modal-form__label" for="support-issue">Descrição do Problema / Dúvida</label>
            <textarea class="modal-form__textarea" id="support-issue" placeholder="Descreva detalhadamente o comportamento inesperado..." required></textarea>
          </div>
          <button class="btn btn--primary" type="submit" style="width: 100%; margin-top: 0.5rem; min-height: 44px;">Enviar Solicitação</button>
        </form>
      `
    }
  };

  // Funções de Modal
  function openModal(type) {
    if (!modal || !modalTemplates[type]) return;
    
    lastActiveElement = document.activeElement;
    const template = modalTemplates[type];
    
    modalTitle.textContent = template.title;
    modalContent.innerHTML = template.html;
    
    modal.classList.add("modal--open");
    modal.setAttribute("aria-hidden", "false");
    
    // Foco no primeiro input
    setTimeout(() => {
      const firstInput = modalContent.querySelector("input, textarea, button");
      if (firstInput) {
        firstInput.focus();
      } else {
        const container = modal.querySelector(".modal__container");
        if (container) container.focus();
      }
    }, 50);

    // Configura listeners para submits nos forms gerados
    const contactForm = document.getElementById("contact-form");
    const supportForm = document.getElementById("support-form");

    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModal();
        showToast("Mensagem de contato enviada com sucesso!");
      });
    }

    if (supportForm) {
      supportForm.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModal();
        showToast("Solicitação de suporte enviada! Verifique seu e-mail.");
      });
    }
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("modal--open")) return;
    modal.classList.remove("modal--open");
    modal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  }

  // Função para exibir Toast
  function showToast(message) {
    if (!toastContainer) return;
    
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span class="material-symbols-outlined toast__icon">check_circle</span>
      <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("toast--show");
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove("toast--show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // Event Listener Delegado para ações do site
  document.addEventListener("click", function (e) {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    
    const action = target.getAttribute("data-action");
    
    if (action === "download") {
      e.preventDefault();
      showToast("Download do instalador EduAI iniciado!");
    } else if (modalTemplates[action]) {
      e.preventDefault();
      openModal(action);
    }
  });

  // Fechamento de modal ao clicar no botão com data-close (botão "X")
  document.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close") || e.target.closest("[data-close]")) {
      closeModal();
    }
  });

  // Event Listeners globais de teclado
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
      closeModal();
    }
  });

  /* Detecção de navegação por teclado para acessibilidade */
  document.body.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      document.body.classList.add("using-keyboard");
    }
  });

  document.body.addEventListener("mousedown", function () {
    document.body.classList.remove("using-keyboard");
  });
})();
