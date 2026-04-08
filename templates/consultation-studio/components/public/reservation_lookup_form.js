import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_lookup_form',
  area: 'public',
  selectData({ reservation }) {
    return {
      lookup: reservation.lookup
    };
  }
});
