document.addEventListener('DOMContentLoaded', () => {
    // Sample properties (initial data)
    const sampleProperties = [
        {
            title: 'Luxury Apartment',
            location: 'Dubai',
            price: 200000,
            type: 'apartment',
            beds: 2,
            baths: 2,
            sqft: 1200,
            image: 'https://via.placeholder.com/300x200?text=Property+1'
        },
        {
            title: 'Spacious Villa',
            location: 'Cairo',
            price: 500000,
            type: 'villa',
            beds: 4,
            baths: 3,
            sqft: 2500,
            image: 'https://via.placeholder.com/300x200?text=Property+2'
        }
    ];

    // Load data from localStorage or initialize
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let properties = JSON.parse(localStorage.getItem('properties')) || sampleProperties;
    let currentUser = localStorage.getItem('currentUser');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const authLink = document.getElementById('authLink');
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    const authTitle = document.getElementById('authTitle');
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    const authMessage = document.getElementById('authMessage');
    const listPropertyBtn = document.getElementById('listPropertyBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadAlert = document.getElementById('uploadAlert');
    const dashboardAlert = document.getElementById('dashboardAlert');
    const userListings = document.getElementById('userListings');
    const favoritesList = document.getElementById('favoritesList');

    let isLogin = true;

    // Update UI based on login status
    function updateAuthUI() {
        if (currentUser) {
            authLink.textContent = 'Logout';
            authLink.removeAttribute('data-bs-toggle');
            authLink.removeAttribute('data-bs-target');
            authLink.addEventListener('click', logout);
            uploadAlert.classList.add('d-none');
            dashboardAlert.classList.add('d-none');
        } else {
            authLink.textContent = 'Login/Register';
            authLink.setAttribute('data-bs-toggle', 'modal');
            authLink.setAttribute('data-bs-target', '#authModal');
            authLink.removeEventListener('click', logout);
            uploadAlert.classList.remove('d-none');
            dashboardAlert.classList.remove('d-none');
        }
        renderProperties();
        renderFavorites();
        renderUserListings();
    }

    // Logout
    function logout(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateAuthUI();
    }

    // Toggle between login/register
    toggleAuth.addEventListener('click', () => {
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Login' : 'Register';
        authForm.querySelector('button[type="submit"]').textContent = isLogin ? 'Login' : 'Register';
        toggleAuth.textContent = isLogin ? 'Switch to Register' : 'Switch to Login';
        authMessage.textContent = '';
    });

    // Auth form submit
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', email);
                currentUser = email;
                authMessage.textContent = 'Login successful!';
                setTimeout(() => authModal.hide(), 1000);
                updateAuthUI();
            } else {
                authMessage.textContent = 'Invalid credentials.';
            }
        } else {
            if (users.find(u => u.email === email)) {
                authMessage.textContent = 'Email already registered.';
            } else {
                users.push({ email, password });
                localStorage.setItem('users', JSON.stringify(users));
                authMessage.textContent = 'Registration successful! Please login.';
                isLogin = true;
                authTitle.textContent = 'Login';
                authForm.querySelector('button[type="submit"]').textContent = 'Login';
                toggleAuth.textContent = 'Switch to Register';
            }
        }
    });

    // List Property Button
    listPropertyBtn.addEventListener('click', () => {
        if (!currentUser) {
            authModal.show();
        } else {
            window.location.hash = '#upload';
        }
    });

    // Upload Form Submit
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const newProperty = {
            title: document.getElementById('title').value,
            location: document.getElementById('locationUpload').value,
            price: parseInt(document.getElementById('price').value),
            type: document.getElementById('typeUpload').value,
            beds: parseInt(document.getElementById('beds').value),
            baths: parseInt(document.getElementById('baths').value),
            sqft: parseInt(document.getElementById('sqft').value),
            description: document.getElementById('description').value,
            image: document.getElementById('imageUrl').value || 'https://via.placeholder.com/300x200?text=New+Property',
            owner: currentUser
        };

        properties.push(newProperty);
        localStorage.setItem('properties', JSON.stringify(properties));
        uploadForm.reset();
        alert('Property uploaded successfully!');
        renderProperties();
        renderUserListings();
    });

    // Render Properties
    function renderProperties(filter = {}) {
        const propertyList = document.getElementById('propertyList');
        propertyList.innerHTML = '';

        const filteredProperties = properties.filter(prop => {
            return (
                (!filter.location || prop.location.toLowerCase().includes(filter.location.toLowerCase())) &&
                (!filter.type || prop.type === filter.type) &&
                (!filter.minPrice || prop.price >= filter.minPrice) &&
                (!filter.maxPrice || prop.price <= filter.maxPrice)
            );
        });

        filteredProperties.forEach((prop, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `
                <div class="card property-card" data-index="${index}" data-type="${prop.type}" data-price="${prop.price}" data-location="${prop.location}">
                    <img src="${prop.image}" class="card-img-top" alt="${prop.title}">
                    <div class="card-body">
                        <h5 class="card-title">${prop.title}</h5>
                        <p class="card-text">${prop.location} - $${prop.price.toLocaleString()}</p>
                        <p>${prop.beds} Beds, ${prop.baths} Baths, ${prop.sqft} sq ft</p>
                        <button class="btn btn-outline-amber favorite-btn"><i class="far fa-heart"></i> Favorite</button>
                    </div>
                </div>
            `;
            propertyList.appendChild(col);
        });

        // Add favorite listeners
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const index = btn.closest('.property-card').dataset.index;
            if (favorites.includes(index)) btn.classList.add('active');
            btn.addEventListener('click', () => toggleFavorite(index, btn));
        });
    }

    // Toggle Favorite
    function toggleFavorite(index, btn) {
        const idx = favorites.indexOf(index);
        if (idx > -1) {
            favorites.splice(idx, 1);
            btn.classList.remove('active');
        } else {
            favorites.push(index);
            btn.classList.add('active');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }

    // Render Favorites
    function renderFavorites() {
        favoritesList.innerHTML = '';
        favorites.forEach(idx => {
            if (properties[idx]) {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = properties[idx].title;
                favoritesList.appendChild(li);
            }
        });
    }

    // Render User Listings in Dashboard
    function renderUserListings() {
        userListings.innerHTML = '';
        if (!currentUser) return;

        const userProps = properties.filter(prop => prop.owner === currentUser);
        userProps.forEach(prop => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            col.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5>${prop.title}</h5>
                        <p>${prop.location} - $${prop.price.toLocaleString()}</p>
                    </div>
                </div>
            `;
            userListings.appendChild(col);
        });
    }

    // Search Form
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const filter = {
            location: document.getElementById('location').value,
            type: document.getElementById('type').value,
            minPrice: parseInt(document.getElementById('minPrice').value) || 0,
            maxPrice: parseInt(document.getElementById('maxPrice').value) || Infinity
        };
        renderProperties(filter);
    });

    // Valuation
    const valuationForm = document.getElementById('valuationForm');
    valuationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const area = parseInt(document.getElementById('valArea').value) || 0;
        const typeMultiplier = parseFloat(document.getElementById('valType').value);
        const basePricePerSqFt = 100; // Mock
        const estimatedValue = area * basePricePerSqFt * typeMultiplier;
        document.getElementById('valuationResult').textContent = `Estimated Value: $${estimatedValue.toLocaleString()}`;
    });

    // Initial render
    updateAuthUI();
});
