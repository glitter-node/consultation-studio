import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'action_bar',
  area: 'admin',
  selectData({ admin }) {
    return {
      reservations: admin.reservations,
      reservationDetail: admin.reservation_detail
    };
  }
});
