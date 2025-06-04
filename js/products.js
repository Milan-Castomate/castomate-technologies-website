document.addEventListener('DOMContentLoaded', () => {
    const productListContainer = document.getElementById('product-list-container');
    const categoryTabsContainer = document.getElementById('category-tabs-container'); // New tab container
    const productSearchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    const productModal = document.getElementById('productModal');
    const closeModalButton = document.querySelector('.modal .close-button');
    const quoteProductSelection = document.getElementById('productSelection'); // For quote page

    let allCategoriesData = [];
    let allProductsFlat = [];
    let currentFilterCategoryId = 'all'; // To keep track of the active category

    async function fetchProducts() {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allCategoriesData = await response.json();
            
            allProductsFlat = [];
            allCategoriesData.forEach(category => {
                category.products.forEach(product => {
                    allProductsFlat.push({ ...product, categoryId: category.categoryId, categoryName: category.categoryName });
                });
            });

            populateCategoryTabs(allCategoriesData); // New function to create tabs
            filterAndSearchProducts(); // Initial display based on "All Categories" and any search term

            if (quoteProductSelection) {
                populateQuoteProductDropdown(allProductsFlat);
            }

        } catch (error) {
            console.error("Could not fetch products:", error);
            if (productListContainer) productListContainer.innerHTML = '<p class="error-message">Failed to load products. Please check console for errors and verify data/products.json.</p>';
        }
    }

    function populateCategoryTabs(categories) {
        if (!categoryTabsContainer) return;
        categoryTabsContainer.innerHTML = ''; // Clear any existing tabs

        // Create "All Categories" Tab
        const allTab = document.createElement('button');
        allTab.classList.add('tab-button', 'active-tab'); // Active by default
        allTab.textContent = 'All Categories';
        allTab.dataset.categoryId = 'all';
        allTab.addEventListener('click', handleTabClick);
        categoryTabsContainer.appendChild(allTab);

        // Create tabs for each category
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

        // Update active tab style
        document.querySelectorAll('.category-tabs .tab-button').forEach(button => {
            button.classList.remove('active-tab');
        });
        event.target.classList.add('active-tab');

        filterAndSearchProducts();
    }

    function displayProductsByCategory(categoriesToDisplay) {
        // (This function remains the same as the one I provided in the previous "recreate products page" step)
        // It iterates through categories and their products, creating .product-category-section, .category-title-on-page, 
        // .product-grid-for-category, and .product-card elements.
        if (!productListContainer) return;
        productListContainer.innerHTML = ''; 

        if (categoriesToDisplay.length === 0 || categoriesToDisplay.every(cat => cat.products.length === 0 && currentFilterCategoryId !== 'all')) {
             // If specific category selected and no products, or if search yields no results in any category
            productListContainer.innerHTML = '<p class="no-results-message">No products found matching your criteria.</p>';
            return;
        }
         if (categoriesToDisplay.length === 0 && currentFilterCategoryId === 'all' && productSearchInput.value.trim() !== '') {
            // If "All Categories" is active but search yields no results
            productListContainer.innerHTML = '<p class="no-results-message">No products found matching your search criteria.</p>';
            return;
        }


        categoriesToDisplay.forEach(category => {
            if(category.products.length === 0) return; // Skip rendering category if it has no products (after search filter)

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
                const productImage = product.image || 'images/product-placeholder.jpg';
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
    
    function truncateText(text, maxLength) {
        // (This function remains the same)
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatDetailValue(value) {
        // (This function remains the same)
        if (Array.isArray(value)) {
            if (value.length === 0) return '<p>N/A</p>';
            return `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        return `<p>${value || 'N/A'}</p>`;
    }

    function openProductModal(product) {
        // (This function remains the same as the one I provided in the previous "recreate products page" step)
        // It populates the modal with product details based on the detailOrder array.
        if (!productModal || !product || !product.details) return;
        document.getElementById('modalProductName').textContent = product.name;
        const detailsContainer = document.getElementById('modalProductDetails');
        detailsContainer.innerHTML = '';
        const modalProductImage = product.image || 'images/product-placeholder.jpg';
        document.getElementById('modalImage').src = modalProductImage;
        document.getElementById('modalImage').alt = product.name;
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
        for (const key in product.details) {
            if (!detailOrder.some(item => item.key === key)) {
                const detailSection = document.createElement('div');
                detailSection.classList.add('modal-detail-section');
                const labelElement = document.createElement('h4');
                labelElement.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) + ':';
                detailSection.appendChild(labelElement);
                detailSection.innerHTML += formatDetailValue(product.details[key]);
                detailsContainer.appendChild(detailSection);
            }
        }
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        // (This function remains the same)
        if (!productModal) return;
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event listeners for modal close remain the same
    if (closeModalButton) closeModalButton.addEventListener('click', closeProductModal);
    if (productModal) window.addEventListener('click', (event) => {
        if (event.target === productModal) closeProductModal();
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && productModal && productModal.style.display === 'block') {
            closeProductModal();
        }
    });

    function filterAndSearchProducts() {
    const searchTerm = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
    // currentFilterCategoryId is a global variable, updated when tabs are clicked

    let categoriesToDisplay;
    let operationType = 'filter'; // Can be 'filter' or 'search'

    if (searchTerm) {
        operationType = 'search';
        // If there's a search term, search across ALL products
        const searchedProducts = allProductsFlat.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            (product.details.application && product.details.application.toLowerCase().includes(searchTerm)) ||
            (product.details.keyFeatures && Array.isArray(product.details.keyFeatures) && product.details.keyFeatures.some(kf => kf.toLowerCase().includes(searchTerm))) ||
            (product.details.keyFeaturesAndBenefits && Array.isArray(product.details.keyFeaturesAndBenefits) && product.details.keyFeaturesAndBenefits.some(kf => kf.toLowerCase().includes(searchTerm)))
            // You can add more fields from product.details to search within if desired
        );

        if (searchedProducts.length === 0) {
            productListContainer.innerHTML = '<p class="no-results-message">No products found matching your search criteria: "' + productSearchInput.value + '"</p>';
            return; // Stop further processing, show no results
        }

        // Group the searched products by their original categories for display
        const groupedBySearch = {};
        searchedProducts.forEach(product => {
            if (!groupedBySearch[product.categoryId]) {
                // Find the original category data to get the full categoryName
                const originalCategory = allCategoriesData.find(cat => cat.categoryId === product.categoryId);
                groupedBySearch[product.categoryId] = {
                    categoryId: product.categoryId,
                    categoryName: originalCategory ? originalCategory.categoryName : 'Search Results', // Fallback category name
                    products: []
                };
            }
            groupedBySearch[product.categoryId].products.push(product);
        });
        categoriesToDisplay = Object.values(groupedBySearch);

        // When searching, you might want to visually indicate that category tabs are less relevant
        // For now, the active tab remains, but results are global.
        // Alternatively, you could visually reset tabs:
        // document.querySelectorAll('.category-tabs .tab-button').forEach(button => button.classList.remove('active-tab'));
        // const allTab = document.querySelector('.category-tabs .tab-button[data-category-id="all"]');
        // if (allTab) allTab.classList.add('active-tab');
        // currentFilterCategoryId = 'all'; // And update the state variable

    } else {
        // No search term, so filter by the currently selected category tab
        operationType = 'filter';
        if (currentFilterCategoryId === 'all') {
            categoriesToDisplay = allCategoriesData;
        } else {
            // Ensure we only select categories that actually exist
            const selectedCat = allCategoriesData.find(category => category.categoryId === currentFilterCategoryId);
            categoriesToDisplay = selectedCat ? [selectedCat] : []; // Wrap in array for displayProductsByCategory
        }
    }

    // Check if, after filtering/searching, there are any products to display
    const hasProductsToDisplay = categoriesToDisplay.some(category => category.products && category.products.length > 0);

    if (!hasProductsToDisplay) {
        if (operationType === 'search') {
             productListContainer.innerHTML = '<p class="no-results-message">No products found matching your search criteria: "' + productSearchInput.value + '"</p>';
        } else if (currentFilterCategoryId !== 'all') {
             productListContainer.innerHTML = '<p class="no-results-message">No products currently listed in this category.</p>';
        } else {
             // This case (All categories, no search, no products) implies empty dataset
             productListContainer.innerHTML = '<p class="no-results-message">No products available at the moment.</p>';
        }
    } else {
        displayProductsByCategory(categoriesToDisplay);
    }
}

    // Event listeners for search
    if (productSearchInput) productSearchInput.addEventListener('input', filterAndSearchProducts);
    if (searchBtn) searchBtn.addEventListener('click', filterAndSearchProducts);

    function populateQuoteProductDropdown(products) {
        // (This function remains the same)
        if (!quoteProductSelection) return;
        quoteProductSelection.innerHTML = '<option value="">-- Select a Product --</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.categoryName.split('. ')[1]})`;
            quoteProductSelection.appendChild(option);
        });
    }

    fetchProducts(); // Initial fetch and display
});