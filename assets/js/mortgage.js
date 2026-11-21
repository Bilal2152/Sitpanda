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

  let currentMode = 'pi';
  let currentView = 'monthly';
  let scheduleData = null;

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
    if($('curSymbol1')) $('curSymbol1').textContent = symbol;
    if($('curSymbol2')) $('curSymbol2').textContent = symbol;
    if($('curSymbol3')) $('curSymbol3').textContent = symbol;
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

  function syncFromPercent() {
    let price = getVal('homePrice');
    let pct = Math.min(Math.max(getVal('downPercent'), 0), 100);
    if(price > 0) $('downPayment').value = Math.round(price * (pct/100));
  }
  function syncFromAmount() {
    let price = getVal('homePrice');
    let amt = getVal('downPayment');
    if(price > 0) $('downPercent').value = ((amt / price) * 100).toFixed(1);
  }

  function setMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    if($('extraFields')) $('extraFields').style.display = mode === 'full' ? 'block' : 'none';
    calculate();
  }

  function setView(view, btn) {
    currentView = view;
    document.querySelectorAll('.amort-tabs button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderTable();
  }

  function calculate() {
    let price = getVal('homePrice');
    let down = Math.min(getVal('downPayment'), price);
    let rate = getVal('interestRate');
    let term = getVal('loanTerm');
    let n = $('termUnit').value === 'years' ? term * 12 : term;
    let loan = Math.max(price - down, 0);
    let r = rate / 1200;

    if (loan === 0 || n === 0) {
      $('monthlyPayment').textContent = '--';
      $('subLabel').textContent = 'Enter loan details to calculate';
      $('totalInterest').textContent = '--';
      $('totalCost').textContent = '--';
      $('loanAmount').textContent = '--';
      $('payoffTime').textContent = '--';
      $('amortBody').innerHTML = '<tr><td colspan="4" style="text-align:center;">Fill the form above</td></tr>';
      return;
    }

    let pmt = 0;
    if (rate === 0) {
      pmt = loan / n;
    } else {
      pmt = loan * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
    }

    let totalPI = pmt * n;
    let totalInterest = Math.max(totalPI - loan, 0);

    let extraMonthly = 0;
    if (currentMode === 'full') {
      let tax = (price * getVal('propertyTax') / 100) / 12;
      let ins = getVal('insurance') / 12;
      let lowDown = (down / price) < 0.2;
      let mi = lowDown ? (loan * getVal('mortgageInsurance') / 100) / 12 : 0;
      extraMonthly = tax + ins + mi;
    }

    let finalMonthly = pmt + extraMonthly;

    $('mainLabel').textContent = currentMode === 'full' ? 'Total Monthly Payment' : 'Monthly Payment (P&I)';
    $('monthlyPayment').textContent = fmt(finalMonthly);
    $('subLabel').textContent = currentMode === 'full' 
      ? `Includes P&I (${fmt(pmt)}) + Extras (${fmt(extraMonthly)})`
      : 'Principal & Interest only';
    
    $('totalInterest').textContent = fmt(totalInterest);
    $('totalCost').textContent = fmt((finalMonthly * n) + down);
    $('loanAmount').textContent = fmt(loan);
    
    let yrs = Math.floor(n / 12), mos = n % 12;
    $('payoffTime').textContent = `${yrs} yr ${mos} mo`;

    buildSchedule(loan, r, pmt, n);
  }

  function buildSchedule(loan, r, pmt, n) {
    let bal = loan;
    let monthlyRows = [], yearlyRows = [];
    let yp = 0, yi = 0;

    for (let m = 1; m <= n; m++) {
      let interest = bal * r;
      let principal = Math.min(pmt - interest, bal);
      bal = Math.max(bal - principal, 0);

      if (m <= 12) monthlyRows.push([m, principal, interest, bal]);
      
      yp += principal; yi += interest;
      if (m % 12 === 0 || m === n) {
        yearlyRows.push([Math.ceil(m / 12), yp, yi, bal]);
        yp = 0; yi = 0;
      }
    }
    scheduleData = { monthly: monthlyRows, yearly: yearlyRows };
    renderTable();
  }

  function renderTable() {
    if (!scheduleData) return;
    let rows = scheduleData[currentView];
    $('thPeriod').textContent = currentView === 'monthly' ? 'Month' : 'Year';
    
    let html = '';
    rows.forEach(r => {
      html += `<tr>
        <td>${r[0]}</td>
        <td>${fmt(r[1])}</td>
        <td>${fmt(r[2])}</td>
        <td>${fmt(r[3])}</td>
      </tr>`;
    });
    $('amortBody').innerHTML = html;
  }

  window.calculate = calculate;
  window.setMode = setMode;
  window.setView = setView;
  window.syncFromPercent = syncFromPercent;
  window.syncFromAmount = syncFromAmount;

  document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateCurSymbols();
    calculate();
  });

})();
