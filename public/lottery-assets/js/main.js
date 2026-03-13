document.addEventListener('DOMContentLoaded', () => {
    // Modal Selectors
    const walletBtn = document.getElementById('wallet-connect-btn');
    const walletModal = document.getElementById('wallet-modal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Profile Popup Selectors
    const profileTrigger = document.getElementById('profile-trigger');
    const profilePopup = document.getElementById('profile-popup');
    const closePopup = document.querySelector('.close-popup');
 
    // Mobile Menu Selectors
    const burgerMenu = document.createElement('button');
    burgerMenu.className = 'burger-menu';
    burgerMenu.innerHTML = '<span></span><span></span><span></span>';
    
    const navContainer = document.querySelector('.nav-container');
    const nav = document.querySelector('.nav');
    
    if (navContainer && nav) {
        navContainer.insertBefore(burgerMenu, document.querySelector('.header-actions'));
        
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link click
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Toggle Wallet Modal
    walletBtn.addEventListener('click', () => {
        walletModal.style.display = 'flex';
    });

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            walletModal.style.display = 'none';
        });
    });

    // --- COUNTDOWN LOGIC ---
    function updateCountdowns() {
        const now = new Date().getTime();
        const countdowns = document.querySelectorAll('[data-date-end]');

        countdowns.forEach(container => {
            const endDateString = container.getAttribute('data-date-end');
            const endDate = new Date(endDateString).getTime();
            const distance = endDate - now;

            // Elements within the container (supports both index and lottery page structures)
            const dVal = container.querySelector('.val, .v');
            const hVal = container.querySelectorAll('.val, .v')[1];
            const mVal = container.querySelectorAll('.val, .v')[2];
            const sVal = container.querySelectorAll('.val, .v')[3];

            if (distance < 0) {
                if (dVal) dVal.innerText = "00";
                if (hVal) hVal.innerText = "00";
                if (mVal) mVal.innerText = "00";
                if (sVal) sVal.innerText = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (dVal) dVal.innerText = days.toString().padStart(2, '0');
            if (hVal) hVal.innerText = hours.toString().padStart(2, '0');
            if (mVal) mVal.innerText = minutes.toString().padStart(2, '0');
            if (sVal) sVal.innerText = seconds.toString().padStart(2, '0');
        });
    }

    // Run every second
    setInterval(updateCountdowns, 1000);
    updateCountdowns(); // Initial call

    // Wallet Connection Simulation
    const walletOptions = document.querySelectorAll('.wallet-option');
    walletOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const walletName = option.querySelector('strong').innerText;

            // UI Feedback: Start Connecting
            option.classList.add('connecting');
            const originalText = option.querySelector('span').innerText;
            option.querySelector('span').innerText = 'Connecting to ' + walletName + '...';

            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Successful Connection Simulation
            option.classList.remove('connecting');
            option.querySelector('span').innerText = originalText;
            walletModal.style.display = 'none';

            // Update Header Button
            walletBtn.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Connected: 0x...7b29</span>
            `;
            walletBtn.style.background = 'linear-gradient(135deg, #059669, #047857)'; // Green for connected

            // Show Toast or Alert
            alert(walletName + ' connected successfully!');
        });
    });

    // Toggle Profile Popup
    if (profileTrigger && profilePopup) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profilePopup.style.display = profilePopup.style.display === 'block' ? 'none' : 'block';
        });

        if (closePopup) {
            closePopup.addEventListener('click', () => {
                profilePopup.style.display = 'none';
            });
        }

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!profilePopup.contains(e.target) && !profileTrigger.contains(e.target)) {
                profilePopup.style.display = 'none';
            }
        });
    }

    // Close on click outside for wallet modal
    window.addEventListener('click', (e) => {
        if (e.target === walletModal) walletModal.style.display = 'none';
    });

    // Initialize Animations
    if (document.querySelector('.hero')) {
        createConfetti();
    }

    // Slider Logic
    const slider = document.getElementById('lottery-cards');
    const prevBtn = document.getElementById('slide-prev');
    const nextBtn = document.getElementById('slide-next');

    if (slider && prevBtn && nextBtn) {
        const scrollAmount = 412; // Card width (380) + Gap (32)

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // Optional: Auto-slide every 5 seconds
        let autoSlide = setInterval(() => {
            if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 5000);

        // Stop auto-slide on interaction
        slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    }
});

// Room Logic Simulator
function createRoom(bet, minPlayers) {
    if (bet < 1) return { error: "Mise minimum 1$" };
    // Simulate API call
    console.log(`Room created with bet: ${bet}$ and min players: ${minPlayers}`);
}

function createConfetti() {
    const container = document.body;

    // Interval to create confetti continuously
    setInterval(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random properties
        const width = Math.random() * 6 + 4;
        const height = Math.random() * 10 + 6;
        const color = ['#DAA520', '#C5A059', '#EEDC82', '#FFD700', '#F9D976'][Math.floor(Math.random() * 5)];

        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.width = width + 'px';
        confetti.style.height = height + 'px';
        confetti.style.backgroundColor = color;
        confetti.style.animationDuration = (Math.random() * 3 + 4) + 's';
        confetti.style.opacity = Math.random() * 0.5 + 0.5;

        container.appendChild(confetti);

        // Remove after animation finishes
        setTimeout(() => confetti.remove(), 7000);
    }, 200);
}
