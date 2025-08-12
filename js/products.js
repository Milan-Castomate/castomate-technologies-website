document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const productListContainer = document.getElementById('product-list-container');
    const allCategoryBtnContainer = document.getElementById('all-category-btn-container');
    const otherCategoriesContainer = document.getElementById('other-categories-container');
    const productSearchInput = document.getElementById('product-search');
    const searchBtn = document.getElementById('search-btn');
    const productModal = document.getElementById('productModal');
    const closeModalButton = document.querySelector('.modal .close-button');
    const quoteProductSelection = document.getElementById('productSelection');

    // Data Storage
    let allCategoriesData = [];
    let allProductsFlat = [];
    let currentFilterCategoryId = 'all';

    /**
     * Fetches product data from JSON and triggers UI setup.
     */
    async function fetchProducts() {
        try {
            // CORRECTED: Removed leading slash for better compatibility
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCategoriesData = await response.json();
            
            allProductsFlat = [];
            allCategoriesData.forEach(category => {
                category.products.forEach(product => {
                    allProductsFlat.push({ ...product, categoryId: category.categoryId, categoryName: category.categoryName });
                });
            });

            if (allCategoryBtnContainer && otherCategoriesContainer) {
                populateCategoryTabs(allCategoriesData);
                handleUrlHash();
            }

            if (quoteProductSelection) {
                populateQuoteProductDropdown(allProductsFlat);
            }

        } catch (error) {
            console.error("Could not fetch products:", error);
            if (productListContainer) {
                productListContainer.innerHTML = '<p class="error-message">Failed to load products. Please check browser console for errors and verify data/products.json.</p>';
            }
        }
    }
    
    /**
     * Checks for a hash in the URL and takes appropriate action on page load or hash change.
     */
    function handleUrlHash() {
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            const categoryTabToActivate = document.querySelector(`.tab-button[data-category-id="${hash}"]`);
            if (categoryTabToActivate) {
                categoryTabToActivate.click();
                setTimeout(() => {
                    const categoryTitleElement = document.getElementById(hash);
                    if (categoryTitleElement) {
                        categoryTitleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 500);
                return;
            }

            const productToOpen = allProductsFlat.find(p => p.id === hash);
            if (productToOpen) {
                filterAndSearchProducts(); 
                setTimeout(() => { openProductModal(productToOpen); }, 300);
                return;
            }
      
