import assert from 'node:assert';
import {
  DEFAULT_CANONICAL_SYMBOLS,
  DEFAULT_SYMBOL_MAPPING,
  toBrokerSymbol,
  toCanonicalSymbol,
  detectBrokerMapping,
  translateTickBatchToCanonical,
  setServerSymbolMapping,
  getServerSymbolMapping,
} from './lib/symbols/mapping.js';
import { canonOf } from './lib/autonomous/symbols.js';
import { getSymbolAliases } from './lib/watchlistAliases.js';
import { resolveSymbolDrawings } from './lib/draw/useDrawings.js';

console.log('--- Centralized Symbol Mapping Test Suite ---');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error('    Error:', err.message);
    failed++;
  }
}

// 1. Registry verification
it('contains canonical registry with essential assets', () => {
  const syms = DEFAULT_CANONICAL_SYMBOLS.map(s => s.symbol);
  assert(syms.includes('NAS100'), 'NAS100 should be in registry');
  assert(syms.includes('DJ30'), 'DJ30 should be in registry');
  assert(syms.includes('SP500'), 'SP500 should be in registry');
  assert(syms.includes('XAUUSD'), 'XAUUSD should be in registry');
  assert(syms.includes('EURUSD'), 'EURUSD should be in registry');
  assert(syms.includes('BTCUSD'), 'BTCUSD should be in registry');
});

// 2. toBrokerSymbol with empty configuration
it('toBrokerSymbol returns canonical if no customMap or suffix', () => {
  const emptyCfg = { forexSuffix: '', generalSuffix: '', customMap: {} };
  assert.strictEqual(toBrokerSymbol('NAS100', emptyCfg), 'NAS100');
  assert.strictEqual(toBrokerSymbol('EURUSD', emptyCfg), 'EURUSD');
  assert.strictEqual(toBrokerSymbol('XAUUSD', emptyCfg), 'XAUUSD');
});

// 3. toBrokerSymbol with customMap overrides
it('toBrokerSymbol respects customMap overrides', () => {
  const cfg = {
    forexSuffix: '',
    generalSuffix: '',
    customMap: {
      NAS100: 'USTEC',
      DJ30: 'US30',
      SP500: 'US500',
      XAUUSD: 'GOLD',
    },
  };
  assert.strictEqual(toBrokerSymbol('NAS100', cfg), 'USTEC');
  assert.strictEqual(toBrokerSymbol('DJ30', cfg), 'US30');
  assert.strictEqual(toBrokerSymbol('SP500', cfg), 'US500');
  assert.strictEqual(toBrokerSymbol('XAUUSD', cfg), 'GOLD');
  assert.strictEqual(toBrokerSymbol('EURUSD', cfg), 'EURUSD');
});

// 4. toBrokerSymbol with forex suffix
it('toBrokerSymbol applies forexSuffix only to forex pairs', () => {
  const cfg = {
    forexSuffix: '.i',
    generalSuffix: '',
    customMap: {
      NAS100: 'USTEC',
    },
  };
  assert.strictEqual(toBrokerSymbol('EURUSD', cfg), 'EURUSD.i');
  assert.strictEqual(toBrokerSymbol('GBPUSD', cfg), 'GBPUSD.i');
  assert.strictEqual(toBrokerSymbol('USDJPY', cfg), 'USDJPY.i');
  // Indices & metals should not get forex suffix
  assert.strictEqual(toBrokerSymbol('NAS100', cfg), 'USTEC');
  assert.strictEqual(toBrokerSymbol('XAUUSD', cfg), 'XAUUSD');
  assert.strictEqual(toBrokerSymbol('BTCUSD', cfg), 'BTCUSD');
});

// 5. toBrokerSymbol with general suffix
it('toBrokerSymbol applies generalSuffix when forexSuffix is empty', () => {
  const cfg = {
    forexSuffix: '',
    generalSuffix: '_raw',
    customMap: {},
  };
  assert.strictEqual(toBrokerSymbol('EURUSD', cfg), 'EURUSD_raw');
  assert.strictEqual(toBrokerSymbol('NAS100', cfg), 'NAS100_raw');
});

