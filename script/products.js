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
const filterButtons = document.querySelectorAll('.category-filter');
const productItems = document.querySelectorAll('.product-item');

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
        productItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
                // Trigger reflow for animation
                void item.offsetWidth;
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in');
            }
        });
    });
});

// Product modal functionality
const viewProductButtons = document.querySelectorAll('.view-product');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');

// Sample product data
const products = {
    1: {
        title: "Torta de Chocolate Clásica",
        description: "Una exquisita torta de chocolate con capas de bizcocho de chocolate húmedo, relleno de ganache de chocolate negro y cubierta con crema de chocolate. Decorada con virutas de chocolate y frutos rojos.",
        price: "S/ 45.00",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        ingredients: ["Chocolate negro 70%", "Harina de trigo", "Huevos frescos", "Mantequilla", "Azúcar", "Crema de leche", "Frutos rojos"]
    },
    2: {
        title: "Tarta de Frutas Frescas",
        description: "Deliciosa tarta con base de masa quebrada, crema pastelera casera y decorada con una selección de frutas frescas de temporada. Un postre refrescante y colorido.",
        price: "S/ 38.00",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        ingredients: ["Masa quebrada", "Crema pastelera", "Fresas", "Kiwi", "Duraznos", "Uvas", "Glaseado transparente"]
    },
    // Add more products as needed
};

viewProductButtons.forEach(button => {
    button.addEventListener('click', () => {
        const productId = button.dataset.id;
        const product = products[productId];
        
        if (product) {
            document.getElementById('modal-image').src = product.image;
            document.getElementById('modal-title').textContent = product.title;
            document.getElementById('modal-description').textContent = product.description;
            document.getElementById('modal-price').textContent = product.price;
            document.getElementById('modal-total-price').textContent = product.price;
            
            // Clear previous ingredients
            const ingredientsList = document.getElementById('modal-ingredients');
            ingredientsList.innerHTML = '';
            
            // Add ingredients
            product.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });
            
            // Show modal
            productModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

closeModalBtn.addEventListener('click', () => {
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
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

// Search functionality
const searchInput = document.querySelector('input[type="text"]');
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    productItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'block';
            void item.offsetWidth;
            item.classList.add('fade-in');
        } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
});