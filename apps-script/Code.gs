/**
 * SIGN SHOP CONSULTING — CEO DASHBOARD (v2)
 * =========================================
 * A self-calculating "how healthy is my sign shop?" dashboard for Google Sheets.
 *
 * Owner types raw numbers on ONE tab (Monthly Input). Everything else —
 * margins, ratios, a 0-100 Health Score, A-F grade, 12-month trend sparklines,
 * benchmark comparisons, and an auto-generated "What To Do Next" list —
 * calculates itself.
 *
 * HOW TO INSTALL
 *   1. Open a blank Google Sheet (sheets.new).
 *   2. Extensions ▸ Apps Script.  Delete any code, paste this whole file, Save.
 *   3. Run the function `buildDashboard` once (authorize when asked).
 *   4. Reload the sheet. Use the new "📊 Dashboard" menu any time.
 *
 * The menu also has "Load Sample Data" (12 months of realistic numbers so you
 * can see it working) and "Clear Data".
 *
 * ONE FILE = ONE SHOP. To run a second shop later, make a copy of the file and
 * change the Shop name on the Dashboard. (Designed so multi-tenant is a copy
 * away today and a clean migration later.)
 */

/* ------------------------------------------------------------------ *
 *  CONFIG
 * ------------------------------------------------------------------ */

var SHEETS = {
  DASH:  'Dashboard',
  INPUT: 'Monthly Input',
  CALC:  'Metrics',
  LOG:   'Call Log',
  HELP:  'Read Me',
};

var MONTHS = ['January','February','March','April','May','June',
              'July','August','September','October','November','December'];

// Colors
var C = {
  ink:    '#1f2733',
  navy:   '#11314f',
  band:   '#11314f',
  sub:    '#5f6b7a',
  line:   '#d7dde5',
  green:  '#1e8e5a',
  greenBg:'#d6f0e0',
  yellow: '#b8860b',
  yellowBg:'#fdf2cf',
  red:    '#c0392b',
  redBg:  '#fbe0dc',
  blue:   '#1a73e8',
  editBg: '#fff8e1',   // "type here" highlight
  card:   '#f3f6fb',
};

/**
 * The 13 KPIs that drive the dashboard and the Health Score.
 *  src    : Metrics/Input column range the monthly value comes from
 *  goal   : default target (editable on the Dashboard)
 *  fmt    : number format for value + goal cells
 *  bench  : industry range shown for context (text)
 *  dir    : +1 = higher is better, -1 = lower is better
 *  pillar : which health pillar it rolls up into
 */
var KPIS = [
  {name:'Gross Profit %',            src:"'Metrics'!$C$3:$C$14", goal:0.50,   fmt:'0.0%',      bench:'45–55%',  dir:1,  pillar:'Profitability'},
  {name:'Net Profit %',              src:"'Metrics'!$H$3:$H$14", goal:0.12,   fmt:'0.0%',      bench:'10–15%',  dir:1,  pillar:'Profitability'},
  {name:'Material / COGS %',         src:"'Metrics'!$D$3:$D$14", goal:0.30,   fmt:'0.0%',      bench:'25–32%',  dir:-1, pillar:'Profitability'},
  {name:'Direct Labor %',            src:"'Metrics'!$E$3:$E$14", goal:0.24,   fmt:'0.0%',      bench:'20–25%',  dir:-1, pillar:'Profitability'},
  {name:'G&A / Overhead %',          src:"'Metrics'!$F$3:$F$14", goal:0.33,   fmt:'0.0%',      bench:'30–38%',  dir:-1, pillar:'Profitability'},
  {name:'Close Rate % (orders/est)', src:"'Metrics'!$M$3:$M$14", goal:0.65,   fmt:'0.0%',      bench:'60–70%',  dir:1,  pillar:'Sales'},
  {name:'Estimate Rate % (est/leads)',src:"'Metrics'!$L$3:$L$14",goal:0.70,   fmt:'0.0%',      bench:'65–80%',  dir:1,  pillar:'Sales'},
  {name:'Average Sale $',            src:"'Metrics'!$N$3:$N$14", goal:1500,   fmt:'"$"#,##0',  bench:'shop set',dir:1,  pillar:'Sales'},
  {name:'Marketing % of Revenue',    src:"'Metrics'!$K$3:$K$14", goal:0.05,   fmt:'0.0%',      bench:'3–6%',    dir:-1, pillar:'Marketing'},
  {name:'ROAS (mktg sales/spend)',   src:"'Metrics'!$Q$3:$Q$14", goal:5,      fmt:'0.0"x"',    bench:'4–6x',    dir:1,  pillar:'Marketing'},
  {name:'Cost per Lead $',           src:"'Metrics'!$I$3:$I$14", goal:40,     fmt:'"$"#,##0',  bench:'$30–50',  dir:-1, pillar:'Marketing'},
  {name:'Lead Growth % (YoY)',       src:"'Metrics'!$P$3:$P$14", goal:0.10,   fmt:'0.0%',      bench:'+10%',    dir:1,  pillar:'Growth'},
  {name:'Total Revenue $',           src:"'Monthly Input'!$B$3:$B$14", goal:175000, fmt:'"$"#,##0', bench:'shop set', dir:1, pillar:'Growth'},
];

