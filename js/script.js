document.addEventListener('DOMContentLoaded', () => {

    // --- Mega Menu Population (Runs on every page) ---
    async function loadMegaMenu() {
        const megaMenuContainer = document.getElementById('mega-menu-content');
        if (!megaMenuContainer) return;

        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error('Failed to fetch product data for menu');
            const categories = await response.json();

            megaMenuContainer.innerHTML = ''; 

            const categoryPanel = document.createElement('div');
            categoryPanel.id = 'mega-menu-categories';
            const productPanel = document.createElement('div');
            productPanel.id = 'mega-menu-products';

            const categoryList = document.createElement('ul');
            categories.forEach(category => {
                const categoryItem = document.createElement('li');
                categoryItem.classList.add('category-item');
                categoryItem.innerHTML = `<a href="products.html#${category.categoryId}">${category.categoryName}</a>`;
                
                categoryItem.addEventListener('mouseenter', () => {
                    document.querySelectorAll('#mega-menu-categories .category-item').forEach(item => item.classList.remove('active'));
                    categoryItem.classList.add('active');

                    productPanel.innerHTML = `<h4>${category.categoryName}</h4>`;
                    const productList = document.createElement('ul');
                    if (category.products && category.products.length > 0) {
                        const productsToShow = category.products.slice(0, 9);
                        productsToShow.forEach(product => {
                            const productItem = document.createElement('li');
                            productItem.classList.add('product-link');
                            productItem.innerHTML = `<a href="products.html#${product.id}">${product.name}</a>`;
                            productList.appendChild(productItem);
                        });
                    } else {
                        productList.innerHTML = '<li>No products in this category.</li>';
                    }
                    productPanel.appendChild(productList);
                });
                
                categoryList.appendChild(categoryItem);
            });
            categoryPanel.appendChild(categoryList);
            
            productPanel.innerHTML = '<h4>Hover over a category to view products</h4>';

            megaMenuContainer.appendChild(categoryPanel);
            megaMenuContainer.appendChild(productPanel);
            
            const firstCategoryItem = megaMenuContainer.querySelector('.category-item');
            if(firstCategoryItem) {
                firstCategoryItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            }

        } catch (error) {
            console.error("Mega Menu Error:", error);
            megaMenuContainer.innerHTML = '<p>Could not load product categories.</p>';
        }
    }
    loadMegaMenu();


    // --- General UI Scripts ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) { menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); }); }
    const slides = document.querySelectorAll('.hero .slide'); const prevSlideBtn = document.querySelector('.hero .prev-slide'); const nextSlideBtn = document.querySelector('.hero .next-slide'); let currentSlide = 0; let slideInterval; function showSlide(index) { slides.forEach((slide, i) => { slide.classList.remove('active'); if (i === index) slide.classList.add('active'); }); } function nextSlideFn() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); } function prevSlideFn() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); } function resetSlideInterval() { if (slides.length > 1) { clearInterval(slideInterval); slideInterval = setInterval(nextSlideFn, 7000); } } if (slides.length > 0) { showSlide(currentSlide); if (prevSlideBtn && nextSlideBtn) { prevSlideBtn.addEventListener('click', () => { prevSlideFn(); resetSlideInterval(); }); nextSlideBtn.addEventListener('click', () => { nextSlideFn(); resetSlideInterval(); }); } if (slides.length > 1) slideInterval = setInterval(nextSlideFn, 7000); }
    const testimonials = document.querySelectorAll('.testimonial-slider-container .testimonial'); const prevTestimonialBtn = document.querySelector('.testimonial-controls .prev-testimonial'); const nextTestimonialBtn = document.querySelector('.testimonial-controls .next-testimonial'); let currentTestimonial = 0; function showTestimonial(index) { testimonials.forEach((testimonial, i) => { testimonial.classList.remove('active'); if (i === index) testimonial.classList.add('active'); }); } if (testimonials.length > 0) { showTestimonial(currentTestimonial); if (prevTestimonialBtn && nextTestimonialBtn) { prevTestimonialBtn.addEventListener('click', () => { currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length; showTestimonial(currentTestimonial); }); nextTestimonialBtn.addEventListener('click', () => { currentTestimonial = (currentTestimonial + 1) % testimonials.length; showTestimonial(currentTestimonial); }); } }
    
    // --- Shared Form Validation Helper Functions ---
    function validateForm(form) { let isValid = true; clearErrorMessages(form); const requiredFields = form.querySelectorAll('[required]'); requiredFields.forEach(field => { let errorMessage = ''; if (field.type === 'checkbox' && !field.checked) { errorMessage = 'This field is required.'; } else if (field.value.trim() === '') { errorMessage = 'This field cannot be empty.'; } else if (field.type === 'email' && !isValidEmail(field.value.trim())) { errorMessage = 'Please enter a valid email address.'; } if (errorMessage) { isValid = false; showError(field, errorMessage); } }); return isValid; }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function showError(field, message) { const errorContainer = field.closest('.form-group'); if (errorContainer) { const errorElement = errorContainer.querySelector('.error-message'); if (errorElement) errorElement.textContent = message; } }
    function clearErrorMessages(form) { form.querySelectorAll('.error-message').forEach(el => el.textContent = ''); }

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contactForm'); if (contactForm) { contactForm.addEventListener('submit', function(event) { event.preventDefault(); const form = event.target; const formStatus = document.getElementById('formStatus'); if (validateForm(form)) { const formData = new FormData(form); formStatus.textContent = 'Sending message...'; formStatus.className = 'form-status-message'; fetch(form.action, { method: form.method, body: formData, headers: { 'Accept': 'application/json' } }).then(response => { if (response.ok) { formStatus.textContent = 'Message sent successfully! We will get back to you soon.'; formStatus.classList.add('success'); form.reset(); clearErrorMessages(form); } else { response.json().then(data => { const errorMsg = (data.errors) ? data.errors.map(e => e.message).join(", ") : "Please try again."; formStatus.textContent = `Oops! There was a problem: ${errorMsg}`; formStatus.classList.add('error'); }); } }).catch(error => { formStatus.textContent = 'Oops! There was a problem submitting your message.'; formStatus.classList.add('error'); console.error('Error submitting contact form:', error); }); } }); }
    
    // --- Request a Quote Form AJAX Submission ---
    const quoteForm = document.getElementById('quoteForm'); if (quoteForm) { quoteForm.addEventListener('submit', function(event) { event.preventDefault(); const form = event.target; const formStatus = document.getElementById('quoteFormStatus'); if (validateForm(form)) { const formData = new FormData(form); formStatus.textContent = 'Submitting request...'; formStatus.className = 'form-status-message'; fetch(form.action, { method: form.method, body: formData, headers: { 'Accept': 'application/json' } }).then(response => { if (response.ok) { formStatus.textContent = 'Quote request submitted successfully! Our team will contact you shortly.'; formStatus.classList.add('success'); form.reset(); clearErrorMessages(form); const additionalProductsContainer = document.getElementById('additionalProductsContainer'); if (additionalProductsContainer) additionalProductsContainer.innerHTML = ''; } else { response.json().then(data => { const errorMsg = (data.errors) ? data.errors.map(e => e.message).join(", ") : "Please try again."; formStatus.textContent = `Oops! There was a problem: ${errorMsg}`; formStatus.classList.add('error'); }); } }).catch(error => { formStatus.textContent = 'Oops! There was a problem submitting your request.'; formStatus.classList.add('error'); console.error('Error submitting quote form:', error); }); } }); }
    
    // --- "Request a Quote" Page - Add/Remove Product Functionality ---
    const addProductBtn = document.getElementById('addProductBtn');
    const additionalProductsContainer = document.getElementById('additionalProductsContainer');
    const productSelectionDropdown = document.getElementById('productSelection');

    if (addProductBtn && additionalProductsContainer && productSelectionDropdown) {
        let productRowCount = 0;
        addProductBtn.addEventListener('click', () => {
            productRowCount++;
            const newProductRow = document.createElement('div');
            newProductRow.classList.add('form-row', 'additional-product-item');
            
            // === THIS IS THE SECTION WITH THE FIX ===
            // The "Remove" button now includes text to help match the "Add" button's size.
            newProductRow.innerHTML = `
                <div class="form-group">
                    <label for="productSelection${productRowCount}" class="sr-only">Select Product ${productRowCount + 1}:</label>
                    <select id="productSelection${productRowCount}" name="productSelection${productRowCount}">${productSelectionDropdown.innerHTML}</select>
                </div>
                <div class="form-group">
                    <label for="quantity${productRowCount}" class="sr-only">Quantity / Notes for Product ${productRowCount + 1}:</label>
                    <input type="text" id="quantity${productRowCount}" name="quantity${productRowCount}" placeholder="Quantity / Notes">
                </div>
                <button type="button" class="remove-product-btn">Remove</button>
            `;
            // === END OF FIX ===

            additionalProductsContainer.appendChild(newProductRow);

            newProductRow.querySelector('.remove-product-btn').addEventListener('click', function() {
                this.closest('.additional-product-item').remove();
            });
        });
    }

}); // End DOMContentLoaded