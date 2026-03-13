
// Custom Language Switcher Logic
document.addEventListener('DOMContentLoaded', () => {
    // Determine current language from cookie
    const currentLang = getCookie('googtrans') || '/en/en';
    const targetLang = currentLang.split('/').pop() || 'en';
    
    // Update Button UI
    updateLangUI(targetLang);

    // Toggle Dropdown
    const btn = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    
    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });

        // Language Selection
        const links = menu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }
});

function updateLangUI(lang) {
    const btn = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    
    if (!btn || !menu) return;

    // Reset Active Classes
    menu.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    
    const isFrench = lang === 'fr';
    const flag = isFrench ? '🇫🇷' : '🇺🇸';
    const code = isFrench ? 'FR' : 'EN';
    
    // Update Button Content
    btn.querySelector('.flag').textContent = flag;
    btn.querySelector('.code').textContent = code;
    
    // Set Active Link
    const activeLink = menu.querySelector(`[data-lang="${isFrench ? 'fr' : 'en'}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function setLanguage(lang) {
    // Google Translate uses the googtrans cookie: /SourceLang/TargetLang
    // We assume source is 'en'
    const cookieValue = `/en/${lang}`; 
    
    // Set cookie for root domain
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`; // fallback
    
    // Reload page to apply translation
    location.reload();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
