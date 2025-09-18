/**
 * Grid de Imagens - JavaScript
 * Arquivo: assets/grid-images.js
 */

class GridImageSection {
  constructor() {
    this.sections = document.querySelectorAll('.grid-image-section');
    this.init();
  }

  init() {
    if (!this.sections.length) return;

    this.sections.forEach(section => {
      this.initSection(section);
    });

    // Inicializar Intersection Observer para lazy loading
    this.initLazyLoading();
    
    // Adicionar eventos de interação
    this.initInteractions();
    
    // Inicializar acessibilidade
    this.initAccessibility();
    
    // Observar mudanças de layout
    this.initResizeObserver();
  }

  initSection(section) {
    const cardCount = parseInt(section.dataset.cardCount);
    const layout = section.dataset.layout;
    
    // Ajustar altura dinamicamente baseado no número de cards
    this.adjustSectionHeight(section, cardCount, layout);
    
    // Adicionar classes de animação
    this.addAnimationClasses(section);
  }

  adjustSectionHeight(section, cardCount, layout) {
    const container = section.querySelector('.grid-container');
    if (!container) return;

    // No desktop, manter altura fixa
    if (window.innerWidth > 749) {
      if (cardCount === 1) {
        container.style.height = '580px';
      } else if (cardCount === 2 || (cardCount === 3 && layout === 'inline')) {
        container.style.height = '580px';
      } else if (cardCount === 3 && layout === 'default') {
        container.style.height = '580px';
      }
    }
  }

