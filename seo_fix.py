import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

# Finance & Health pages (YMYL ke liye)
finance_pages = ['mortgage-calculator.html', 'loan-calculator.html', 'compound-interest-calculator.html', 
                 'salary-calculator.html', 'inflation-calculator.html', 'zakat-calculator.html', 
                 'emi-calculator.html', 'tax-calculator.html', 'savings-goal-calculator.html', 
                 'retirement-calculator.html']
health_pages = ['bmi-calculator.html', 'calorie-calculator.html', 'body-fat-calculator.html', 
                'bmr-calculator.html', 'ideal-weight-calculator.html', 'water-intake-calculator.html',
                'heart-rate-calculator.html', 'pregnancy-calculator.html']

for file in files:
    # Skip non-tool files
    if file in ['about.html', 'contact.html', 'privacy.html', 'index.html']:
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generate page-specific data
    slug = file.replace('.html', '')
    canonical_url = f'https://sitpanda.com/{file}'
    
    # Extract title from existing file
    title_match = re.search(r'<title>(.*?)</title>', content)
    page_title = title_match.group(1) if title_match else 'SitPanda Calculator'
    
    desc_match = re.search(r'<meta name="description" content="(.*?)"', content)
    page_desc = desc_match.group(1) if desc_match else 'Free online calculator by SitPanda.'
    
    # ===== 1. ADD CANONICAL IF MISSING =====
    if 'rel="canonical"' not in content:
        canonical_tag = f'  <link rel="canonical" href="{canonical_url}" />\n'
        content = content.replace('</head>', canonical_tag + '</head>')
    
    # ===== 2. ADD OG + TWITTER TAGS IF MISSING =====
    if 'og:title' not in content:
        og_tags = f'''
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{page_title}" />
  <meta property="og:description" content="{page_desc}" />
  <meta property="og:url" content="{canonical_url}" />
  <meta property="og:site_name" content="SitPanda" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="{page_title}" />
  <meta name="twitter:description" content="{page_desc}" />
'''
        content = content.replace('</head>', og_tags + '</head>')
    
    # ===== 3. ADD YMYL DISCLAIMER (Finance/Health tools) =====
    if file in finance_pages and 'ymyl-disclaimer' not in content:
        disclaimer = '''
  <div class="ymyl-disclaimer" style="margin: 40px auto; max-width: 900px; padding: 16px 20px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.4); border-radius: 12px; font-size: 0.88rem; line-height: 1.6; color: var(--ink-secondary);">
    <strong style="color: #B45309;">⚠️ Financial Disclaimer:</strong> This calculator is for educational and informational purposes only and does not constitute financial, tax, or investment advice. Results are estimates. Always consult a qualified financial professional before making major financial decisions.
  </div>
'''
        content = content.replace('</main>', disclaimer + '</main>')
    
    if file in health_pages and 'ymyl-disclaimer' not in content:
        disclaimer = '''
  <div class="ymyl-disclaimer" style="margin: 40px auto; max-width: 900px; padding: 16px 20px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.4); border-radius: 12px; font-size: 0.88rem; line-height: 1.6; color: var(--ink-secondary);">
    <strong style="color: #B91C1C;">⚕️ Medical Disclaimer:</strong> This calculator provides estimates only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider before making health-related decisions.
  </div>
'''
        content = content.replace('</main>', disclaimer + '</main>')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {file}")

# ===== 4. HOMEPAGE: WebSite + Organization Schema =====
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

if 'WebSite' not in idx and 'application/ld+json' not in idx[:2000]:
    schema = '''
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SitPanda",
  "url": "https://sitpanda.com/",
  "description": "Free online calculators for finance, health, and everyday life."
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SitPanda",
  "url": "https://sitpanda.com/",
  "logo": "https://sitpanda.com/favicon.ico"
}
</script>
'''
    idx = idx.replace('</head>', schema + '</head>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(idx)
    print("Homepage schema added!")

print("\nAll done! Now run: git add . && git commit -m 'SEO: Add OG tags, schemas, YMYL disclaimers' && git push origin main")
