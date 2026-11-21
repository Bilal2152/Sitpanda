(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // --- CORE VARIABLES ---
    let currentUnit = 'metric';
    const $ = id => document.getElementById(id);

    // --- UNIT SWITCHING LOGIC ---
    window.switchUnit = function(unit) {
      currentUnit = unit;
      
      // Toggle active class on buttons
      $('btn-metric').classList.toggle('active', unit === 'metric');
      $('btn-imperial').classList.toggle('active', unit === 'imperial');
      
      // Show/Hide input sections
      $('metric-inputs').style.display = unit === 'metric' ? 'block' : 'none';
      $('imperial-inputs').style.display = unit === 'imperial' ? 'block' : 'none';
      
      // Reset results when switching units
      resetResult();
    };

    // --- CALCULATION LOGIC ---
    window.calculateBMI = function() {
      let weight, height, bmi;
      
      if (currentUnit === 'metric') {
        weight = parseFloat($('weight-kg').value);
        height = parseFloat($('height-cm').value);
        
        if (weight > 0 && height > 0) {
          // Metric Formula: kg / (m * m)
          bmi = weight / Math.pow(height / 100, 2);
        }
      } else {
        weight = parseFloat($('weight-lbs').value);
        const ft = parseFloat($('height-ft').value) || 0;
        const inch = parseFloat($('height-in').value) || 0;
        const totalInches = (ft * 12) + inch;
        
        if (weight > 0 && totalInches > 0) {
          // Imperial Formula: (lbs / (in * in)) * 703
          bmi = (weight / Math.pow(totalInches, 2)) * 703;
        }
      }

      const valEl = $('bmi-value');
      const catEl = $('bmi-category');

      if (bmi && isFinite(bmi)) {
        valEl.textContent = bmi.toFixed(1);
        
        // Determine Category
        let category, className;
        if (bmi < 18.5) { category = 'Underweight'; className = 'cat-underweight'; }
        else if (bmi < 25) { category = 'Normal weight'; className = 'cat-normal'; }
        else if (bmi < 30) { category = 'Overweight'; className = 'cat-overweight'; }
        else { category = 'Obese'; className = 'cat-obese'; }

        catEl.textContent = category;
        catEl.className = 'result-category ' + className;
        catEl.style.background = ''; 
        catEl.style.color = '';
      } else {
        resetResult();
      }
    };

    function resetResult() {
      const valEl = $('bmi-value');
      const catEl = $('bmi-category');
      if(!valEl || !catEl) return;
      
      valEl.textContent = '--';
      catEl.textContent = 'Enter details';
      catEl.className = 'result-category';
      catEl.style.background = 'var(--surface-2)';
      catEl.style.color = 'var(--muted)';
    }
  });
})();
