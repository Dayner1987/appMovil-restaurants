export default {
  routes: [
    { method: 'GET', path: '/employee-shifts/mine/current', handler: 'employee-shift.current' },
    { method: 'POST', path: '/employee-shifts/mine/open', handler: 'employee-shift.open' },
    { method: 'POST', path: '/employee-shifts/mine/close', handler: 'employee-shift.close' },
  ].map(route => ({ ...route, config: { auth: { scope: [] } } })),
};
