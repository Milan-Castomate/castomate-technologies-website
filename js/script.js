document.addEventListener('DOMContentLoaded', () => {
    // --- General UI Enhancements ---
    // Smooth scroll for anchor links (if any are used beyond basic navigation)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.getAttribute('href').length > 1) { // Ensure it's not just "#"
            anchor.addEventListener('click', function (e) {
                const hrefAttribute = this.getAttribute('href');
                const targetElement = document.querySelector(hrefAttribute);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Update copyright year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Optional: Change menu icon (e.g., hamburger to X)
            // menuToggle.textContent = navLinks.classList.contains('active') ? '[icon: Close]' : '[icon: Menu]';
        });
    }

    // --- Home Page Hero Slider ---
    const slides = document.querySelectorAll('.hero .slide');
    const prevSlideBtn = document.querySelector('.hero .prev-slide');
    const nextSlideBtn = document.querySelector('.hero .next-slide');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    if (slides.length > 0) {
        showSlide(currentSlide); // Show initial slide
        if (prevSlideBtn && nextSlideBtn) {
            prevSlideBtn.addEventListener('click', () => {
                prevSlide();
                resetSlideInterval();
            });
            nextSlideBtn.addEventListener('click', () => {
                nextSlide();
                resetSlideInterval();
            });
        }
        // Auto-play
        slideInterval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
    }
    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 7000);
    }


    // --- Home Page Testimonial Slider ---
    const testimonials = document.querySelectorAll('.testimonial-slider-container .testimonial');
    const prevTestimonialBtn = document.querySelector('.testimonial-controls .prev-testimonial');
    const nextTestimonialBtn = document.querySelector('.testimonial-controls .next-testimonial');
    let currentTestimonial = 0;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.remove('active');
            if (i === index) {
                testimonial.classList.add('active');
            }
        });
    }

    if (testimonials.length > 0) {
        showTestimonial(currentTestimonial); // Show initial testimonial
        if (prevTestimonialBtn && nextTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', () => {
                currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
            nextTestimonialBtn.addEventListener('click', () => {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                showTestimonial(currentTestimonial);
            });
        }
    }

    // --- Contact Form Validation & Simulated Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (validateForm(this)) {
                // Simulate submission
                const formStatus = document.getElementById('formStatus');
                formStatus.textContent = 'Sending message...';
                formStatus.className = 'form-status-message'; // Reset classes

                setTimeout(() => {
                    formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
                    formStatus.classList.add('success');
                    this.reset(); // Clear the form
                    clearErrorMessages(this);
                }, 1500); // Simulate network delay
            }
        });
    }

    // --- Request a Quote Form Validation & Simulated Submission ---
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (validateForm(this)) {
                const formStatus = document.getElementById('quoteFormStatus');
                formStatus.textContent = 'Submitting request...';
                formStatus.className = 'form-status-message'; // Reset classes

                setTimeout(() => {
                    formStatus.textContent = 'Quote request submitted successfully! Our team will contact you shortly.';
                    formStatus.classList.add('success');
                    this.reset();
                    clearErrorMessages(this);
                    // Reset dynamically added product fields if any
                    const additionalProductsContainer = document.getElementById('additionalProductsContainer');
                    if (additionalProductsContainer) additionalProductsContainer.innerHTML = '';
                }, 1500);
            }
        });
    }

    // Shared Form Validation Logic
    function validateForm(form) {
        let isValid = true;
        clearErrorMessages(form);

        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            let errorMessage = '';
            if (field.type === 'checkbox' && !field.checked) {
                errorMessage = 'This field is required.';
            } else if (field.value.trim() === '') {
                errorMessage = 'This field cannot be empty.';
            } else if (field.type === 'email' && !isValidEmail(field.value.trim())) {
                errorMessage = 'Please enter a valid email address.';
            }
            // Add more specific validation for phone, etc. if needed

            if (errorMessage) {
                isValid = false;
                showError(field, errorMessage);
            }
        });
        return isValid;
    }

    function isValidEmail(email) {
        // Basic email validation regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(field, message) {
        const errorElement = field.closest('.form-group').querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
        field.classList.add('input-error'); // Optional: add class for styling invalid input
    }

    function clearErrorMessages(form) {
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    }


    // --- "Request a Quote" Page - Add/Remove Product Functionality ---
    const addProductBtn = document.getElementById('addProductBtn');
    const additionalProductsContainer = document.getElementById('additionalProductsContainer');
    const productSelectionDropdown = document.getElementById('productSelection'); // The first/main dropdown

    if (addProductBtn && additionalProductsContainer && productSelectionDropdown) {
        let productRowCount = 0;

        addProductBtn.addEventListener('click', () => {
            productRowCount++;
            const newProductRow = document.createElement('div');
            newProductRow.classList.add('form-row', 'additional-product-item');
            newProductRow.innerHTML = `
                <div class="form-group">
                    <label for="productSelection${productRowCount}">Select Product:</label>
                    <select id="productSelection${productRowCount}" name="productSelection${productRowCount}">
                        ${productSelectionDropdown.innerHTML}
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantity${productRowCount}">Quantity / Notes:</label>
                    <input type="text" id="quantity${productRowCount}" name="quantity${productRowCount}" placeholder="e.g., 500 pcs, specific grade">
                </div>
                <button type="button" class="remove-product-btn"><i class="fas fa-trash-alt"></i></button>
            `;
            additionalProductsContainer.appendChild(newProductRow);

            // Add event listener to the new remove button
            newProductRow.querySelector('.remove-product-btn').addEventListener('click', function() {
                this.closest('.additional-product-item').remove();
            });
        });
    }

}); // End DOMContentLoaded