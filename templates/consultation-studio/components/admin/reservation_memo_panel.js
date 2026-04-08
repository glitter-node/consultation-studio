import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'reservation_memo_panel',
  area: 'admin',
  selectData({ admin }) {
    return {
      reservationDetail: admin.reservation_detail
    };
  }
});
