// Literate Lamp homepage interactivity
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('a[href^="#"]');

    // Smooth scroll with offset for sticky header
    const scrollWithOffset = (target) => {
        const top = target.getBoundingClientRect().top + window.scrollY;
        const offset = header ? header.getBoundingClientRect().height + 16 : 0;
        window.scrollTo({
            top: Math.max(top - offset, 0),
            behavior: 'smooth'
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const hash = link.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            event.preventDefault();
            scrollWithOffset(target);
            history.pushState(null, '', hash);
        });
    });

    // Hero entrance animation
    const heroContent = document.querySelector('.hero__content');
    const heroCard = document.querySelector('.hero-card');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(40px)';
        requestAnimationFrame(() => {
            heroContent.style.transition = 'opacity 700ms var(--motion-ease-hero), transform 700ms var(--motion-ease-hero)';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        });
    }
    if (heroCard) {
        heroCard.style.opacity = '0';
        heroCard.style.transform = 'translateY(60px)';
        requestAnimationFrame(() => {
            heroCard.style.transition = 'opacity 800ms var(--motion-ease-hero) 120ms, transform 800ms var(--motion-ease-hero) 120ms';
            heroCard.style.opacity = '1';
            heroCard.style.transform = 'translateY(0)';
        });
    }

    // Intersection observer for feature cards and testimonial reveal
    const animatedBlocks = document.querySelectorAll('.feature-card, .spec-item, .testimonial-card');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                entry.target.style.setProperty('transition', 'opacity 700ms var(--motion-ease), transform 700ms var(--motion-ease)');
                entry.target.style.setProperty('opacity', '1');
                entry.target.style.setProperty('transform', 'translateY(0)');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -10%' });

    animatedBlocks.forEach((block, index) => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(30px)';
        block.style.transitionDelay = `${index * 60}ms`;
        observer.observe(block);
    });
});

// Utility function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to show notification messages
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 88px;
        right: 24px;
        background: ${type === 'error' ? 'rgba(168, 7, 43, 0.95)' : type === 'success' ? 'rgba(32, 151, 88, 0.95)' : 'rgba(39, 107, 202, 0.95)'};
        color: #fff;
        padding: 16px 20px;
        border-radius: 999px;
        box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.45);
        z-index: 10000;
        transform: translateX(360px);
        transition: transform 320ms var(--motion-ease);
        max-width: min(320px, calc(100vw - 32px));
        font-weight: 600;
        letter-spacing: 0.02em;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    const dismiss = () => {
        notification.style.transform = 'translateX(360px)';
        setTimeout(() => notification.remove(), 320);
    };

    const timeout = window.setTimeout(dismiss, 5000);

    notification.addEventListener('mouseenter', () => window.clearTimeout(timeout));
    notification.addEventListener('mouseleave', () => window.setTimeout(dismiss, 2000));
    notification.addEventListener('click', dismiss);
}

window.showNotification = showNotification;
window.getUrlParameter = getUrlParameter;