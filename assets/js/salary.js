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
      return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(val);
    } catch(e) { return cur + ' ' + val.toFixed(2); }
  }
  
  function updateCurSymbols() {
    let cur = $('currencySelect').value;
    let symbol = cur;
    try {
      let parts = new Intl.NumberFormat(locale, { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      symbol = parts.find(p => p.type === 'currency').value;
    } catch(e) {}
    if($('curSymbol1')) $('curSymbol1').textContent = symbol;
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
    let amount = getVal('salaryAmount');
    let freq = $('payFrequency').value;
    let hoursWeek = getVal('hoursPerWeek') || 40;
    let daysWeek = getVal('daysPerWeek') || 5;

    if (amount === 0) {
      $('annualIncome').textContent = '--';
      $('subLabel').textContent = 'Enter your pay details';
      $('monthlyPay').textContent = '--';
      $('weeklyPay').textContent = '--';
      $('dailyPay').textContent = '--';
      $('hourlyPay').textContent = '--';
      return;
    }

    let annual = 0;

    if (freq === 'hourly') {
      annual = amount * hoursWeek * 52;
    } else if (freq === 'daily') {
      annual = amount * daysWeek * 52;
    } else if (freq === 'weekly') {
      annual = amount * 52;
    } else if (freq === 'biweekly') {
      annual = amount * 26;
    } else if (freq === 'monthly') {
      annual = amount * 12;
    } else if (freq === 'annual') {
      annual = amount;
    }

    let monthly = annual / 12;
    let weekly = annual / 52;
    let daily = weekly / daysWeek;
    let hourly = weekly / hoursWeek;

    $('annualIncome').textContent = fmt(annual);
    $('subLabel').textContent = 'Based on 52 weeks per year';
    
    $('monthlyPay').textContent = fmt(monthly);
    $('weeklyPay').textContent = fmt(weekly);
    $('dailyPay').textContent = fmt(daily);
    $('hourlyPay').textContent = fmt(hourly);
  }

  window.calculate = calculate;

  document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateCurSymbols();
    calculate();
  });
})();
