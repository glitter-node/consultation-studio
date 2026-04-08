import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_detail_card',
  area: 'admin',
  selectData({ admin }) {
    return {
      reservationDetail: admin.reservation_detail
    };
  }
});