var PILLARS = [
  {name:'Profitability', weight:0.40},
  {name:'Sales',         weight:0.25},
  {name:'Marketing',     weight:0.20},
  {name:'Growth',        weight:0.15},
];

/* ------------------------------------------------------------------ *
 *  MENU
 * ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Dashboard')
    .addItem('Build / Rebuild dashboard', 'buildDashboard')
    .addSeparator()
    .addItem('Load sample data (12 months)', 'loadSampleData')
    .addItem('Clear all data', 'clearData')
    .addToUi();
}

/* ------------------------------------------------------------------ *
 *  MAIN BUILD
 * ------------------------------------------------------------------ */

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  buildInput_(ss);
  buildMetrics_(ss);
  buildDash_(ss);
  buildLog_(ss);
  buildHelp_(ss);
  // Order the tabs nicely.
  reorder_(ss, [SHEETS.DASH, SHEETS.INPUT, SHEETS.CALC, SHEETS.LOG, SHEETS.HELP]);
  ss.setActiveSheet(sheet_(ss, SHEETS.DASH));
  SpreadsheetApp.getActiveSpreadsheet().toast('Dashboard built. Use the 📊 Dashboard menu to load sample data.', 'Done', 6);
}

/* ------------------------------------------------------------------ *
 *  TAB: MONTHLY INPUT  (the only tab you type into)
 * ------------------------------------------------------------------ */

function buildInput_(ss) {
  var sh = sheet_(ss, SHEETS.INPUT, true);
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setTabColor(C.navy);

  var headers = [
    'Month','Total Revenue $','Booked Sales $','Material / COGS $','Direct Labor $',
    'G&A / Overhead $','# Leads','Prior-Yr # Leads','Marketing Spend $','# Ad Clicks',
    '# Estimates','# Orders','# New Customers','Signs & Wraps Sales $','Marketing Sales $',
    'Top Industry','Top Product/Service'
  ];

  // Title band
  sh.getRange('A1:Q1').merge()
    .setValue('MONTHLY INPUT  —  type your numbers below (one row per month)')
    .setBackground(C.band).setFontColor('#ffffff').setFontWeight('bold').setFontSize(12)
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 30);

  // Headers
  sh.getRange(2, 1, 1, headers.length).setValues([headers])
    .setBackground('#e8edf4').setFontWeight('bold').setFontColor(C.ink)
    .setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center');
  sh.setRowHeight(2, 40);

  // Month labels
  for (var i = 0; i < 12; i++) sh.getRange(3 + i, 1).setValue(MONTHS[i]);
  sh.getRange(3, 1, 12, 1).setFontWeight('bold').setBackground('#eef2f7');

  // Highlight the typeable area
  sh.getRange(3, 2, 12, headers.length - 1).setBackground(C.editBg);

  // Totals + Average rows
  sh.getRange(15, 1).setValue('TOTAL').setFontWeight('bold');
  sh.getRange(16, 1).setValue('AVERAGE').setFontWeight('bold');
  sh.getRange(15, 1, 2, 1).setBackground('#dfe6ef');
  // numeric columns B..O get sum / average; P,Q skipped
  for (var col = 2; col <= 15; col++) {
    var L = colA1_(col);
    sh.getRange(15, col).setFormula('=IFERROR(SUM(' + L + '3:' + L + '14),0)');
    sh.getRange(16, col).setFormula('=IFERROR(AVERAGE(' + L + '3:' + L + '14),0)');
  }
  sh.getRange(15, 2, 2, 14).setBackground('#dfe6ef').setFontWeight('bold');

  // Number formats
  fmtCol_(sh, [2,3,4,5,6,9,14,15], '"$"#,##0', 3, 14);   // dollars
  fmtCol_(sh, [7,8,10,11,12,13], '#,##0', 3, 14);        // counts
  sh.getRange(15, 2, 2, 14).setNumberFormat('"$"#,##0'); // totals row dollar-ish
  fmtCol_(sh, [7,8,10,11,12,13], '#,##0', 15, 16);

  // Column widths
  sh.setColumnWidth(1, 95);
  for (var c2 = 2; c2 <= 15; c2++) sh.setColumnWidth(c2, 110);
  sh.setColumnWidth(16, 150);
  sh.setColumnWidth(17, 160);

  sh.setFrozenRows(2);
  sh.setFrozenColumns(1);

  // A friendly note
  sh.getRange('A18').setValue(
    '↑ Only the yellow cells need typing. Material, Labor and G&A are your three cost buckets; ' +
    'everything else is sales & marketing counts. Leave a cell blank if you don\'t track it yet.')
    .setFontColor(C.sub).setFontStyle('italic');
  sh.getRange('A18:Q18').merge().setWrap(true);
}

