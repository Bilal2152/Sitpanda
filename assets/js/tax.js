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
    for(let i=1; i<=2; i++) {
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

  function calculate() {
    let gross = getVal('grossIncome');
    let deductions = getVal('deductions');
    
    let taxable = Math.max(gross - deductions, 0);
    let taxOwed = 0;
    let remainingIncome = taxable;

    // Loop through the 4 dynamic tax brackets
    for (let i = 1; i <= 4; i++) {
      let limit = getVal('bracketLimit' + i); // Upper limit of this bracket
      let rate = getVal('bracketRate' + i) / 100; // Tax rate

      if (i === 4) {
        // Last bracket (no limit, applies to all remaining)
        if (remainingIncome > 0) {
          taxOwed += remainingIncome * rate;
        }
      } else {
        // Calculate how much of the remaining income falls into this bracket
        // We need the difference between this limit and the previous limit
        let prevLimit = i === 1 ? 0 : getVal('bracketLimit' + (i - 1));
        let bracketSize = limit - prevLimit;
        
        if (remainingIncome > 0 && taxable > prevLimit) {
          let amountInBracket = Math.min(remainingIncome, bracketSize);
          taxOwed += amountInBracket * rate;
          remainingIncome -= amountInBracket;
        }
      }
    }

    let netIncome = Math.max(gross - taxOwed, 0);
    let effectiveRate = gross > 0 ? (taxOwed / gross) * 100 : 0;

    if (gross === 0) {
      $('totalTax').textContent = '--';
      $('netIncome').textContent = '--';
      $('effectiveRate').textContent = '--';
      $('subLabel').textContent = 'Enter your income to calculate';
      return;
    }

    $('totalTax').textContent = fmt(taxOwed);
    $('netIncome').textContent = fmt(netIncome);
    $('effectiveRate').textContent = effectiveRate.toFixed(1) + '%';
    $('subLabel').textContent = `Based on taxable income of ${fmt(taxable)}`;
  }

  // Global functions for HTML
  window.calculate = calculate;

  document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateCurSymbols();
    calculate();
  });
})();