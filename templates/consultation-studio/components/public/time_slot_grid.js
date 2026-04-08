import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'time_slot_grid',
  area: 'public',
  selectData({ reservation }) {
    return {
      availableSlots: reservation.available_slots
    };
  }
});
