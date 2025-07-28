document.addEventListener('DOMContentLoaded', () => {
    const productListContainer = document.getElementById('product-list-container');
    const productModal = document.getElementById('productModal');
    const closeModalButton = document.querySelector('.modal .close-button');
    const quoteProductSelection = document.getElementById('productSelection');

    let allProductsData = [];

    async function fetchAndDisplayProducts() {
        if (!productListContainer) return;

        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error('Failed to fetch product data');
            const categories = await response.json();

            allProductsData = categories; // Store for modal
            productListContainer.innerHTML = ''; // Clear "Loading..."

            if (categories.length === 0) {
                 productListContainer.innerHTML = '<p class="no-results-message">No products are available at the moment.</p>';
                 return;
            }

            categories.forEach(category => {
                const categorySection = document.createElement('section');
                categorySection.classList.add('product-category-section');
                categorySection.id = category.categoryId;

                const categoryHeader = document.createElement('h2');
                categoryHeader.classList.add('category-title-on-page');
                categoryHeader.textContent = category.categoryName;
                categorySection.appendChild(categoryHeader);

                const productGrid = document.createElement('div');
                productGrid.classList.add('product-grid-for-category');
                
                category.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    
                    const productImage = product.image || 'images/product-placeholder.jpg';
                    
                    productCard.innerHTML = `
                        <img src="${productImage}" alt="${product.name}" loading="lazy">
                        <div class="product-card-content">
                            <h3>${product.name}</h3>
                            <p>${truncateText(product.details.application, 100)}</p>
                            <button class="cta-button view-details-btn" data-product-id="${product.id}">View Details</button>
                        </div>
                    `;
                    productGrid.appendChild(productCard);
                });
                categorySection.appendChild(productGrid);
                productListContainer.appendChild(categorySection);
            });

            // Add event listeners after cards are created
            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    openProductModalById(productId);
                });
            });

        } catch (error) {
            console.error("Error loading products page:", error);
            productListContainer.innerHTML = '<p class="error-message">Could not load products. Please try again later.</p>';
        }
    }

    function openProductModalById(productId) {
        let productToShow = null;
        for (const category of allProductsData) {
            const found = category.products.find(p => p.id === productId);
            if (found) {
                productToShow = found;
                break;
            }
        }

        if (productToShow) {
            openProductModal(productToShow);
        }
    }

    function openProductModal(product) {
        if (!productModal || !product || !product.details) return;
        document.getElementById('modalProductName').textContent = product.name;
        const detailsContainer = document.getElementById('modalProductDetails');
        detailsContainer.innerHTML = '';

        const modalProductImage = document.getElementById('modalProductImage');
        modalProductImage.src = product.image || 'images/product-placeholder.jpg';
        modalProductImage.alt = product.name;

        const detailOrder = [
            { key: 'application', label: 'Application' }, { key: 'keyFeatures', label: 'Key Features' },
            { key: 'keyFeaturesAndBenefits', label: 'Key Features & Benefits' }, { key: 'types', label: 'Types' },
            { key: 'typeAndSizeRange', label: 'Type and Size Range' }, { key: 'typesAndSize', label: 'Types and Size' },
            { key: 'sizeRange', label: 'Size Range' }, { key: 'sizeSpecifications', label: 'Size Specifications' },
            { key: 'packaging', label: 'Packaging' }, { key: 'advantages', label: 'Advantages' }
        ];
        detailOrder.forEach(item => {
            if (product.details[item.key]) {
                const detailSection = document.createElement('div');
                detailSection.classList.add('modal-detail-section');
                const labelElement = document.createElement('h4');
                labelElement.textContent = item.label + ':';
                detailSection.appendChild(labelElement);
                detailSection.innerHTML += formatDetailValue(product.details[item.key]);
                detailsContainer.appendChild(detailSection);
            }
        });
        
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() { if (!productModal) return; productModal.style.display = 'none'; document.body.style.overflow = 'auto'; }
    function formatDetailValue(value) { if (Array.isArray(value)) { if (value.length === 0) return '<p>N/A</p>'; return `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`; } return `<p>${value || 'N/A'}</p>`; }
    function truncateText(text, maxLength) { if (!text) return ''; return text.length > maxLength ? text.substring(0, maxLength) + '...' : text; }
    
    if (closeModalButton) closeModalButton.addEventListener('click', closeProductModal);
    if (productModal) window.addEventListener('click', (event) => { if (event.target === productModal) closeProductModal(); });
    document.addEventListener('keydown', function(event) { if (event.key === "Escape" && productModal && productModal.style.display === 'block') closeProductModal(); });

    // Populate quote dropdown if on a page that needs it
    async function populateQuoteDropdownIfNeeded() {
        if (!quoteProductSelection) return;
        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) return;
            const categories = await response.json();
            let allProducts = [];
            categories.forEach(category => {
                category.products.forEach(product => {
                    allProducts.push({ ...product, categoryName: category.categoryName });
                });
            });
            quoteProductSelection.innerHTML = '<option value="">-- Select a Product --</option>';
            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (${product.categoryName})`;
                quoteProductSelection.appendChild(option);
            });
        } catch (error) {
            console.error("Could not populate quote dropdown:", error);
        }
    }
    
    // Initial Calls
    fetchAndDisplayProducts();
    populateQuoteDropdownIfNeeded();
});