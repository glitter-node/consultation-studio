import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'date_picker',
  area: 'public',
  selectData({ reservation }) {
    return {
      availableDates: reservation.available_dates
    };
  }
});