/* ------------------------------------------------------------------ *
 *  TAB: METRICS  (auto-calculated ratios)
 * ------------------------------------------------------------------ */

function buildMetrics_(ss) {
  var sh = sheet_(ss, SHEETS.CALC, true);
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setTabColor('#5f6b7a');

  var headers = ['Month','Gross Profit $','Gross Profit %','Material %','Labor %','G&A %',
    'Net Profit $','Net Profit %','Cost / Lead','Cost / Click','Mktg % of Rev',
    'Estimate Rate','Close Rate','Avg Sale $','New Cust %','Lead Growth %','ROAS'];

  sh.getRange('A1:Q1').merge()
    .setValue('METRICS  —  auto-calculated from Monthly Input (do not edit)')
    .setBackground('#5f6b7a').setFontColor('#ffffff').setFontWeight('bold').setFontSize(12)
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 28);

  sh.getRange(2, 1, 1, headers.length).setValues([headers])
    .setBackground('#e8edf4').setFontWeight('bold').setWrap(true)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(2, 38);

  var I = "'Monthly Input'!";
  for (var r = 3; r <= 14; r++) {
    var ri = r; // same row index in Input
    f_(sh, 'A'+r, "="+I+"A"+ri);
    f_(sh, 'B'+r, "=IFERROR("+I+"B"+ri+"-"+I+"D"+ri+"-"+I+"E"+ri+",\"\")");          // gross profit $
    f_(sh, 'C'+r, "=IFERROR(B"+r+"/"+I+"B"+ri+",\"\")");                              // gp %
    f_(sh, 'D'+r, "=IFERROR("+I+"D"+ri+"/"+I+"B"+ri+",\"\")");                        // cogs %
    f_(sh, 'E'+r, "=IFERROR("+I+"E"+ri+"/"+I+"B"+ri+",\"\")");                        // labor %
    f_(sh, 'F'+r, "=IFERROR("+I+"F"+ri+"/"+I+"B"+ri+",\"\")");                        // g&a %
    f_(sh, 'G'+r, "=IFERROR(B"+r+"-"+I+"F"+ri+",\"\")");                              // net profit $
    f_(sh, 'H'+r, "=IFERROR(G"+r+"/"+I+"B"+ri+",\"\")");                              // net profit %
    f_(sh, 'I'+r, "=IFERROR("+I+"I"+ri+"/"+I+"G"+ri+",\"\")");                        // CPL
    f_(sh, 'J'+r, "=IFERROR("+I+"I"+ri+"/"+I+"J"+ri+",\"\")");                        // CPC
    f_(sh, 'K'+r, "=IFERROR("+I+"I"+ri+"/"+I+"B"+ri+",\"\")");                        // mktg % rev
    f_(sh, 'L'+r, "=IFERROR("+I+"K"+ri+"/"+I+"G"+ri+",\"\")");                        // estimate rate
    f_(sh, 'M'+r, "=IFERROR("+I+"L"+ri+"/"+I+"K"+ri+",\"\")");                        // close rate
    f_(sh, 'N'+r, "=IFERROR("+I+"C"+ri+"/"+I+"L"+ri+",\"\")");                        // avg sale
    f_(sh, 'O'+r, "=IFERROR("+I+"M"+ri+"/"+I+"L"+ri+",\"\")");                        // new cust %
    f_(sh, 'P'+r, "=IFERROR(("+I+"G"+ri+"-"+I+"H"+ri+")/"+I+"H"+ri+",\"\")");         // lead growth %
    f_(sh, 'Q'+r, "=IFERROR("+I+"O"+ri+"/"+I+"I"+ri+",\"\")");                        // ROAS
  }

  // Formats
  fmtCol_(sh, [2,7,14], '"$"#,##0', 3, 14);
  fmtCol_(sh, [3,4,5,6,8,11,12,13,15,16], '0.0%', 3, 14);
  fmtCol_(sh, [9,10], '"$"#,##0', 3, 14);
  fmtCol_(sh, [17], '0.0"x"', 3, 14);

  sh.getRange(3,1,12,1).setFontWeight('bold').setBackground('#eef2f7');
  sh.setColumnWidth(1, 90);
  for (var c = 2; c <= 17; c++) sh.setColumnWidth(c, 92);
  sh.setFrozenRows(2);
  sh.setFrozenColumns(1);
}

/* ------------------------------------------------------------------ *
 *  TAB: DASHBOARD  (the CEO view)
 * ------------------------------------------------------------------ */

