import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

# Header with BRAND NEW unique button ID (so old scripts can't find it)
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
    <button class="theme-toggle" id="sp-master-btn" aria-label="Toggle dark mode">🌙</button>
  </div>
</header>'''

# Bulletproof script
js_script = '''
<script id="sp-theme-final">
(function() {
  function applyTheme(theme) {
    var btn = document.getElementById('sp-master-btn');
    if (theme === 'dark') {
      document.body.classList.add('dark');
      if (btn) btn.textContent = '☀️';
    } else {
      document.body.classList.remove('dark');
      if (btn) btn.textContent = '🌙';
    }
    try { localStorage.setItem('sp_theme', theme); } catch(e) {}
    try { localStorage.setItem('theme', theme); } catch(e) {}
  }

  function getTheme() {
    try {
      var t = localStorage.getItem('sp_theme');
      if (t === 'dark' || t === 'light') return t;
      var old = localStorage.getItem('theme');
      if (old === 'dark' || old === 'light') return old;
    } catch(e) {}
    return 'light';
  }

  // Apply on load
  applyTheme(getTheme());

  // Attach after DOM is ready
  function attach() {
    var btn = document.getElementById('sp-master-btn');
    if (!btn) { setTimeout(attach, 50); return; }
    // Clone to remove old listeners
    var fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
</script>
</body>
'''

# Regex patterns to remove ALL old theme scripts
theme_script_patterns = [
    r'<script[^>]*>(?:(?!</script>)[\s\S])*?themeToggle(?:(?!</script>)[\s\S])*?</script>',
    r'<script[^>]*>(?:(?!</script>)[\s\S])*?classList\.toggle\([\'"]dark[\'"]\)(?:(?!</script>)[\s\S])*?</script>',
    r'<script[^>]*>(?:(?!</script>)[\s\S])*?localStorage\.getItem\([\'"]theme[\'"]\)(?:(?!</script>)[\s\S])*?</script>',
    r'<script[^>]*>(?:(?!</script>)[\s\S])*?getElementById\([\'"]themeToggle[\'"]\)(?:(?!</script>)[\s\S])*?</script>',
    r'<script id="master-theme-script"[^>]*>(?:(?!</script>)[\s\S])*?</script>',
    r'<script id="sp-theme-master"[^>]*>(?:(?!</script>)[\s\S])*?</script>',
    r'<script id="global-theme-script"[^>]*>(?:(?!</script>)[\s\S])*?</script>',
    r'<script id="sp-theme-final"[^>]*>(?:(?!</script>)[\s\S])*?</script>',
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove ALL old theme-related scripts
    for pat in theme_script_patterns:
        content = re.sub(pat, '', content, flags=re.DOTALL)

    # Replace header (this changes the button ID)
    content = re.sub(r'<header.*?</header>', header_html, content, flags=re.DOTALL)

    # Inject fresh script before </body>
    content = content.replace('</body>', js_script)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {file}")

print("\nAll done! Now run: git add . && git commit -m 'Fix: Bulletproof dark mode across all pages' && git push origin main")
