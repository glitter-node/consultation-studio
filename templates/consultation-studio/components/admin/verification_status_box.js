import { createBlockComponent } from '../../assets/js/block-registry.js';

export default createBlockComponent({
  id: 'verification_status_box',
  area: 'admin',
  selectData({ admin }) {
    return {
      reservationDetail: admin.reservation_detail
    };
  }
});