  initLazyLoading() {
    const images = document.querySelectorAll('.grid-card__image:not(.loaded)');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.01
      });

      images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
      });
    } else {
      // Fallback para browsers sem suporte ao Intersection Observer
      images.forEach(img => this.loadImage(img));
    }
  }

  loadImage(img) {
    // Se a imagem já tem src, apenas adicionar classe loaded
    if (img.src && !img.src.includes('data:')) {
      img.classList.remove('loading');
      img.classList.add('loaded');
      return;
    }

    // Se tem data-src, fazer lazy loading
    if (img.dataset.src) {
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = tempImg.src;
        img.classList.remove('loading');
        img.classList.add('loaded');
      };
      tempImg.src = img.dataset.src;
    } else {
      img.classList.remove('loading');
      img.classList.add('loaded');
    }
  }

  initInteractions() {
    const cards = document.querySelectorAll('.grid-card');
    
    cards.forEach(card => {
      // Adicionar efeito de hover com mouse
      this.addHoverEffect(card);
      
      // Adicionar efeito de parallax suave (opcional)
      this.addParallaxEffect(card);
      
      // Adicionar click tracking
      this.addClickTracking(card);
      
      // Adicionar suporte para card clicável
      this.addClickableCardSupport(card);
    });
  }

  addHoverEffect(card) {
    let isHovering = false;
    
    card.addEventListener('mouseenter', () => {
      isHovering = true;
      card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
      isHovering = false;
      setTimeout(() => {
        if (!isHovering) {
          card.style.zIndex = '';
        }
      }, 300);
    });
  }

  addParallaxEffect(card) {
    if (window.innerWidth <= 749) return; // Desabilitar no mobile
    
    const image = card.querySelector('.grid-card__image');
    if (!image) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / centerX * 5; // 5px de movimento máximo
      const moveY = (y - centerY) / centerY * 5;
      
      image.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      image.style.transform = 'scale(1)';
    });
  }

  addClickTracking(card) {
    const button = card.querySelector('.grid-card__button');
    if (!button) return;

    button.addEventListener('click', (e) => {
      // Adicionar ripple effect
      this.createRipple(e, button);
      
      // Analytics tracking (se disponível)
      if (typeof window.Shopify !== 'undefined' && window.Shopify.analytics) {
        const cardIndex = card.dataset.cardIndex;
        window.Shopify.analytics.publish('grid_card_click', {
          card_index: cardIndex,
          url: button.href
        });
      }
    });
  }

  addClickableCardSupport(card) {
    // Verificar se o card é clicável
    if (!card.classList.contains('grid-card--clickable')) return;
    
    const linkWrapper = card.querySelector('.grid-card__link-wrapper');
    if (!linkWrapper) return;
    
    // Adicionar visual feedback no hover
    card.addEventListener('mouseenter', () => {
      card.style.cursor = 'pointer';
    });
    
    // Prevenir propagação de cliques em elementos internos
    const internalLinks = card.querySelectorAll('a:not(.grid-card__link-wrapper)');
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
    
    // Adicionar suporte para navegação por teclado
    linkWrapper.setAttribute('role', 'link');
    linkWrapper.setAttribute('tabindex', '0');
    
    linkWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        linkWrapper.click();
      }
    });
    
    // Analytics para card clicável
    linkWrapper.addEventListener('click', () => {
      if (typeof window.Shopify !== 'undefined' && window.Shopify.analytics) {
        const cardIndex = card.dataset.cardIndex;
        window.Shopify.analytics.publish('grid_card_full_click', {
          card_index: cardIndex,
          url: linkWrapper.href
        });
      }
    });
  }

  createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('button-ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  initAccessibility() {
    const buttons = document.querySelectorAll('.grid-card__button');
    
    buttons.forEach(button => {
      // Navegação por teclado
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
      
      // Adicionar role e aria-labels se necessário
      if (!button.getAttribute('role')) {
        button.setAttribute('role', 'button');
      }
      
      // Adicionar indicador de foco visível
      button.addEventListener('focus', () => {
        button.parentElement.classList.add('has-focus');
      });
      
      button.addEventListener('blur', () => {
        button.parentElement.classList.remove('has-focus');
      });
    });

    // Adicionar suporte para navegação por tabs
    this.initTabNavigation();
  }

  initTabNavigation() {
    const cards = document.querySelectorAll('.grid-card');
    
    cards.forEach((card, index) => {
      const focusableElements = card.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      
      if (focusableElements.length === 0) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        card.setAttribute('aria-label', `Card ${index + 1}`);
      }
    });
  }

  initResizeObserver() {
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const section = entry.target.closest('.grid-image-section');
          if (section) {
            const cardCount = parseInt(section.dataset.cardCount);
            const layout = section.dataset.layout;
            this.adjustSectionHeight(section, cardCount, layout);
          }
        });
      });

      this.sections.forEach(section => {
        const container = section.querySelector('.grid-container');
        if (container) {
          resizeObserver.observe(container);
        }
      });
    }
  }

  addAnimationClasses(section) {
    const cards = section.querySelectorAll('.grid-card');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, index * 100);
        }
      });
    }, observerOptions);

    cards.forEach(card => {
      animationObserver.observe(card);
    });
  }

  // Método público para reinicializar a seção (útil para Shopify Theme Editor)
  refresh() {
    this.sections = document.querySelectorAll('.grid-image-section');
    this.init();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.gridImageSection = new GridImageSection();
});

// Reinicializar no Shopify Theme Editor
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    if (event.detail.sectionId && event.target.classList.contains('grid-image-section')) {
      setTimeout(() => {
        window.gridImageSection.refresh();
      }, 100);
    }
  });

  document.addEventListener('shopify:block:select', (event) => {
    const card = event.target.closest('.grid-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('is-selected');
    }
  });

  document.addEventListener('shopify:block:deselect', (event) => {
    const card = event.target.closest('.grid-card');
    if (card) {
      card.classList.remove('is-selected');
    }
  });
}

// CSS para o ripple effect (adicionar ao grid-images.css)
const rippleStyles = `
  .button-ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  }

  .grid-card__button {
    position: relative;
    overflow: hidden;
  }

  .grid-card.is-selected {
    box-shadow: 0 0 0 3px rgba(var(--color-foreground), 0.5);
  }

  .grid-card.animated {
    animation: fadeInUp 0.6s ease-out;
  }

  .grid-card__content.has-focus {
    outline: 2px dashed rgba(var(--color-foreground), 0.5);
    outline-offset: 4px;
  }
`;

// Adicionar estilos dinamicamente
const styleSheet = document.createElement('style');
styleSheet.textContent = rippleStyles;
document.head.appendChild(styleSheet);