// 6. toCanonicalSymbol reverse resolution
it('toCanonicalSymbol maps broker symbol back to canonical', () => {
  const cfg = {
    forexSuffix: '.i',
    generalSuffix: '',
    customMap: {
      NAS100: 'USTEC',
      DJ30: 'US30',
      SP500: 'US500',
      XAUUSD: 'GOLD',
    },
  };
  assert.strictEqual(toCanonicalSymbol('USTEC', cfg), 'NAS100');
  assert.strictEqual(toCanonicalSymbol('US30', cfg), 'DJ30');
  assert.strictEqual(toCanonicalSymbol('US500', cfg), 'SP500');
  assert.strictEqual(toCanonicalSymbol('GOLD', cfg), 'XAUUSD');
  assert.strictEqual(toCanonicalSymbol('EURUSD.i', cfg), 'EURUSD');
  assert.strictEqual(toCanonicalSymbol('GBPUSD.I', cfg), 'GBPUSD'); // case insensitive suffix
  assert.strictEqual(toCanonicalSymbol('NAS100', cfg), 'NAS100');
});

// 7. toCanonicalSymbol heuristic fallback when customMap is empty
it('toCanonicalSymbol handles heuristic aliases without explicit customMap', () => {
  const cfg = { forexSuffix: '', generalSuffix: '', customMap: {} };
  assert.strictEqual(toCanonicalSymbol('USTEC', cfg), 'NAS100');
  assert.strictEqual(toCanonicalSymbol('US100', cfg), 'NAS100');
  assert.strictEqual(toCanonicalSymbol('NAS100.cash', cfg), 'NAS100');
  assert.strictEqual(toCanonicalSymbol('US30', cfg), 'DJ30');
  assert.strictEqual(toCanonicalSymbol('US30.cash', cfg), 'DJ30');
  assert.strictEqual(toCanonicalSymbol('US500', cfg), 'SP500');
  assert.strictEqual(toCanonicalSymbol('GOLD', cfg), 'XAUUSD');
  assert.strictEqual(toCanonicalSymbol('EURUSD.i', cfg), 'EURUSD');
  assert.strictEqual(toCanonicalSymbol('EURUSD.pro', cfg), 'EURUSD');
  assert.strictEqual(toCanonicalSymbol('EURUSD_m', cfg), 'EURUSD');
});

// 8. Auto-detection engine
it('detectBrokerMapping discovers suffix and aliases from broker list', () => {
  const mockBrokerList = [
    'EURUSD.I', 'GBPUSD.I', 'USDJPY.I', 'AUDUSD.I', 'USDCAD.I',
    'USTEC', 'US30', 'US500', 'GOLD', 'DE40', 'BTCUSD'
  ];
  const detected = detectBrokerMapping(mockBrokerList);
  assert.strictEqual(detected.forexSuffix, '.I');
  assert.strictEqual(detected.customMap['NAS100'], 'USTEC');
  assert.strictEqual(detected.customMap['DJ30'], 'US30');
  assert.strictEqual(detected.customMap['SP500'], 'US500');
  assert.strictEqual(detected.customMap['XAUUSD'], 'GOLD');
  assert.strictEqual(detected.customMap['GER40'], 'DE40');
});

