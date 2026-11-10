import os
import re

# List of all HTML files to process (including index.html and blog)
files = [f for f in os.listdir('.') if f.endswith('.html')]

# Add blog files if they exist
if os.path.exists('blog/index.html'):
    files.append('blog/index.html')

# Standard Header (matching homepage style)
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

# Standard Footer
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
          <li><a href="/salary-calculator.html">Salary</a></li>
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

# Global CSS to inject
css_to_inject = '''
<style id="global-ui-fix">
  /* Blog Button Highlight */
  .nav-blog {
    background: var(--brand) !important;
    color: #fff !important;
    padding: 8px 16px !important;
    border-radius: 999px !important;
    font-weight: 700 !important;
    box-shadow: 0 2px 8px var(--brand-glow);
  }
  .nav-blog:hover {
    background: var(--brand-hover) !important;
    color: #fff !important;
  }
  
  /* Footer List Fix (Remove Bullets) */
  .footer-col ul {
    list-style: none !important;
    padding-left: 0 !important;
    margin: 0 !important;
  }
  .footer-col li {
    margin-bottom: 10px !important;
  }
  
  /* Mobile Responsive Fix */
  @media (max-width: 768px) {
    .header-inner {
      flex-wrap: wrap !important;
      gap: 12px !important;
    }
    .logo {
      order: 1 !important;
    }
    .theme-toggle {
      order: 2 !important;
      margin-left: auto !important;
    }
    .header-nav {
      order: 3 !important;
      display: flex !important;
      width: 100% !important;
      overflow-x: auto !important;
      white-space: nowrap !important;
      padding: 8px 0 4px 0 !important;
      gap: 8px !important;
      scrollbar-width: none !important;
      border-top: 1px solid var(--border) !important;
    }
    .header-nav::-webkit-scrollbar {
      display: none !important;
    }
    .footer-grid {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
  }
</style>
'''

# JS to inject (Theme Toggle Fix)
js_to_inject = '''
<script>
  // Standardized Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
</script>
</body>
'''

for file in files:
    # Skip files we shouldn't touch
    if file in ['about.html', 'contact.html', 'privacy.html']:
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the fake search bar we injected earlier (if exists)
    content = re.sub(r'<!-- Search Bar Injected Below Header -->.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    
    # Replace Header
    content = re.sub(r'<header.*?</header>', header_html, content, flags=re.DOTALL)
    
    # Replace Footer
    if '<footer' in content:
        content = re.sub(r'<footer.*?</footer>', footer_html, content, flags=re.DOTALL)
    
    # Inject CSS
    if 'global-ui-fix' not in content:
        content = content.replace('</head>', css_to_inject + '\n</head>')
    
    # Inject JS
    if 'Standardized Theme Toggle' not in content:
        content = content.replace('</body>', js_to_inject)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed UI: {file}")

# Special handling for index.html (Add Blog button if missing)
if os.path.exists('index.html'):
    with open('index.html', 'r', encoding='utf-8') as f:
        idx = f.read()
    if 'class="nav-blog"' not in idx:
        idx = idx.replace('<a href="#everyday">Everyday</a>', '<a href="#everyday">Everyday</a>\n        <a href="/blog/" class="nav-blog">Blog</a>')
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(idx)
        print("Added Blog button to Homepage")

print("\nAll done! Now run: git add . && git commit -m 'Fix: UI, Header, Footer, Mobile Responsive' && git push origin main")
