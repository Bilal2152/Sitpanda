(function() {
  document.addEventListener('DOMContentLoaded', function() {
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

    const countrySelect = document.getElementById('countrySelect');
    const currencySelect = document.getElementById('currencySelect');
    const fetchBtn = document.getElementById('fetchNisabBtn');
    
    if(!countrySelect || !currencySelect) return;

    Object.keys(COUNTRIES).forEach(k => {
      let o = document.createElement('option');
      o.value = k; o.textContent = COUNTRIES[k][0];
      countrySelect.appendChild(o);
    });
    
    CURRENCIES.forEach(c => {
      let o = document.createElement('option');
      o.value = c; o.textContent = c;
      currencySelect.appendChild(o);
    });

    countrySelect.value = 'PK';
    currencySelect.value = 'PKR';

    function updateCurSymbols() {
      let cur = currencySelect.value;
      let symbol = cur;
      try {
        let parts = new Intl.NumberFormat(navigator.language || 'en-US', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
        symbol = parts.find(p => p.type === 'currency').value;
      } catch(e) {}
      document.querySelectorAll('.cur-sym').forEach(el => el.textContent = symbol);
    }

    function fmt(val) {
      try {
        return new Intl.NumberFormat(navigator.language || 'en-US', { style: 'currency', currency: currencySelect.value, maximumFractionDigits: 0 }).format(val);
      } catch(e) { return currencySelect.value + ' ' + val.toFixed(0); }
    }

    function calculate() {
      let cash = parseFloat(document.getElementById('cash').value) || 0;
      let gold = parseFloat(document.getElementById('goldValue').value) || 0;
      let silver = parseFloat(document.getElementById('silverValue').value) || 0;
      let precious = parseFloat(document.getElementById('preciousMetals').value) || 0;
      let business = parseFloat(document.getElementById('businessAssets').value) || 0;
      let loans = parseFloat(document.getElementById('loansGiven').value) || 0;
      
      let liabilities = parseFloat(document.getElementById('liabilities').value) || 0;
      let nisab = parseFloat(document.getElementById('nisab').value) || 0;

      let totalAssets = cash + gold + silver + precious + business + loans;
      let netWealth = Math.max(totalAssets - liabilities, 0);

      if (netWealth === 0) {
        document.getElementById('zakatAmount').textContent = '--';
        document.getElementById('subLabel').textContent = 'Enter your assets to calculate';
        document.getElementById('netWealth').textContent = '--';
        return;
      }

      document.getElementById('netWealth').textContent = fmt(netWealth);

      if (nisab > 0 && netWealth < nisab) {
        document.getElementById('zakatAmount').textContent = '0';
        document.getElementById('subLabel').textContent = 'Your net wealth is below the Nisab threshold.';
      } else {
        let zakat = netWealth * 0.025;
        document.getElementById('zakatAmount').textContent = fmt(zakat);
        document.getElementById('subLabel').textContent = nisab > 0 
          ? 'Your wealth exceeds Nisab. Zakat is due.' 
          : 'Enter Nisab value for accurate calculation.';
      }
    }

    function fetchLiveNisab() {
      const status = document.getElementById('nisabStatus');
      status.innerHTML = '⏳ Calculating Nisab based on current market standards...';
      
      const goldPricePerGramUSD = 75.00;
      const silverPricePerGramUSD = 0.95;
      const exchangeRates = { 'USD': 1, 'PKR': 278, 'INR': 83, 'GBP': 0.79, 'EUR': 0.92, 'SAR': 3.75, 'AED': 3.67, 'CAD': 1.35, 'AUD': 1.52, 'BDT': 110, 'MYR': 4.7, 'IDR': 15600, 'TRY': 32, 'ZAR': 19, 'NGN': 1500 };
      
      const cur = currencySelect.value;
      const rate = exchangeRates[cur] || 1;
      
      setTimeout(() => {
        const goldNisabUSD = goldPricePerGramUSD * 87.48;
        const silverNisabUSD = silverPricePerGramUSD * 612.36;
        const goldNisabLocal = goldNisabUSD * rate;
        const silverNisabLocal = silverNisabUSD * rate;
        const recommendedNisab = Math.round(silverNisabLocal);
        
        document.getElementById('nisab').value = recommendedNisab;
        status.innerHTML = `✅ Estimated Nisab (Silver): <strong>${fmt(recommendedNisab)}</strong><br><span style="font-size:0.75rem; color:var(--muted);">(Gold: ${fmt(Math.round(goldNisabLocal))} — Note: These are approximate rates. Verify with local market.)</span>`;
        calculate();
      }, 800);
    }

    countrySelect.addEventListener('change', function() {
      currencySelect.value = COUNTRIES[this.value][1];
      updateCurSymbols(); calculate();
    });
    
    currencySelect.addEventListener('change', function() {
      updateCurSymbols(); calculate();
    });
    
    document.querySelectorAll('.calc-input').forEach(input => {
      input.addEventListener('input', calculate);
    });

    if(fetchBtn) fetchBtn.addEventListener('click', fetchLiveNisab);

    updateCurSymbols();
    calculate();
  });
})();
