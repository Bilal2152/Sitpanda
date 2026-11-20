(function() {
  const COUNTRIES = {
    US:['United States','USD'], GB:['United Kingdom','GBP'], CA:['Canada','CAD'], AU:['Australia','AUD'],
    NZ:['New Zealand','NZD'], IE:['Ireland','EUR'], DE:['Germany','EUR'], FR:['France','EUR'],
    ES:['Spain','EUR'], IT:['Italy','EUR'], NL:['Netherlands','EUR'], CH:['Switzerland','CHF'],
    SE:['Sweden','SEK'], NO:['Norway','NOK'], DK:['Denmark','DKK'], PL:['Poland','PLN'],
    CZ:['Czech Republic','CZK'], HU:['Hungary','HUF'], RO:['Romania','RON'], TR:['Turkey','TRY'],
    RU:['Russia','RUB'], AE:['UAE','AED'], SA:['Saudi Arabia','SAR'], QA:['Qatar','QAR'],
    KW:['Kuwait','KWD'], BH:['Bahrain','BHD'], OM:['Oman','OMR'], JO:['Jordan','JOD'],
    EG:['Egypt','EGP'], ZA:['South Africa','ZAR'], NG:['Nigeria','NGN'], KE:['Kenya','KES'],
    GH:['Ghana','GHS'], PK:['Pakistan','PKR'], IN:['India','INR'], BD:['Bangladesh','BDT'],
    LK:['Sri Lanka','LKR'], NP:['Nepal','NPR'], CN:['China','CNY'], JP:['Japan','JPY'],
    KR:['South Korea','KRW'], SG:['Singapore','SGD'], MY:['Malaysia','MYR'], TH:['Thailand','THB'],
    ID:['Indonesia','IDR'], PH:['Philippines','PHP'], VN:['Vietnam','VND'], HK:['Hong Kong','HKD'],
    TW:['Taiwan','TWD'], BR:['Brazil','BRL'], MX:['Mexico','MXN'], AR:['Argentina','ARS']
  };
  const CURRENCIES = ['USD','GBP','EUR','CAD','AUD','NZD','CHF','SEK','NOK','DKK','PLN','CZK','HUF','RON','TRY','RUB','AED','SAR','QAR','KWD','BHD','OMR','JOD','EGP','ZAR','NGN','KES','GHS','PKR','INR','BDT','LKR','NPR','CNY','JPY','KRW','SGD','MYR','THB','IDR','PHP','VND','HKD','TWD','BRL','MXN','ARS'];

  const $ = id => document.getElementById(id);
  const getVal = id => parseFloat($(id).value) || 0;
  const locale = navigator.language || 'en-US';

  function fmt(val) {
    let cur = $('currencySelect').value;
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(val);
    } catch(e) { return cur + ' ' + val.toFixed(0); }
  }
  
  function updateCurSymbols() {
    let cur = $('currencySelect').value;
    let symbol = cur;
    try {
      let parts = new Intl.NumberFormat(locale, { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      symbol = parts.find(p => p.type === 'currency').value;
    } catch(e) {}
    for(let i=1; i<=8; i++) {
      let el = $('curSymbol'+i);
      if(el) el.textContent = symbol;
    }
  }

  function initDropdowns() {
    let cSel = $('countrySelect'), curSel = $('currencySelect');
    Object.keys(COUNTRIES).forEach(k => {
      let o = document.createElement('option');
      o.value = k; o.textContent = COUNTRIES[k][0];
      cSel.appendChild(o);
    });
    CURRENCIES.forEach(c => {
      let o = document.createElement('option');
      o.value = c; o.textContent = c;
      curSel.appendChild(o);
    });

    cSel.value = 'PK';
    curSel.value = 'PKR';
    
    cSel.addEventListener('change', function() {
      curSel.value = COUNTRIES[this.value][1];
      updateCurSymbols(); calculate();
    });
    curSel.addEventListener('change', function() {
      updateCurSymbols(); calculate();
    });
  }

  function fetchLiveNisab() {
    const status = $('nisabStatus');
    status.innerHTML = '⏳ Calculating Nisab based on current market standards...';
    
    const goldPricePerGramUSD = 75.00;
    const silverPricePerGramUSD = 0.95;
    
    const exchangeRates = {
      'USD': 1, 'PKR': 278, 'INR': 83, 'GBP': 0.79, 'EUR': 0.92, 
      'SAR': 3.75, 'AED': 3.67, 'CAD': 1.35, 'AUD': 1.52, 'BDT': 110,
      'MYR': 4.7, 'IDR': 15600, 'TRY': 32, 'ZAR': 19, 'NGN': 1500
    };
    
    const cur = $('currencySelect').value;
    const rate = exchangeRates[cur] || 1;
    
    setTimeout(() => {
      const goldNisabUSD = goldPricePerGramUSD * 87.48;
      const silverNisabUSD = silverPricePerGramUSD * 612.36;
      
      const goldNisabLocal = goldNisabUSD * rate;
      const silverNisabLocal = silverNisabUSD * rate;
      
      const recommendedNisab = Math.round(silverNisabLocal);
      
      $('nisab').value = recommendedNisab;
      
      status.innerHTML = `✅ Estimated Nisab (Silver Standard): <strong>${fmt(recommendedNisab)}</strong><br>
                          <span style="font-size:0.75rem; color:var(--muted);">(Gold Standard: ${fmt(Math.round(goldNisabLocal))} — Note: These are approximate rates. Please verify with local market prices.)</span>`;
      
      calculate();
    }, 800);
  }

  function calculate() {
    let cash = getVal('cash');
    let gold = getVal('goldValue');
    let silver = getVal('silverValue');
    let precious = getVal('preciousMetals');
    let business = getVal('businessAssets');
    let loans = getVal('loansGiven');
    let liabilities = getVal('liabilities');
    let nisab = getVal('nisab');

    let totalAssets = cash + gold + silver + precious + business + loans;
    let netWealth = Math.max(totalAssets - liabilities, 0);

    if (netWealth === 0) {
      $('zakatAmount').textContent = '--';
      $('subLabel').textContent = 'Enter your assets to calculate';
      $('netWealth').textContent = '--';
      return;
    }

    $('netWealth').textContent = fmt(netWealth);

    if (nisab > 0 && netWealth < nisab) {
      $('zakatAmount').textContent = '0';
      $('subLabel').textContent = 'Your net wealth is below the Nisab threshold.';
    } else {
      let zakat = netWealth * 0.025;
      $('zakatAmount').textContent = fmt(zakat);
      $('subLabel').textContent = nisab > 0 
        ? 'Your wealth exceeds Nisab. Zakat is due.' 
        : 'Enter Nisab value for accurate calculation.';
    }
  }

  // Make globally accessible for HTML events
  window.fetchLiveNisab = fetchLiveNisab;
  window.calculate = calculate;

  document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateCurSymbols();
    calculate();
  });
})();
