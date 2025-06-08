document.addEventListener('DOMContentLoaded', () => {
    const productListContainer = document.getElementById('product-list-container');
    const categoryTabsContainer = document.getElementById('category-tabs-container');
    const productSearchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    const productModal = document.getElementById('productModal');
    const closeModalButton = document.querySelector('.modal .close-button');
    const quoteProductSelection = document.getElementById('productSelection');

    let allCategoriesData = [];
    let allProductsFlat = [];
    let currentFilterCategoryId = 'all';

    async function fetchProducts() {
        try {
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCategoriesData = await response.json();
            
            allProductsFlat = [];
            allCategoriesData.forEach(category => {
                category.products.forEach(product => {
                    allProductsFlat.push({ ...product, categoryId: category.categoryId, categoryName: category.categoryName });
                });
            });

            if(categoryTabsContainer) {
                populateCategoryTabs(allCategoriesData);
                filterAndSearchProducts();
                handleUrlHash(); // Logic to handle opening modal from URL hash
            }

            if (quoteProductSelection) {
                populateQuoteProductDropdown(allProductsFlat);
            }

        } catch (error) {
            console.error("Could not fetch products:", error);
            if (productListContainer) productListContainer.innerHTML = '<p class="error-message">Failed to load products. Please check console for errors and verify data/products.json.</p>';
        }
    }
    
    function handleUrlHash() {
        if (window.location.hash) {
            const productId = window.location.hash.substring(1);
            const product = allProductsFlat.find(p => p.id === productId);
            if (product) {
                setTimeout(() => {
                    openProductModal(product);
                }, 300);
            }
        }
    }
    
    function populateCategoryTabs(categories) {
        if (!categoryTabsContainer) return;
        categoryTabsContainer.innerHTML = '';
        const allTab = document.createElement('button');
        allTab.classList.add('tab-button', 'active-tab');
        allTab.textContent = 'All Categories';
        allTab.dataset.categoryId = 'all';
        allTab.addEventListener('click', handleTabClick);
        categoryTabsContainer.appendChild(allTab);
        categories.forEach(category => {
            const tab = document.createElement('button');
            tab.classList.add('tab-button');
            tab.textContent = category.categoryName;
            tab.dataset.categoryId = category.categoryId;
            tab.addEventListener('click', handleTabClick);
            categoryTabsContainer.appendChild(tab);
        });
    }

    function handleTabClick(event) {
        currentFilterCategoryId = event.target.dataset.categoryId;
        document.querySelectorAll('.category-tabs .tab-button').forEach(button => button.classList.remove('active-tab'));
        event.target.classList.add('active-tab');
        filterAndSearchProducts();
    }

    function displayProductsByCategory(categoriesToDisplay) {
        if (!productListContainer) return;
        productListContainer.innerHTML = '';
        categoriesToDisplay.forEach(category => {
            if(!category.products || category.products.length === 0) return;
            const categorySection = document.createElement('section');
            categorySection.classList.add('product-category-section');
            categorySection.setAttribute('id', category.categoryId);
            const categoryHeader = document.createElement('h2');
            categoryHeader.classList.add('category-title-on-page');
            categoryHeader.textContent = category.categoryName;
            categorySection.appendChild(categoryHeader);
            const productGrid = document.createElement('div');
            productGrid.classList.add('product-grid-for-category');
            category.products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.setAttribute('id', product.id);
                const productImage = (product.images && product.images.length > 0) ? product.images[0] : 'images/product-placeholder.jpg';
                productCard.innerHTML = `
                    <img src="${productImage}" alt="${product.name}" loading="lazy">
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p>${truncateText(product.details.application, 100)}</p> 
                        <button class="cta-button view-details-btn" data-product-id="${product.id}" data-category-id="${category.categoryId}">View Details</button>
                    </div>
                `;
                productGrid.appendChild(productCard);
            });
            categorySection.appendChild(productGrid);
            productListContainer.appendChild(categorySection);
        });
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const categoryId = event.target.dataset.categoryId;
                const category = allCategoriesData.find(cat => cat.categoryId === categoryId);
                if (category) {
                    const product = category.products.find(p => p.id === productId);
                    if (product) openProductModal(product);
                }
            });
        });
    }

    function openProductModal(product) {
        if (!productModal || !product || !product.details) return;
        document.getElementById('modalProductName').textContent = product.name;
        const detailsContainer = document.getElementById('modalProductDetails');
        detailsContainer.innerHTML = '';
        const mainImage = document.getElementById('modalMainImage');
        const thumbnailsContainer = document.getElementById('modalThumbnails');
        thumbnailsContainer.innerHTML = '';
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
            product.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.alt = `${product.name} thumbnail ${index + 1}`;
                thumb.classList.add('thumbnail-img');
                if (index === 0) { thumb.classList.add('active'); }
                thumb.addEventListener('click', () => { mainImage.src = imgSrc; thumbnailsContainer.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active')); thumb.classList.add('active'); });
                thumbnailsContainer.appendChild(thumb);
            });
        } else { mainImage.src = 'images/product-placeholder.jpg'; mainImage.alt = 'No image available'; }
        const detailOrder = [{ key: 'application', label: 'Application' }, { key: 'keyFeatures', label: 'Key Features' }, { key: 'keyFeaturesAndBenefits', label: 'Key Features & Benefits' }, { key: 'types', label: 'Types' }, { key: 'typeAndSizeRange', label: 'Type and Size Range' }, { key: 'typesAndSize', label: 'Types and Size' }, { key: 'sizeRange', label: 'Size Range' }, { key: 'sizeSpecifications', label: 'Size Specifications' }, { key: 'packaging', label: 'Packaging' }, { key: 'advantages', label: 'Advantages' }];
        detailOrder.forEach(item => { if (product.details[item.key]) { const detailSection = document.createElement('div'); detailSection.classList.add('modal-detail-section'); const labelElement = document.createElement('h4'); labelElement.textContent = item.label + ':'; detailSection.appendChild(labelElement); detailSection.innerHTML += formatDetailValue(product.details[item.key]); detailsContainer.appendChild(detailSection); } });
        for (const key in product.details) { if (!detailOrder.some(item => item.key === key)) { const detailSection = document.createElement('div'); detailSection.classList.add('modal-detail-section'); const labelElement = document.createElement('h4'); labelElement.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ':'; detailSection.appendChild(labelElement); detailSection.innerHTML += formatDetailValue(product.details[key]); detailsContainer.appendChild(detailSection); } }
        productModal.style.display = 'block'; document.body.style.overflow = 'hidden';
    }
    
    // (Truncated rest of the file which is identical to the one I just provided in the last step for brevity, as it contains no changes from that version)
    function truncateText(text, maxLength) { if (!text) return ''; return text.length > maxLength ? text.substring(0, maxLength) + '...' : text; }
    function formatDetailValue(value) { if (Array.isArray(value)) { if (value.length === 0) return '<p>N/A</p>'; return `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`; } return `<p>${value || 'N/A'}</p>`; }
    function closeProductModal() { if (!productModal) return; productModal.style.display = 'none'; document.body.style.overflow = 'auto'; }
    if (closeModalButton) closeModalButton.addEventListener('click', closeProductModal);
    if (productModal) window.addEventListener('click', (event) => { if (event.target === productModal) closeProductModal(); });
    document.addEventListener('keydown', function(event) { if (event.key === "Escape" && productModal && productModal.style.display === 'block') closeProductModal(); });
    function filterAndSearchProducts() {
        const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
        let categoriesToDisplay; let operationType = 'filter';
        if (searchTerm) {
            operationType = 'search';
            const searchedProducts = allProductsFlat.filter(product => product.name.toLowerCase().includes(searchTerm) || (product.details.application && product.details.application.toLowerCase().includes(searchTerm)));
            if (searchedProducts.length === 0) { productListContainer.innerHTML = `<p class="no-results-message">No products found matching: "${productSearchInput.value}"</p>`; return; }
            const groupedBySearch = {};
            searchedProducts.forEach(product => { if (!groupedBySearch[product.categoryId]) { const originalCategory = allCategoriesData.find(cat => cat.categoryId === product.categoryId); groupedBySearch[product.categoryId] = { categoryId: product.categoryId, categoryName: originalCategory ? originalCategory.categoryName : 'Search Results', products: [] }; } groupedBySearch[product.categoryId].products.push(product); });
            categoriesToDisplay = Object.values(groupedBySearch);
        } else {
            operationType = 'filter';
            if (currentFilterCategoryId === 'all') { categoriesToDisplay = allCategoriesData; } else { const selectedCat = allCategoriesData.find(category => category.categoryId === currentFilterCategoryId); categoriesToDisplay = selectedCat ? [selectedCat] : []; }
        }
        const hasProductsToDisplay = categoriesToDisplay && categoriesToDisplay.some(category => category.products && category.products.length > 0);
        if (!hasProductsToDisplay) { if (operationType === 'search') { productListContainer.innerHTML = `<p class="no-results-message">No products found matching: "${productSearchInput.value}"</p>`; } else if (currentFilterCategoryId !== 'all') { productListContainer.innerHTML = `<p class="no-results-message">No products currently listed in this category.</p>`; } else { productListContainer.innerHTML = `<p class="no-results-message">No products available at the moment.</p>`; } } else { displayProductsByCategory(categoriesToDisplay); }
    }
    if (productSearchInput) productSearchInput.addEventListener('input', filterAndSearchProducts);
    if (searchBtn) searchBtn.addEventListener('click', filterAndSearchProducts);
    function populateQuoteProductDropdown(products) { if (!quoteProductSelection) return; quoteProductSelection.innerHTML = '<option value="">-- Select a Product --</option>'; products.forEach(product => { const option = document.createElement('option'); option.value = product.id; option.textContent = `${product.name} (${product.categoryName})`; quoteProductSelection.appendChild(option); }); }
    
    fetchProducts();
});