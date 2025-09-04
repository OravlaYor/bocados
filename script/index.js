// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
});

closeMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = 'auto';
});

// Close mobile menu when clicking on a link
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = 'auto';
    });
});

// Product filter functionality
const filterButtons = document.querySelectorAll('.product-filter');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-orange-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        });

        // Add active class to clicked button
        button.classList.add('active', 'bg-orange-600', 'text-white');
        button.classList.remove('bg-white', 'text-gray-600');

        const filter = button.dataset.filter;

        // Filter products
        productCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                // Trigger reflow for animation
                void card.offsetWidth;
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.card-hover, .product-card').forEach(el => {
    observer.observe(el);
});

// Cart functionality
let cartCount = 0;
const cartCountElement = document.getElementById('cart-count');
const cartButtons = document.querySelectorAll('.add-to-cart');

cartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Animation for cart button
        cartCountElement.classList.add('animate-ping');
        setTimeout(() => {
            cartCountElement.classList.remove('animate-ping');
        }, 600);
        
        const originalText = button.textContent;
        button.textContent = 'Agregado!';
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
        }, 1500);
    });
});

// Form validation
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simple validation
        const nameInput = contactForm.querySelector('input[name="name"]');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');
        
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            nameInput.classList.add('border-red-500');
            isValid = false;
        } else {
            nameInput.classList.remove('border-red-500');
        }
        
        if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
            emailInput.classList.add('border-red-500');
            isValid = false;
        } else {
            emailInput.classList.remove('border-red-500');
        }
        
        if (!messageInput.value.trim()) {
            messageInput.classList.add('border-red-500');
            isValid = false;
        } else {
            messageInput.classList.remove('border-red-500');
        }
        
        if (isValid) {
            // Here you would typically send the form data to a server
            alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
            contactForm.reset();
        }
    });
}

// Optimized parallax effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxBack = document.querySelector('.parallax-back');
    if (parallaxBack) {
        const speed = scrolled * 0.5;
        parallaxBack.style.transform = `translateZ(-1px) scale(2) translateY(${speed}px)`;
    }
}, { passive: true });