function buildDash_(ss) {
  var sh = sheet_(ss, SHEETS.DASH, true);
  sh.clear();
  sh.clearConditionalFormatRules();
  sh.setHiddenGridlines(true);
  sh.setTabColor(C.green);

  // Column widths shape the whole layout
  var widths = [220, 130, 120, 150, 110, 230];
  for (var i = 0; i < widths.length; i++) sh.setColumnWidth(i + 1, widths[i]);
  // hidden helper columns N..R
  for (var h = 14; h <= 18; h++) sh.setColumnWidth(h, 90);

  // ---- Title ----
  sh.getRange('A1:F1').merge()
    .setValue('SIGN SHOP CONSULTING  —  CEO DASHBOARD')
    .setBackground(C.band).setFontColor('#ffffff').setFontWeight('bold').setFontSize(16)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  // ---- Shop + Month selector ----
  sh.getRange('A2').setValue('Shop:').setFontWeight('bold').setHorizontalAlignment('right');
  sh.getRange('B2:C2').merge().setValue('My Sign Shop').setBackground(C.editBg)
    .setFontWeight('bold').setHorizontalAlignment('left');
  sh.getRange('D2').setValue('Showing month:').setFontWeight('bold').setHorizontalAlignment('right');
  sh.getRange('E2:F2').merge().setValue('December').setBackground(C.editBg).setFontWeight('bold');
  var monthRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(MONTHS, true).setAllowInvalid(false).build();
  sh.getRange('E2').setDataValidation(monthRule);
  sh.setRowHeight(2, 26);

  // idx of selected month (hidden helper)
  f_(sh, 'R1', "=IFERROR(MATCH($E$2,'Monthly Input'!$A$3:$A$14,0),12)");

  // ---- Health score hero ----
  sh.getRange('A4:B8').merge()
    .setFormula('=IFERROR(ROUND($A$10*0.40+$C$10*0.25+$E$10*0.20+$G$10*0.15,0),0)')
    .setFontSize(64).setFontWeight('bold').setHorizontalAlignment('center')
    .setVerticalAlignment('middle').setBackground(C.card);
  sh.getRange('C4:F4').merge().setValue('OVERALL SHOP HEALTH')
    .setFontWeight('bold').setFontColor(C.sub).setFontSize(12).setVerticalAlignment('middle');
  sh.getRange('C5:F5').merge()
    .setFormula('=IFS($A$4>=90,"Grade A  —  Excellent",$A$4>=80,"Grade B  —  Strong",$A$4>=70,"Grade C  —  Okay",$A$4>=60,"Grade D  —  Soft",TRUE,"Grade F  —  Needs Work")')
    .setFontSize(20).setFontWeight('bold').setVerticalAlignment('middle');
  sh.getRange('C6:F6').merge()
    .setFormula('=IF($A$4>=80,"● GOING GREAT",IF($A$4>=60,"● TRENDING — watch the yellows below","● NEEDS ATTENTION — see actions below"))')
    .setFontWeight('bold').setVerticalAlignment('middle');
  sh.getRange('C7:F8').merge()
    .setFormula('="Score blends Profitability (40%), Sales (25%), Marketing (20%) and Growth (15%) for "&$E$2&". 100 = every KPI at goal."')
    .setFontColor(C.sub).setFontStyle('italic').setWrap(true).setVerticalAlignment('top');
  for (var rr = 4; rr <= 8; rr++) sh.setRowHeight(rr, 28);

  // ---- Pillar cards (row 9 label, row 10 score) — each merged across 2 columns ----
  var cards = [
    {name:'Profitability', lab:'A9:B9', val:'A10:B10'},
    {name:'Sales',         lab:'C9:D9', val:'C10:D10'},
    {name:'Marketing',     lab:'E9:F9', val:'E10:F10'},
    {name:'Growth',        lab:'G9:H9', val:'G10:H10'},
  ];
  cards.forEach(function (card) {
    var w = 0;
    PILLARS.forEach(function (p) { if (p.name === card.name) w = p.weight; });
    sh.getRange(card.lab).merge()
      .setValue(card.name.toUpperCase() + '  (' + Math.round(w * 100) + '%)')
      .setFontWeight('bold').setFontColor(C.sub).setFontSize(10).setHorizontalAlignment('center');
    sh.getRange(card.val).merge()
      .setFormula('=IFERROR(ROUND(AVERAGEIFS($P$13:$P$25,$O$13:$O$25,"' + card.name + '"),0),0)')
      .setFontSize(26).setFontWeight('bold').setHorizontalAlignment('center')
      .setVerticalAlignment('middle').setBackground(C.card);
  });
  sh.setRowHeight(9, 20); sh.setRowHeight(10, 42);

  // ---- KPI table ----
  var hdrRow = 12;
  sh.getRange(hdrRow, 1, 1, 6)
    .setValues([['KPI  (' + '=month' + ')', 'This Month', 'Your Goal', 'Industry', 'Status', '12-Month Trend']]);
  sh.getRange(hdrRow, 1).setFormula('="KPI  —  "&$E$2');
  sh.getRange(hdrRow, 1, 1, 6).setBackground(C.band).setFontColor('#ffffff')
    .setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(hdrRow, 28);

  var first = hdrRow + 1; // row 13
  KPIS.forEach(function (k, idx) {
    var r = first + idx;
    sh.getRange('A'+r).setValue(k.name).setFontWeight('bold').setVerticalAlignment('middle');
    f_(sh, 'B'+r, '=IFERROR(INDEX('+k.src+',$R$1),"")');
    sh.getRange('B'+r).setNumberFormat(k.fmt).setHorizontalAlignment('center');
    sh.getRange('C'+r).setValue(k.goal).setNumberFormat(k.fmt)
      .setHorizontalAlignment('center').setBackground(C.editBg); // editable goal
    sh.getRange('D'+r).setValue(k.bench).setFontColor(C.sub).setHorizontalAlignment('center');
    // Status text from score
    f_(sh, 'E'+r, '=IF($P'+r+'="","",IF($P'+r+'>=80,"GOOD",IF($P'+r+'>=60,"WATCH","LOW")))');
    sh.getRange('E'+r).setFontWeight('bold').setHorizontalAlignment('center');
    // Sparkline trend
    f_(sh, 'F'+r, '=IFERROR(SPARKLINE('+k.src+',{"charttype","line";"linewidth",2;"color","'+C.blue+'";"empty","ignore"}),"")');
    // Hidden helpers: N=dir, O=pillar, P=score(0-100)
    sh.getRange('N'+r).setValue(k.dir);
    sh.getRange('O'+r).setValue(k.pillar);
    f_(sh, 'P'+r, '=IFERROR(IF($B'+r+'="","",MIN(100,ROUND(IF($N'+r+'=1,$B'+r+'/$C'+r+',$C'+r+'/$B'+r+')*100,0))),"")');

    sh.setRowHeight(r, 26);
    if (idx % 2 === 1) sh.getRange('A'+r+':F'+r).setBackground('#f7f9fc');
  });
  var last = first + KPIS.length - 1;

  // Thin separators between pillars in the KPI table
  sh.getRange('A'+first+':F'+last).setBorder(true, true, true, true, false, true, C.line, SpreadsheetApp.BorderStyle.SOLID);

  // ---- What To Do Next ----
  var aRow = last + 2;
  sh.getRange(aRow, 1, 1, 6).merge().setValue('✅  WHAT TO DO NEXT  —  this month’s priorities')
    .setBackground(C.navy).setFontColor('#ffffff').setFontWeight('bold').setFontSize(12)
    .setVerticalAlignment('middle');
  sh.setRowHeight(aRow, 28);

  // Map KPI name -> its table row, so the rules can reference live values.
  var rowOf = {};
  KPIS.forEach(function (k, idx) { rowOf[k.name] = first + idx; });
  var gp = rowOf['Gross Profit %'], np = rowOf['Net Profit %'], cogs = rowOf['Material / COGS %'],
      lab = rowOf['Direct Labor %'], ga = rowOf['G&A / Overhead %'], close = rowOf['Close Rate % (orders/est)'],
      cpl = rowOf['Cost per Lead $'], roas = rowOf['ROAS (mktg sales/spend)'], lead = rowOf['Lead Growth % (YoY)'],
      mkt = rowOf['Marketing % of Revenue'];

  var g = function (row) { return '$B' + row + '<>""'; }; // "has data" guard
  var rules = [
    '=IF(AND('+g(np)+',$B'+np+'<$C'+np+'),"💰 Net profit "&TEXT($B'+np+',"0.0%")&" is below your "&TEXT($C'+np+',"0%")&" target — review overhead (G&A), pricing and shop rate.","")',
    '=IF(AND('+g(gp)+',$B'+gp+'<$C'+gp+'),"📉 Gross margin "&TEXT($B'+gp+',"0.0%")&" is under "&TEXT($C'+gp+',"0%")&" — check material waste, job costing and quoting accuracy.","")',
    '=IF(AND('+g(cogs)+',$B'+cogs+'>$C'+cogs+'),"🧱 Material cost "&TEXT($B'+cogs+',"0.0%")&" exceeds the "&TEXT($C'+cogs+',"0%")&" target — re-quote suppliers and cut scrap.","")',
    '=IF(AND('+g(lab)+',$B'+lab+'>$C'+lab+'),"🛠️ Direct labor "&TEXT($B'+lab+',"0.0%")&" is high vs "&TEXT($C'+lab+',"0%")&" — tighten scheduling and production efficiency.","")',
    '=IF(AND('+g(ga)+',$B'+ga+'>$C'+ga+'),"🏢 Overhead "&TEXT($B'+ga+',"0.0%")&" is above "&TEXT($C'+ga+',"0%")&" — every fixed cost should earn its keep.","")',
    '=IF(AND('+g(close)+',$B'+close+'<$C'+close+'),"🎯 Close rate "&TEXT($B'+close+',"0.0%")&" is below "&TEXT($C'+close+',"0%")&" — add estimate follow-up within 48 hrs.","")',
    '=IF(AND('+g(cpl)+',$B'+cpl+'>$C'+cpl+'),"📣 Cost per lead "&TEXT($B'+cpl+',"$0")&" is above "&TEXT($C'+cpl+',"$0")&" — review ad targeting and channel mix.","")',
    '=IF(AND('+g(roas)+',$B'+roas+'<$C'+roas+'),"📊 ROAS "&TEXT($B'+roas+',"0.0")&"x is under "&TEXT($C'+roas+',"0.0")&"x — shift spend to your best-performing channels.","")',
    '=IF(AND('+g(lead)+',$B'+lead+'<$C'+lead+'),"🌱 Lead growth "&TEXT($B'+lead+',"0.0%")&" is below the "&TEXT($C'+lead+',"0%")&" goal — invest in referrals and marketing.","")',
    '=IF(AND('+g(mkt)+',$B'+mkt+'>$C'+mkt+'*1.5),"🔎 Marketing is "&TEXT($B'+mkt+',"0.0%")&" of revenue (>1.5× target) — make sure that spend is converting.","")',
  ];
  for (var ai = 0; ai < rules.length; ai++) {
    var rr2 = aRow + 1 + ai;
    sh.getRange(rr2, 1, 1, 6).merge().setFormula(rules[ai]).setWrap(true).setVerticalAlignment('middle');
    sh.setRowHeight(rr2, 22);
  }
  // All-clear line
  var clearRow = aRow + 1 + rules.length;
  sh.getRange(clearRow, 1, 1, 6).merge().setFormula(
    '=IF(COUNTBLANK($A'+(aRow+1)+':$A'+(aRow+rules.length)+')=' + rules.length +
    ',"✅ Every key metric is at or above target this month — keep doing what you’re doing.","")')
    .setWrap(true).setFontWeight('bold').setFontColor(C.green);
  sh.setRowHeight(clearRow, 22);

  // ---- Conditional formatting (scores + status) ----
  var rules2 = [];
  // Hero score
  rules2.push(cfNum_(sh, 'A4', '>=', 80, C.green, C.greenBg));
  rules2.push(cfBetween_(sh, 'A4', 60, 79.999, C.yellow, C.yellowBg));
  rules2.push(cfNum_(sh, 'A4', '<', 60, C.red, C.redBg));
  // Pillar cards
  ['A10','C10','E10','G10'].forEach(function (cell) {
    rules2.push(cfNum_(sh, cell, '>=', 80, C.green, C.greenBg));
    rules2.push(cfBetween_(sh, cell, 60, 79.999, C.yellow, C.yellowBg));
    rules2.push(cfNum_(sh, cell, '<', 60, C.red, C.redBg));
  });
  // Status column E in KPI table
  var statRange = 'E' + first + ':E' + last;
  rules2.push(cfText_(sh, statRange, 'GOOD', C.green, C.greenBg));
  rules2.push(cfText_(sh, statRange, 'WATCH', C.yellow, C.yellowBg));
  rules2.push(cfText_(sh, statRange, 'LOW', C.red, C.redBg));
  sh.setConditionalFormatRules(rules2);

  // Hide helper columns
  sh.hideColumns(14, 5); // N..R

  sh.setFrozenRows(2);
}

