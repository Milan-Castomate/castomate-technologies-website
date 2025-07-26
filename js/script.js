document.addEventListener('DOMContentLoaded', () => {
    // --- General UI Scripts ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Homepage Sliders ---
    const heroSlider = document.querySelector('.hero-slider');
    if(heroSlider) {
        const slides = heroSlider.querySelectorAll('.slide');
        const prevSlideBtn = document.querySelector('.hero .prev-slide');
        const nextSlideBtn = document.querySelector('.hero .next-slide');
        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) { slides.forEach((slide, i) => { slide.classList.remove('active'); if (i === index) slide.classList.add('active'); }); }
        function nextSlideFn() { currentSlide = (currentSlide + 1) % slides.length; showSlide(currentSlide); }
        function prevSlideFn() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; showSlide(currentSlide); }
        function resetSlideInterval() { if (slides.length > 1) { clearInterval(slideInterval); slideInterval = setInterval(nextSlideFn, 7000); } }
        if (slides.length > 0) { showSlide(currentSlide); if (prevSlideBtn && nextSlideBtn) { prevSlideBtn.addEventListener('click', () => { prevSlideFn(); resetSlideInterval(); }); nextSlideBtn.addEventListener('click', () => { nextSlideFn(); resetSlideInterval(); }); } if (slides.length > 1) slideInterval = setInterval(nextSlideFn, 7000); }
    }

    const testimonialSlider = document.querySelector('.testimonial-slider-container');
    if(testimonialSlider) {
        const testimonials = testimonialSlider.querySelectorAll('.testimonial');
        const prevTestimonialBtn = document.querySelector('.testimonial-controls .prev-testimonial');
        const nextTestimonialBtn = document.querySelector('.testimonial-controls .next-testimonial');
        let currentTestimonial = 0;
        function showTestimonial(index) { testimonials.forEach((testimonial, i) => { testimonial.classList.remove('active'); if (i === index) testimonial.classList.add('active'); }); }
        if (testimonials.length > 0) { showTestimonial(currentTestimonial); if (prevTestimonialBtn && nextTestimonialBtn) { prevTestimonialBtn.addEventListener('click', () => { currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length; showTestimonial(currentTestimonial); }); nextTestimonialBtn.addEventListener('click', () => { currentTestimonial = (currentTestimonial + 1) % testimonials.length; showTestimonial(currentTestimonial); }); } }
    }

    // --- Shared Form Validation Helper Functions ---
    function validateForm(form) { let isValid = true; clearErrorMessages(form); const requiredFields = form.querySelectorAll('[required]'); requiredFields.forEach(field => { let errorMessage = ''; if (field.type === 'checkbox' && !field.checked) { errorMessage = 'This field is required.'; } else if (field.value.trim() === '') { errorMessage = 'This field cannot be empty.'; } else if (field.type === 'email' && !isValidEmail(field.value.trim())) { errorMessage = 'Please enter a valid email address.'; } if (errorMessage) { isValid = false; showError(field, errorMessage); } }); return isValid; }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function showError(field, message) { const errorContainer = field.closest('.form-group'); if (errorContainer) { const errorElement = errorContainer.querySelector('.error-message'); if (errorElement) errorElement.textContent = message; } }
    function clearErrorMessages(form) { form.querySelectorAll('.error-message').forEach(el => el.textContent = ''); }

    // --- Contact Form AJAX Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const form = event.target;
            const formStatus = document.getElementById('formStatus');
            if (validateForm(form)) {
                const formData = new FormData(form);
                formStatus.textContent = 'Sending message...';
                formStatus.className = 'form-status-message';
                fetch(form.action, { method: form.method, body: formData, headers: { 'Accept': 'application/json' } })
                    .then(response => {
                        if (response.ok) {
                            formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
                            formStatus.classList.add('success');
                            form.reset();
                            clearErrorMessages(form);
                        } else {
                            response.json().then(data => {
                                const errorMsg = (data.errors) ? data.errors.map(e => e.message).join(", ") : "Please try again.";
                                formStatus.textContent = `Oops! There was a problem: ${errorMsg}`;
                                formStatus.classList.add('error');
                            });
                        }
                    })
                    .catch(error => {
                        formStatus.textContent = 'Oops! There was a problem submitting your message.';
                        formStatus.classList.add('error');
                        console.error('Error submitting contact form:', error);
                    });
            }
        });
    }
    
    // --- Request a Quote Form AJAX Submission ---
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const form = event.target;
            const formStatus = document.getElementById('quoteFormStatus');
            if (validateForm(form)) {
                const formData = new FormData(form);
                formStatus.textContent = 'Submitting request...';
                formStatus.className = 'form-status-message';
                fetch(form.action, { method: form.method, body: formData, headers: { 'Accept': 'application/json' } })
                    .then(response => {
                        if (response.ok) {
                            formStatus.textContent = 'Quote request submitted successfully! Our team will contact you shortly.';
                            formStatus.classList.add('success');
                            form.reset();
                            clearErrorMessages(form);
                            const additionalProductsContainer = document.getElementById('additionalProductsContainer');
                            if (additionalProductsContainer) additionalProductsContainer.innerHTML = '';
                        } else {
                            response.json().then(data => {
                                const errorMsg = (data.errors) ? data.errors.map(e => e.message).join(", ") : "Please try again.";
                                formStatus.textContent = `Oops! There was a problem: ${errorMsg}`;
                                formStatus.classList.add('error');
                            });
                        }
                    })
                    .catch(error => {
                        formStatus.textContent = 'Oops! There was a problem submitting your request.';
                        formStatus.classList.add('error');
                        console.error('Error submitting quote form:', error);
                    });
            }
        });
    }
    
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
            newProductRow.innerHTML = `
                <div class="form-group">
                    <select name="productSelection${productRowCount}">${productSelectionDropdown.innerHTML}</select>
                </div>
                <div class="form-group">
                    <input type="text" name="quantity${productRowCount}" placeholder="Quantity / Notes">
                </div>
                <button type="button" class="remove-product-btn"><i class="fas fa-trash-alt"></i></button>
            `;
            additionalProductsContainer.appendChild(newProductRow);
            newProductRow.querySelector('.remove-product-btn').addEventListener('click', function() {
                this.closest('.additional-product-item').remove();
            });
        });
    }
});