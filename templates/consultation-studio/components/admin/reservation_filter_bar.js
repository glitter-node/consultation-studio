import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_filter_bar',
  area: 'admin',
  selectData({ admin }) {
    return {
      reservations: admin.reservations
    };
  }
});