/* ------------------------------------------------------------------ *
 *  TAB: CALL LOG
 * ------------------------------------------------------------------ */

function buildLog_(ss) {
  var sh = sheet_(ss, SHEETS.LOG, true);
  if (sh.getLastRow() > 1) return; // don't wipe existing notes on rebuild
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setTabColor('#8e7cc3');

  sh.getRange('A1:E1').merge().setValue('CONSULTING CALL LOG')
    .setBackground(C.band).setFontColor('#ffffff').setFontWeight('bold').setFontSize(12)
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 28);

  var hdr = ['Date','Call #','Call Type','Notes / Commitments','Done?'];
  sh.getRange(2,1,1,5).setValues([hdr]).setBackground('#e8edf4').setFontWeight('bold')
    .setHorizontalAlignment('center');
  var doneRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  sh.getRange(3,5,200,1).setDataValidation(doneRule);

  sh.setColumnWidth(1, 110); sh.setColumnWidth(2, 70); sh.setColumnWidth(3, 140);
  sh.setColumnWidth(4, 520); sh.setColumnWidth(5, 60);
  sh.getRange(3,4,200,1).setWrap(true);
  sh.setFrozenRows(2);
}

/* ------------------------------------------------------------------ *
 *  TAB: READ ME
 * ------------------------------------------------------------------ */

