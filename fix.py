import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html') and f not in ['index.html', 'about.html', 'contact.html', 'privacy.html']]

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
    <div class="header-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">🌙</button>
    </div>
  </div>
</header>
<!-- Search Bar Injected Below Header -->
<div class="container" style="padding-top: 24px; padding-bottom: 8px;">
  <div class="hero-search" style="max-width: 560px; margin: 0 auto;">
    <div class="search-box">
      <span class="icon">🔍</span>
      <input type="text" placeholder="Search calculators — try “mortgage” or “BMI”..." autocomplete="off" onfocus="window.location.href='/'">
    </div>
  </div>
</div>'''

css_to_inject = '''
<style id="global-nav-style">
  .nav-blog {
    background: var(--brand) !important;
    color: #fff !important;
    padding: 6px 14px !important;
    border-radius: 999px;
    font-weight: 700;
    box-shadow: 0 2px 8px var(--brand-glow);
    margin-left: 4px;
  }
  .nav-blog:hover {
    background: var(--brand-hover) !important;
    color: #fff !important;
  }
  @media (max-width: 768px) {
    .header-nav {
      display: flex !important;
      overflow-x: auto;
      white-space: nowrap;
      width: 100%;
      padding-top: 10px;
      gap: 8px;
      order: 3;
      scrollbar-width: none;
      padding-bottom: 4px;
    }
    .header-nav::-webkit-scrollbar { display: none; }
    .nav-blog { margin-left: 0; }
  }
</style>
'''

js_to_inject = '''
<script>
  // Standardize Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    if(themeToggle) themeToggle.textContent = '☀️';
  }
  if(themeToggle) {
    const newToggle = themeToggle.cloneNode(true);
    themeToggle.parentNode.replaceChild(newToggle, themeToggle);
    newToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      newToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
</script>
</body>
'''

footer_html = '''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo"><span class="logo-icon">🐼</span><span>SitPanda</span></a>
        <p>Free, fast, and accurate online calculators for finance, health, and everyday life. No signup. No clutter. Just answers.</p>
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
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 SitPanda. All rights reserved.</span>
      <span>Calculators are for informational purposes only.</span>
    </div>
  </div>
</footer>
'''

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'<header.*?</header>', header_html, content, flags=re.DOTALL)
    if '<footer' in content:
        content = re.sub(r'<footer.*?</footer>', footer_html, content, flags=re.DOTALL)
    if 'global-nav-style' not in content:
        content = content.replace('</head>', css_to_inject + '\n</head>')
    if 'Standardize Theme Toggle' not in content:
        content = re.sub(r'<script>\s*const themeToggle.*?</script>', '', content, flags=re.DOTALL)
        content = content.replace('</body>', js_to_inject)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file}")
