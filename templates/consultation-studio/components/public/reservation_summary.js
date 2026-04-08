import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_summary',
  area: 'public',
  selectData({ reservation }) {
    return {
      summary: reservation.summary,
      lookup: reservation.lookup
    };
  }
});