function buildHelp_(ss) {
  var sh = sheet_(ss, SHEETS.HELP, true);
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setTabColor('#cccccc');
  sh.setColumnWidth(1, 900);

  var lines = [
    ['SIGN SHOP CEO DASHBOARD — HOW IT WORKS', 'title'],
    ['', ''],
    ['1) Each month, fill in the "Monthly Input" tab (yellow cells only).', 'h'],
    ['     • Three cost buckets: Material/COGS, Direct Labor, G&A/Overhead.', 'b'],
    ['     • Sales & marketing counts: leads, spend, clicks, estimates, orders, new customers.', 'b'],
    ['     • Top Industry / Top Product are free text.', 'b'],
    ['', ''],
    ['2) The "Metrics" tab calculates every ratio automatically. You never edit it.', 'h'],
    ['', ''],
    ['3) The "Dashboard" tab is the owner view:', 'h'],
    ['     • Pick the month at the top to change everything below it.', 'b'],
    ['     • Health Score (0–100) blends four pillars vs your goals:', 'b'],
    ['            Profitability 40%  ·  Sales 25%  ·  Marketing 20%  ·  Growth 15%.', 'b'],
    ['     • Each KPI shows This Month vs Your Goal vs Industry range, a status, and a 12-month trend.', 'b'],
    ['     • "What To Do Next" auto-writes the priorities based on what is off target.', 'b'],
    ['', ''],
    ['SCORING: each KPI scores 0–100 = how close you are to goal (capped at 100).', 'h'],
    ['     For "lower is better" metrics (COGS %, Labor %, CPL...) the math inverts automatically.', 'b'],
    ['     GOOD ≥ 80   ·   WATCH 60–79   ·   LOW < 60.', 'b'],
    ['', ''],
    ['EDIT YOUR TARGETS: the "Your Goal" column on the Dashboard (yellow) is yours to change.', 'h'],
    ['Industry ranges shown are rules of thumb for custom sign/wrap shops — adjust to your market.', 'b'],
    ['', ''],
    ['DEFINITIONS (all ratios use Total Revenue as the base, standard P&L common-sizing):', 'h'],
    ['     Gross Profit = Revenue − Material − Direct Labor.', 'b'],
    ['     Net Profit   = Gross Profit − G&A/Overhead.', 'b'],
    ['     Close Rate   = Orders ÷ Estimates.    Estimate Rate = Estimates ÷ Leads.', 'b'],
    ['     ROAS         = Marketing Sales ÷ Marketing Spend.    CPL = Spend ÷ Leads.', 'b'],
    ['', ''],
    ['MORE THAN ONE SHOP? Make a copy of this whole file per client and change the Shop name.', 'h'],
    ['Same structure, separate data — and it migrates cleanly to a multi-shop tool later.', 'b'],
  ];
  for (var i = 0; i < lines.length; i++) {
    var cell = sh.getRange(i + 1, 1).setValue(lines[i][0]).setWrap(true);
    if (lines[i][1] === 'title') cell.setFontSize(16).setFontWeight('bold').setFontColor(C.navy);
    else if (lines[i][1] === 'h') cell.setFontWeight('bold').setFontColor(C.ink);
    else cell.setFontColor(C.sub);
  }
}

