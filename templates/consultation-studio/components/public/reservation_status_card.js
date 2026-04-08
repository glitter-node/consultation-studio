import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_status_card',
  area: 'public',
  selectData({ reservation }) {
    return {
      lookup: reservation.lookup,
      state: reservation.state
    };
  }
});
