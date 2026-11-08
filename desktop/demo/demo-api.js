// Demo mode only (npm run demo): in-memory stand-in for the preload API (window.capsuleers),
// used to take README screenshots. Every pilot, corporation and alliance below is invented;
// nothing is read from the machine or sent over the network. Never part of the packaged app.
(() => {
  const listeners = {};
  const on = (k) => (cb) => { (listeners[k] ||= []).push(cb); };
  const fire = (k, p) => (listeners[k] || []).forEach((cb) => cb(p));
  const NOW = Date.now();
  const h = (n) => NOW + n * 3600_000;

  const ALLI = {
    vk: [99100001, 'Vanguard Kestrel Pact', 'VKP'],
    ob: [99100002, 'Obsidian Meridian Accord', 'OMA'],
    ts: [99100003, 'Tidewater Syndicate', 'TIDE'],
  };
  const CORP = {
    a: [98200001, 'Kestrel Vanguard Armada', 'KVA', 'vk'],
    b: [98200002, 'Ashen Lantern Collective', 'ALC', 'vk'],
    c: [98200003, 'Meridian Black Ledger', 'MBL', 'ob'],
    d: [98200004, 'Hollow Crown Logistics', 'HCL', 'ob'],
    e: [98200005, 'Tidewater Salvage Union', 'TSU', 'ts'],
    f: [98200006, 'Quiet Harbour Traders', 'QHT', null],
  };
  // id, name, corp, danger, kills, losses, window flags
  const P = [
    [91000001, 'Vael Korrin', 'a', 3, 214, 31, ['capital', 'FC:High', 'fleet']],
    [91000002, 'Sera Kovanth', 'a', 3, 167, 22, ['FC:Medium', 'fleet']],
    [91000003, 'Dren Alvaris', 'a', 2, 98, 40, ['logi', 'fleet']],
    [91000004, 'Kaelith Orne', 'b', 2, 76, 35, ['bait', 'small']],
    [91000005, 'Tobrix Maelen', 'b', 1, 33, 29, ['small']],
    [91000006, 'Jessa Varnholt', 'c', 3, 189, 18, ['capital', 'solo']],
    [91000007, 'Ryn Ostrava', 'c', 2, 64, 27, ['small']],
    [91000008, 'Lio Thessaly', 'd', 2, 58, 21, ['logi', 'fleet']],
    [91000009, 'Marek Duvall', 'd', 1, 19, 17, ['fleet']],
    [91000010, 'Nyx Talvera', 'e', 2, 82, 44, ['solo']],
    [91000011, 'Orrin Hastel', 'e', 1, 24, 30, ['small']],
    [91000012, 'Pell Ixanor', 'e', 0, 3, 5, ['small']],
    [91000013, 'Sable Quorin', 'f', 1, 12, 14, ['solo']],
    [91000014, 'Thane Brevik', 'f', 0, 1, 2, []],
  ];
  const rows = P.map(([id, name, c, danger, kills, losses, flags]) => {
    const corp = CORP[c], al = corp[3] ? ALLI[corp[3]] : null;
    return {
      name, id, danger, kills, losses, eff: null, window: 90, flags, found: true,
      corpId: corp[0], corpName: corp[1], corpTicker: corp[2],
      allianceId: al ? al[0] : null, allianceName: al ? al[1] : '', allianceTicker: al ? al[2] : '',
    };
  });
  rows.push({ name: 'Zeta Unlisted', id: null, danger: 0, kills: null, losses: null, eff: null, flags: [], found: false });
  const byId = Object.fromEntries(rows.filter((r) => r.id).map((r) => [r.id, r]));

  const SHIPS = [[11993, 'Cerberus'], [11978, 'Scimitar'], [17738, 'Machariel'], [24690, 'Hurricane Fleet Issue'], [11202, 'Ares']];
  const detail = (who) => {
    const r = byId[who.id] || rows[0];
    const others = rows.filter((x) => x.id && x.id !== r.id);
    const partners = others.filter((x) => x.corpId === r.corpId).concat(others.filter((x) => x.corpId !== r.corpId)).slice(0, 5)
      .map((x, i) => ({ id: x.id, name: x.name, count: 41 - i * 7 }));
    return {
      id: r.id, name: r.name, corpName: r.corpName, allianceName: r.allianceName,
      kills: r.kills, losses: r.losses, eff: Math.round((r.kills / Math.max(1, r.kills + r.losses)) * 100),
      capital_pilot: r.flags.includes('capital'), is_logi: r.flags.includes('logi'),
      fc: r.flags.find((f) => f.startsWith('FC:'))?.slice(3) || null, bait: r.flags.includes('bait') ? 'Medium' : null,
      play: { solo: 12, small: 21, fleet: 67 }, dominant: 'Fleet',
      partners, ships: SHIPS.map(([id, name], i) => ({ id, name, count: 18 - i * 3 })),
    };
  };

  const dscan = {
    total: 187, system: 'Teshkar',
    shipUnits: 96,
    shipClasses: [
      { cls: 'Dreadnought', count: 4, capital: true }, { cls: 'Carrier', count: 2, capital: true },
      { cls: 'Battleship', count: 14 }, { cls: 'Battlecruiser', count: 22 }, { cls: 'Heavy Assault Cruiser', count: 12 },
      { cls: 'Logistics', count: 9 }, { cls: 'Command Ship', count: 3 }, { cls: 'Cruiser', count: 11 },
      { cls: 'Interdictor', count: 5 }, { cls: 'Frigate', count: 8 }, { cls: 'Industrial', count: 6 },
    ].map((c, i) => ({ ...c, weight: 100 - i })),
    ships: [
      [17738, 'Machariel', 9], [24690, 'Hurricane Fleet Issue', 14], [11993, 'Cerberus', 8], [11978, 'Scimitar', 6],
      [19720, 'Revelation', 2], [19724, 'Moros', 2], [22442, 'Eos', 3], [12034, 'Sabre', 5],
      [11202, 'Ares', 4], [585, 'Slasher', 4], [29988, 'Proteus', 4], [11957, 'Falcon', 3],
    ].map(([typeId, name, count]) => ({ typeId, name, count })),
    other: [{ name: 'Drones', count: 52 }, { name: 'Structures', count: 7 }, { name: 'Deployables', count: 5 }, { name: 'Celestials', count: 21 }, { name: 'Others', count: 6 }],
  };

  const history = [
    { kind: 'intel', url: 'https://capsuleers.app/en/s/k3Qw9xT2', createdAt: NOW - 25 * 60_000, expiresAt: h(23.5), count: 15 },
    { kind: 'dscan', url: 'https://capsuleers.app/en/s/Bn7ZxLp4', createdAt: NOW - 3 * 3600_000, expiresAt: h(20.9), count: 187 },
    { kind: 'intel', url: 'https://capsuleers.app/en/s/Rt5VcM8a', createdAt: NOW - 9 * 3600_000, expiresAt: h(14.8), count: 42 },
    { kind: 'dscan', url: 'https://capsuleers.app/en/s/Yh2NdQ6e', createdAt: NOW - 18 * 3600_000, expiresAt: h(5.6), count: 133 },
  ];

  const noop = () => {};
  const share = (kind, count) => async () => ({ id: 'demo', url: `https://capsuleers.app/en/s/${kind === 'dscan' ? 'Bn7ZxLp4' : 'k3Qw9xT2'}`, expiresAt: h(23.99), pilotCount: count, copied: true });
  window.capsuleers = {
    appVersion: async () => '0.1.0',
    data: { wipeAll: async () => {} },
    clipboard: { write: async () => {} },
    win: { minimize: noop, maximize: noop, close: noop, mini: noop, restore: noop, setMinWidth: noop, onState: on('win:state'), onMiniState: on('win:mini-state') },
    local: {
      toggle: async () => {}, state: async () => true, scan: noop, confirm: noop,
      detail: async (who) => detail(who),
      share: share('intel', rows.length),
      shareDScan: share('dscan', dscan.total),
      history: { list: async () => history, clear: async () => {} },
      onDetected: on('detected'), onStart: on('start'), onProgress: on('progress'), onResult: on('result'),
      onDScanStart: on('dscan:start'), onDScanResult: on('dscan:result'),
    },
  };
  // Driven by the screenshot script.
  window.__demo = {
    local: () => fire('result', { rows, total: rows.length, resolved: rows.length, capped: false, source: 'capsuleers' }),
    dscan: () => fire('dscan:result', dscan),
  };
})();