/* ------------------------------------------------------------------ *
 *  SAMPLE DATA  (realistic 12-month demo — clearly replaceable)
 * ------------------------------------------------------------------ */

function loadSampleData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = sheet_(ss, SHEETS.INPUT);
  if (!sh) { buildDashboard(); sh = sheet_(ss, SHEETS.INPUT); }

  // Authentic funnel numbers from the original consulting sheet.
  // [revenue, bookedSales, leads, leadYoY, cpl, cpc, estimates, orders, newCustPct,
  //  signsWrapSales, mktgSales, topIndustry, topProduct]
  var f = [
    [97731.62,  89857.76, 144, null,  59.73, 132.32,  92,  65, 0.891,  73909.00, 23822.62, 'Service Business',     'Vinyl'],
    [129048.88,105810.78, 157, 0.22,  64.38, 117.53, 141,  86, 0.891,  90097.88, 38951.00, 'Professional Services','Labor'],
    [211995.09,122392.89, 223, 0.12,  37.71,  68.93, 168, 122, 0.840, 168429.09, 43566.00, 'Healthcare',           'Labor'],
    [216581.99,149406.34, 283,-0.085, 34.57,  86.58, 155, 113, 0.810, 175241.99, 41340.00, 'Professional Services','Custom Work'],
    [170184.43,109582.34, 198, 0.33,  35.38,  78.72, 134,  89, 0.885, 140031.93, 30152.50, 'Service Business',     'Custom Work'],
    [186597.55,133404.73, 130,-0.32,  40.77,  65.43, 138,  81, 0.855, 154463.05, 32134.50, 'Service Business',     'Labor'],
    [165532.56,101180.32, 106,-0.35,  60.60,  83.42, 128,  77, 0.928, 139964.56, 25568.00, 'Service Business',     'Vinyl'],
    [178559.89,209662.50, 157,-0.06,  31.78,  39.28, 173, 127, 0.767, 147774.39, 30785.50, 'Service Business',     'Labor'],
    [160330.94,241093.08, 198, 0.21,  24.33,  37.93, 137, 102, 0.844, 135914.44, 24416.50, 'Service Business',     'Installation'],
    [168982.12,120187.99, 213, 0.11,  30.16,  60.59, 164, 106, 0.849, 136472.87, 32509.25, 'Healthcare',           'Vehicle Wraps'],
    [184531.00,146359.77, 192, 0.31,  31.25,  75.95, 137,  79, 0.910, 157010.00, 27521.00, 'Faith-based',          'Installation'],
    [118273.44,103125.08, 143, 0.04,  41.96, 103.45, 106,  58, 0.896,  88533.94, 29739.50, 'Beauty',               'Installation'],
  ];
  // Cost structure as % of revenue (varied so some months flag yellow/red).
  var cogsP  = [0.30,0.29,0.27,0.26,0.28,0.33,0.28,0.27,0.29,0.30,0.32,0.31];
  var laborP = [0.23,0.22,0.20,0.21,0.22,0.24,0.27,0.21,0.20,0.22,0.23,0.25];
  var gaP    = [0.35,0.34,0.33,0.32,0.34,0.38,0.36,0.33,0.32,0.34,0.35,0.39];

  var rows = [];
  for (var i = 0; i < 12; i++) {
    var rev = f[i][0];
    var leads = f[i][2];
    var spend = Math.round(f[i][4] * leads);             // CPL × leads
    var clicks = Math.round(spend / f[i][5]);            // spend ÷ CPC
    var orders = f[i][7];
    var newCust = Math.round(f[i][8] * orders);
    var priorLeads = (f[i][3] == null) ? '' : Math.round(leads / (1 + f[i][3]));
    rows.push([
      Math.round(rev),                 // B revenue
      Math.round(f[i][1]),             // C booked sales
      Math.round(rev * cogsP[i]),      // D material
      Math.round(rev * laborP[i]),     // E labor
      Math.round(rev * gaP[i]),        // F g&a
      leads,                           // G leads
      priorLeads,                      // H prior-yr leads
      spend,                           // I marketing spend
      clicks,                          // J clicks
      f[i][6],                         // K estimates
      orders,                          // L orders
      newCust,                         // M new customers
      Math.round(f[i][9]),             // N signs & wraps sales
      Math.round(f[i][10]),            // O marketing sales
      f[i][11],                        // P top industry
      f[i][12],                        // Q top product
    ]);
  }
  sh.getRange(3, 2, 12, 16).setValues(rows);
  SpreadsheetApp.getActiveSpreadsheet().toast('Loaded 12 months of sample data. Replace with your real numbers any time.', 'Sample data', 6);
}

