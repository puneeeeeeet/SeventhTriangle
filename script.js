document.addEventListener('DOMContentLoaded', () => {
    const loadProductsBtn = document.getElementById('loadProductsBtn');
    const productContainer = document.getElementById('productContainer');
    const loadingIndicator = document.getElementById('loading');
    const errorDisplay = document.getElementById('error');
    const sortBySelect = document.getElementById('sortBy');

    let allProducts = []; 

    const API_URL = 'https://interveiw-mock-api.vercel.app/api/getProducts';

    const toggleVisibility = (element, show) => {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    };

    const renderProducts = (productsToRender) => {
        productContainer.innerHTML = ''; 
        toggleVisibility(loadingIndicator, false);
        toggleVisibility(errorDisplay, false);

        console.log('>>> renderProducts: Input products array:', productsToRender); 

        if (!productsToRender || productsToRender.length === 0) {
            errorDisplay.textContent = 'No products found.';
            toggleVisibility(errorDisplay, true);
            console.warn('>>> renderProducts: No products to render or productsToRender is empty.');
            return;
        }

        productsToRender.forEach((product, index) => {
            console.log(`>>> renderProducts: Processing product at index ${index}:`, product); 

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.style.animationDelay = `${index * 0.1}s`; 

            const imageUrl = (product.image && product.image.src) ? product.image.src : 'https://via.placeholder.com/200x200?text=No+Image'; 
            const title = product.title || 'Untitled Snowboard';
            const description = product.description || 'No description available.';

            let displayPrice = 'N/A';
            if (product.price !== undefined && product.price !== null) {
                const numericPrice = parseFloat(product.price);
                if (!isNaN(numericPrice)) {
                    displayPrice = numericPrice.toFixed(2);
                } else {
                    console.warn(`>>> renderProducts: Price for "${title}" is not a valid number:`, product.price);
                }
            } else {
                console.warn(`>>> renderProducts: Price for "${title}" is undefined or null.`);
            }

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <div class="product-info">
                    <h3 class="product-name">${title}</h3>
                    <p class="product-price">$${displayPrice}</p>
                    <p class="product-description">${description}</p>
                </div>
            `;
            productContainer.appendChild(productCard);
        });
    };

    const fetchProducts = async () => {
        toggleVisibility(productContainer, false);
        toggleVisibility(loadingIndicator, true);
        toggleVisibility(errorDisplay, false);
        productContainer.innerHTML = '';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiResponse = await response.json();

            console.log('>>> fetchProducts: Raw API Response:', apiResponse); 
            if (!apiResponse || !Array.isArray(apiResponse.data)) {
                throw new Error("API response 'data' property is missing or not an array.");
            }

            allProducts = apiResponse.data.map(item => {
                const productData = item.product;

                if (!productData) {
                    console.warn('>>> fetchProducts: Skipping an item because its "product" object is missing:', item);
                    return null; 
                }

                const priceValue = (productData.variants && productData.variants.length > 0 && productData.variants[0].price)
                                  ? parseFloat(productData.variants[0].price)
                                  : undefined; 

                const imageUrl = (productData.image && productData.image.src)
                                 ? productData.image.src
                                 : '';

                const descriptionText = productData.body_html || '';

                return {
                    id: productData.id,
                    title: productData.title,
                    description: descriptionText,
                    image: { src: imageUrl },
                    price: priceValue, 
                    vendor: productData.vendor,
                    tags: productData.tags
                };
            }).filter(Boolean); 

            console.log('>>> fetchProducts: Processed Products (allProducts array):', allProducts); 

            renderProducts(allProducts);
            toggleVisibility(productContainer, true); 
        } catch (error) {
            console.error('>>> fetchProducts: Error fetching or processing products:', error); 
            errorDisplay.textContent = `Failed to load products: ${error.message}. Please try again later.`;
            toggleVisibility(errorDisplay, true);
            toggleVisibility(loadingIndicator, false);
        }
    };

    const sortProducts = () => {
        let sortedProducts = [...allProducts]; 

        const sortBy = sortBySelect.value;

        if (sortBy === 'priceAsc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'priceDesc') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        renderProducts(sortedProducts);
    };
    loadProductsBtn.addEventListener('click', fetchProducts);
    sortBySelect.addEventListener('change', sortProducts);

});