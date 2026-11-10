import os
import re

# Saari HTML files ki list
files = [f for f in os.listdir('.') if f.endswith('.html')]

# Master Header
header_html = '''<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo">
      <span class="logo-icon">🐼</span>
      <span>SitPanda</span>
    </a>
    <nav class="header-nav">
      <a href="/#finance">Finance</a>
      <a href="/#health">Health</a>
      <a href="/#math">Math</a>
      <a href="/#everyday">Everyday</a>
      <a href="/blog/" class="nav-blog">Blog</a>
    </nav>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">🌙</button>
  </div>
</header>'''

# Master Footer
footer_html = '''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo"><span class="logo-icon">🐼</span><span>SitPanda</span></a>
        <p>Free, fast, and accurate online calculators for finance, health, and everyday life.</p>
      </div>
      <div class="footer-col">
        <h5>Finance</h5>
        <ul>
          <li><a href="/mortgage-calculator.html">Mortgage</a></li>
          <li><a href="/loan-calculator.html">Loan</a></li>
          <li><a href="/compound-interest-calculator.html">Compound Interest</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Health</h5>
        <ul>
          <li><a href="/bmi-calculator.html">BMI</a></li>
          <li><a href="/calorie-calculator.html">Calorie</a></li>
          <li><a href="/bmr-calculator.html">BMR</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <ul>
          <li><a href="/about.html">About</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/privacy.html">Privacy</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 SitPanda. All rights reserved.</span>
      <span>Calculators are for informational purposes only.</span>
    </div>
  </div>
</footer>'''

# Master CSS (Forcefully override everything to match homepage)
css_override = '''
<style id="master-standardization">
  /* Force Font and Colors Globally */
  :root {
    --brand: #0F766E !important;
    --brand-hover: #0D9488 !important;
    --bg: #F8FAFC !important;
    --bg-elevated: #FFFFFF !important;
    --card: #FFFFFF !important;
    --ink: #0F172A !important;
    --ink-secondary: #475569 !important;
    --muted: #94A3B8 !important;
    --border: #E2E8F0 !important;
    --radius: 16px !important;
    --shadow-sm: 0 1px 3px rgba(15,23,42,0.06) !important;
    --shadow: 0 4px 16px rgba(15,23,42,0.08) !important;
  }
  body.dark {
    --bg: #0B1120 !important;
    --bg-elevated: #111827 !important;
    --card: #1E293B !important;
    --ink: #F1F5F9 !important;
    --ink-secondary: #CBD5E1 !important;
    --muted: #64748B !important;
    --border: #1E293B !important;
    --brand: #2DD4BF !important;
    --brand-hover: #5EEAD4 !important;
  }

  body {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif !important;
    background: var(--bg) !important;
    color: var(--ink) !important;
  }

  /* Header Standardization */
  .site-header {
    position: sticky !important; top: 0 !important; z-index: 100 !important;
    background: var(--bg) !important; border-bottom: 1px solid var(--border) !important;
    backdrop-filter: blur(12px) !important;
  }
  .header-inner {
    display: flex !important; align-items: center !important; justify-content: space-between !important;
    padding: 14px 0 !important; gap: 20px !important;
  }
  .logo { display: flex !important; align-items: center !important; gap: 10px !important; font-weight: 800 !important; font-size: 1.3rem !important; color: var(--ink) !important; text-decoration: none !important; }
  .logo-icon {
    width: 38px !important; height: 38px !important; border-radius: 11px !important;
    background: linear-gradient(135deg, var(--brand), var(--brand-hover)) !important;
    display: grid !important; place-items: center !important; font-size: 1.15rem !important; color: #fff !important;
  }
  .header-nav { display: flex !important; align-items: center !important; gap: 8px !important; }
  .header-nav a {
    padding: 8px 16px !important; border-radius: 999px !important;
    font-size: 0.9rem !important; font-weight: 500 !important; color: var(--ink-secondary) !important;
    text-decoration: none !important; transition: all 0.2s !important;
  }
  .header-nav a:hover { background: rgba(15,118,110,0.1) !important; color: var(--brand) !important; }
  .nav-blog {
    background: var(--brand) !important; color: #fff !important;
    font-weight: 700 !important; box-shadow: 0 2px 8px rgba(15,118,110,0.2) !important;
  }
  .nav-blog:hover { background: var(--brand-hover) !important; color: #fff !important; }
  
  .theme-toggle {
    width: 42px !important; height: 42px !important; border-radius: 50% !important;
    background: var(--bg-elevated) !important; border: 1px solid var(--border) !important;
    display: grid !important; place-items: center !important; font-size: 1.2rem !important; cursor: pointer !important;
    transition: all 0.2s !important;
  }
  .theme-toggle:hover { border-color: var(--brand) !important; transform: rotate(15deg) !important; }

  /* Footer Standardization */
  .site-footer {
    background: var(--card) !important; border-top: 1px solid var(--border) !important;
    padding: 48px 0 28px !important; margin-top: 24px !important;
  }
  .footer-grid { display: grid !important; grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 40px !important; margin-bottom: 36px !important; }
  .footer-brand p { font-size: 0.86rem !important; color: var(--ink-secondary) !important; margin-top: 10px !important; }
  .footer-col h5 { font-size: 0.82rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--muted) !important; margin-bottom: 14px !important; }
  .footer-col ul { list-style: none !important; padding: 0 !important; margin: 0 !important; }
  .footer-col li { margin-bottom: 10px !important; }
  .footer-col a { font-size: 0.88rem !important; color: var(--ink-secondary) !important; text-decoration: none !important; }
  .footer-col a:hover { color: var(--brand) !important; }
  .footer-bottom { border-top: 1px solid var(--border) !important; padding-top: 24px !important; display: flex !important; justify-content: space-between !important; font-size: 0.8rem !important; color: var(--muted) !important; }

  /* Mobile Responsiveness for Header/Footer */
  @media (max-width: 768px) {
    .header-inner { flex-wrap: wrap !important; }
    .header-nav { order: 3 !important; width: 100% !important; overflow-x: auto !important; white-space: nowrap !important; padding-top: 10px !important; scrollbar-width: none !important; }
    .header-nav::-webkit-scrollbar { display: none !important; }
    .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
    .footer-bottom { flex-direction: column !important; text-align: center !important; gap: 10px !important; }
  }
</style>
'''

# Master JS (Bulletproof Theme Toggle)
js_override = '''
<script id="master-theme-script">
  (function() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check saved preference
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      toggle.textContent = '☀️';
    }

    // Toggle click event
    toggle.addEventListener('click', function() {
      document.body.classList.toggle('dark');
      var isDark = document.body.classList.contains('dark');
      toggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  })();
</script>
</body>
'''

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace Header
    content = re.sub(r'<header.*?</header>', header_html, content, flags=re.DOTALL)
    
    # 2. Replace Footer
    content = re.sub(r'<footer.*?</footer>', footer_html, content, flags=re.DOTALL)
    
    # 3. Remove old broken theme scripts (if any)
    content = re.sub(r'<script>\s*(var|const|let)\s+themeToggle.*?</script>', '', content, flags=re.DOTALL)
    
    # 4. Inject Master CSS before </head>
    if 'master-standardization' not in content:
        content = content.replace('</head>', css_override + '\n</head>')
        
    # 5. Inject Master JS before </body>
    if 'master-theme-script' not in content:
        content = content.replace('</body>', js_override)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Standardized: {file}")

print("\nAll files updated! Now run: git add . && git commit -m 'Fix: Master standardize header, footer, fonts, and dark mode' && git push origin main")