function clearData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resp = SpreadsheetApp.getUi().alert('Clear all monthly data?',
    'This wipes the numbers on "Monthly Input". Layout and formulas stay.',
    SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);
  if (resp !== SpreadsheetApp.getUi().Button.OK) return;
  var sh = sheet_(ss, SHEETS.INPUT);
  if (sh) sh.getRange(3, 2, 12, 16).clearContent();
}

/* ------------------------------------------------------------------ *
 *  HELPERS
 * ------------------------------------------------------------------ */

function sheet_(ss, name, createIfMissing) {
  var sh = ss.getSheetByName(name);
  if (!sh && createIfMissing) sh = ss.insertSheet(name);
  return sh;
}

function f_(sh, a1, formula) { sh.getRange(a1).setFormula(formula); }

function colA1_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}

function fmtCol_(sh, cols, fmt, r1, r2) {
  for (var i = 0; i < cols.length; i++) {
    sh.getRange(r1, cols[i], r2 - r1 + 1, 1).setNumberFormat(fmt);
  }
}

function reorder_(ss, order) {
  for (var i = 0; i < order.length; i++) {
    var sh = ss.getSheetByName(order[i]);
    if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
  }
  // Remove the default "Sheet1" if it's empty and unused.
  var def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) { try { ss.deleteSheet(def); } catch (e) {} }
}

function cfNum_(sh, range, op, val, font, bg) {
  var b = SpreadsheetApp.newConditionalFormatRule().setRanges([sh.getRange(range)]);
  if (op === '>=') b = b.whenNumberGreaterThanOrEqualTo(val);
  else if (op === '<') b = b.whenNumberLessThan(val);
  return b.setBackground(bg).setFontColor(font).build();
}

function cfBetween_(sh, range, lo, hi, font, bg) {
  return SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sh.getRange(range)])
    .whenNumberBetween(lo, hi).setBackground(bg).setFontColor(font).build();
}

function cfText_(sh, range, text, font, bg) {
  return SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sh.getRange(range)])
    .whenTextEqualTo(text).setBackground(bg).setFontColor(font).build();
}