// 9. Tick batch translation
it('translateTickBatchToCanonical translates broker tick keys to canonical keys', () => {
  const cfg = {
    forexSuffix: '.I',
    generalSuffix: '',
    customMap: { NAS100: 'USTEC', DJ30: 'US30' },
  };
  const rawBatch = {
    'USTEC': { bid: 20100, ask: 20101, symbol: 'USTEC' },
    'US30': { bid: 42000, ask: 42002, symbol: 'US30' },
    'EURUSD.I': { bid: 1.0850, ask: 1.0851, symbol: 'EURUSD.I' },
  };
  const canonicalBatch = translateTickBatchToCanonical(rawBatch, cfg);
  assert(canonicalBatch['NAS100'], 'should have NAS100');
  assert.strictEqual(canonicalBatch['NAS100'].symbol, 'NAS100');
  assert.strictEqual(canonicalBatch['NAS100'].bid, 20100);

  assert(canonicalBatch['DJ30'], 'should have DJ30');
  assert.strictEqual(canonicalBatch['DJ30'].symbol, 'DJ30');
  assert.strictEqual(canonicalBatch['DJ30'].bid, 42000);

  assert(canonicalBatch['EURUSD'], 'should have EURUSD');
  assert.strictEqual(canonicalBatch['EURUSD'].symbol, 'EURUSD');
  assert.strictEqual(canonicalBatch['EURUSD'].bid, 1.0850);
});

// 10. Autonomous symbol canonOf integration
it('canonOf in lib/autonomous/symbols.js maps to centralized canonical names', () => {
  assert.strictEqual(canonOf('NAS100'), 'NAS100');
  assert.strictEqual(canonOf('USTEC'), 'NAS100');
  assert.strictEqual(canonOf('US100'), 'NAS100');
  assert.strictEqual(canonOf('US30'), 'DJ30');
  assert.strictEqual(canonOf('DJ30'), 'DJ30');
  assert.strictEqual(canonOf('US500'), 'SP500');
  assert.strictEqual(canonOf('SP500'), 'SP500');
  assert.strictEqual(canonOf('EURUSD.I'), 'EURUSD');
});

// 11. Watchlist aliases integration
it('getSymbolAliases returns canonical symbols and broker variants', () => {
  const aliases = getSymbolAliases('NAS100');
  assert(aliases.includes('NAS100'), 'aliases should include NAS100');
  assert(aliases.includes('USTEC'), 'aliases should include USTEC');
  assert(aliases.includes('US100'), 'aliases should include US100');

  const goldAliases = getSymbolAliases('XAUUSD');
  assert(goldAliases.includes('XAUUSD'), 'aliases should include XAUUSD');
  assert(goldAliases.includes('GOLD'), 'aliases should include GOLD');
});

// 12. Drawing resolution integration across symbol transitions
it('resolveSymbolDrawings resolves drawings stored under canonical, broker, or legacy alias', () => {
  const drawingsDb = {
    'USTEC': [{ id: 1, type: 'rect' }],
    'DJ30': [{ id: 2, type: 'ray' }],
  };

  // Searching for NAS100 should find USTEC drawings
  const nasDrawings = resolveSymbolDrawings(drawingsDb, 'NAS100');
  assert.strictEqual(nasDrawings.length, 1);
  assert.strictEqual(nasDrawings[0].id, 1);

  // Searching for DJ30 should find DJ30 drawings
  const djDrawings = resolveSymbolDrawings(drawingsDb, 'DJ30');
  assert.strictEqual(djDrawings.length, 1);
  assert.strictEqual(djDrawings[0].id, 2);

  // Searching for US30 should also find DJ30 drawings
  const us30Drawings = resolveSymbolDrawings(drawingsDb, 'US30');
  assert.strictEqual(us30Drawings.length, 1);
  assert.strictEqual(us30Drawings[0].id, 2);
});

// 13. In-memory hot-reload via setServerSymbolMapping
it('setServerSymbolMapping updates active server configuration in-memory', () => {
  setServerSymbolMapping({
    forexSuffix: '.ecn',
    generalSuffix: '',
    customMap: { NAS100: 'NAS100.vip' },
  });
  const current = getServerSymbolMapping();
  assert.strictEqual(current.forexSuffix, '.ecn');
  assert.strictEqual(toBrokerSymbol('NAS100'), 'NAS100.vip');
  assert.strictEqual(toBrokerSymbol('EURUSD'), 'EURUSD.ecn');
  assert.strictEqual(toCanonicalSymbol('NAS100.vip'), 'NAS100');

  // Reset to default
  setServerSymbolMapping(DEFAULT_SYMBOL_MAPPING);
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Centralized Symbol Mapping tests PASSED!');
}
