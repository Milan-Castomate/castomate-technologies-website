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
            // if (navLinks.classList.contains('active')) {
            //     menuToggle.innerHTML = '<i class="fas fa-times"></i>'; // Close icon
            // } else {
            //     menuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Menu icon
            // }
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

    function nextSlideFn() { // Renamed to avoid conflict if nextSlide is a global var elsewhere
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlideFn() { // Renamed
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    function resetSlideInterval() {
        if (slides.length > 1) { // Only reset if there's more than one slide
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlideFn, 7000);
        }
    }

    if (slides.length > 0) {
        showSlide(currentSlide); // Show initial slide
        if (prevSlideBtn && nextSlideBtn) {
            prevSlideBtn.addEventListener('click', () => {
                prevSlideFn();
                resetSlideInterval();
            });
            nextSlideBtn.addEventListener('click', () => {
                nextSlideFn();
                resetSlideInterval();
            });
        }
        if (slides.length > 1) {
             slideInterval = setInterval(nextSlideFn, 7000); // Auto-play if more than one slide
        }
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
        showTestimonial(currentTestimonial);
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

    // --- Shared Form Validation Helper Functions ---
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
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(field, message) {
        const errorContainer = field.closest('.form-group');
        if (errorContainer) {
            const errorElement = errorContainer.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = message;
            }
        }
        // field.classList.add('input-error'); // Optional: add class for styling invalid input
    }

    function clearErrorMessages(form) {
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        // form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error')); // Optional
    }

    // --- Contact Form Validation & Simulated Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default browser submission
            const formStatus = document.getElementById('formStatus');
            
            if (validateForm(this)) {
                // Simulate submission for contact form
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

    // --- Request a Quote Form Validation & AJAX Submission to Formspree ---
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default browser submission
            const form = event.target;
            const formStatus = document.getElementById('quoteFormStatus');
            
            if (validateForm(form)) {
                const formData = new FormData(form);
                formStatus.textContent = 'Submitting request...';
                formStatus.className = 'form-status-message'; // Reset classes

                fetch(form.action, { // form.action should be your Formspree endpoint URL
                    method: form.method, // form.method should be "POST"
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree AJAX
                    }
                }).then(response => {
                    if (response.ok) {
                        formStatus.textContent = 'Quote request submitted successfully! Our team will contact you shortly.';
                        formStatus.classList.add('success');
                        form.reset();
                        clearErrorMessages(form);
                        const additionalProductsContainer = document.getElementById('additionalProductsContainer');
                        if (additionalProductsContainer) additionalProductsContainer.innerHTML = ''; // Reset dynamically added products
                    } else {
                        response.json().then(data => {
                            if (data.errors && data.errors.length > 0) {
                                const errorMessages = data.errors.map(error => error.message).join(", ");
                                formStatus.textContent = `Oops! There was a problem: ${errorMessages}`;
                            } else {
                                formStatus.textContent = 'Oops! There was a problem submitting your request. Please try again.';
                            }
                            formStatus.classList.add('error');
                        }).catch(() => {
                            // Fallback if response.json() fails or if no JSON error details from Formspree
                            formStatus.textContent = 'Oops! There was a problem submitting your request. Please try again later.';
                            formStatus.classList.add('error');
                        });
                    }
                }).catch(error => {
                    console.error('Error submitting quote form to Formspree:', error);
                    formStatus.textContent = 'Oops! There was a problem submitting your request. Please check your connection and try again.';
                    formStatus.classList.add('error');
                });
            }
        });
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
            // Ensure productSelectionDropdown.innerHTML contains valid options
            // It should be populated by js/products.js -> populateQuoteProductDropdown
            if (!productSelectionDropdown.innerHTML.includes('<option')) {
                console.warn("Product selection dropdown for quote form appears empty. Products might not have loaded.");
                // Optionally provide a default empty select or a message
            }
            
            newProductRow.innerHTML = `
                <div class="form-group" style="flex-grow: 1;">
                    <label for="productSelection${productRowCount}" class="sr-only">Select Product ${productRowCount + 1}:</label>
                    <select id="productSelection${productRowCount}" name="productSelection${productRowCount}">
                        ${productSelectionDropdown.innerHTML}
                    </select>
                </div>
                <div class="form-group" style="flex-grow: 1;">
                    <label for="quantity${productRowCount}" class="sr-only">Quantity / Notes for Product ${productRowCount + 1}:</label>
                    <input type="text" id="quantity${productRowCount}" name="quantity${productRowCount}" placeholder="Quantity / Notes">
                </div>
                <button type="button" class="remove-product-btn"><i class="fas fa-trash-alt"></i></button>
            `;
            // Add sr-only class for labels in dynamically added rows if you want to hide them visually but keep for accessibility
            // You would need to define .sr-only in your CSS:
            // .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

            additionalProductsContainer.appendChild(newProductRow);

            newProductRow.querySelector('.remove-product-btn').addEventListener('click', function() {
                this.closest('.additional-product-item').remove();
            });
        });
    }

}); // End DOMContentLoaded